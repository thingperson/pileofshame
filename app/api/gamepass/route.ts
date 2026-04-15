import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

/**
 * Game Pass Catalog API
 *
 * Fetches the current Game Pass catalog directly from Microsoft's public
 * catalog endpoints (the same ones the Xbox app and store use).
 *
 * Flow:
 * 1. Hit catalog.gamepass.com to get product IDs for PC + Console lists
 * 2. Hit displaycatalog.mp.microsoft.com to get full product details
 * 3. Merge, dedupe, and return clean JSON
 *
 * Results are cached in-memory for 24 hours (the catalog doesn't change hourly).
 */

// Microsoft's Game Pass list IDs
const GAMEPASS_LIST_IDS = {
  pc: 'f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e',
  console: 'b8900d09-a491-44cc-916e-32b5acae621b',
};

// In-memory cache
let cachedCatalog: GamePassGame[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface GamePassGame {
  productId: string;
  name: string;
  imageUrl: string;
  description: string;
  genres: string[];
  platforms: ('PC' | 'Console')[];
}

/** Fetch product IDs from a Game Pass catalog list */
async function fetchListIds(listId: string): Promise<string[]> {
  const url = `https://catalog.gamepass.com/sigls/v2?id=${listId}&language=en-us&market=US`;
  const res = await fetchWithTimeout(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    console.error(`Game Pass list fetch failed (${listId}): ${res.status}`);
    return [];
  }

  const data = await res.json();
  // The response is an array of objects. The first item is metadata (no id).
  // Subsequent items have an "id" field which is the product ID.
  return data
    .filter((item: { id?: string }) => item.id)
    .map((item: { id: string }) => item.id);
}

/** Fetch product details from Microsoft's display catalog in batches */
async function fetchProductDetails(productIds: string[]): Promise<Map<string, GamePassGame>> {
  const results = new Map<string, GamePassGame>();
  // Microsoft API accepts up to 20 product IDs per request
  const BATCH_SIZE = 20;

  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    const batch = productIds.slice(i, i + BATCH_SIZE);
    const ids = batch.join(',');
    const url = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${ids}&market=US&languages=en-us&MS-CV=DGU1mcuYo0WMMp`;

    try {
      const res = await fetchWithTimeout(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        console.error(`Display catalog batch fetch failed: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const products = data.Products || [];

      for (const product of products) {
        try {
          const localProps = product.LocalizedProperties?.[0];
          const productProps = product.Properties || {};

          if (!localProps?.ProductTitle) continue;

          // Get the best image (poster/box art preferred, then hero, then any)
          let imageUrl = '';
          const images = localProps.Images || [];
          const poster = images.find((img: { ImagePurpose: string }) =>
            img.ImagePurpose === 'Poster' || img.ImagePurpose === 'BoxArt'
          );
          const hero = images.find((img: { ImagePurpose: string }) =>
            img.ImagePurpose === 'Hero' || img.ImagePurpose === 'SuperHeroArt'
          );
          const tile = images.find((img: { ImagePurpose: string }) =>
            img.ImagePurpose === 'Tile'
          );
          const bestImage = poster || hero || tile || images[0];
          if (bestImage?.Uri) {
            imageUrl = bestImage.Uri.startsWith('//') ? `https:${bestImage.Uri}` : bestImage.Uri;
          }

          // Get description (short or truncated long)
          let description = localProps.ShortDescription || '';
          if (!description && localProps.ProductDescription) {
            description = localProps.ProductDescription.slice(0, 200);
            if (localProps.ProductDescription.length > 200) description += '...';
          }

          // Extract categories/genres from the product
          const categories: string[] = [];
          if (productProps.Categories) {
            // Categories is typically a comma-separated string or array
            const cats = Array.isArray(productProps.Categories)
              ? productProps.Categories
              : typeof productProps.Categories === 'string'
                ? productProps.Categories.split(',').map((c: string) => c.trim())
                : [];
            categories.push(...cats.filter(Boolean));
          }
          // Also check category field on localized props
          if (localProps.Category) {
            const cat = localProps.Category.trim();
            if (cat && !categories.includes(cat)) categories.push(cat);
          }

          const productId = product.ProductId || batch[0];

          results.set(productId, {
            productId,
            name: localProps.ProductTitle,
            imageUrl,
            description,
            genres: categories,
            platforms: [], // filled in by the caller
          });
        } catch (e) {
          // Skip malformed products
          console.error('Failed to parse product:', e);
        }
      }
    } catch (e) {
      console.error('Display catalog fetch error:', e);
    }
  }

  return results;
}

async function buildCatalog(): Promise<GamePassGame[]> {
  // Fetch product IDs for both platforms in parallel
  const [pcIds, consoleIds] = await Promise.all([
    fetchListIds(GAMEPASS_LIST_IDS.pc),
    fetchListIds(GAMEPASS_LIST_IDS.console),
  ]);

  // Combine all unique IDs
  const allIds = [...new Set([...pcIds, ...consoleIds])];

  if (allIds.length === 0) {
    console.error('No Game Pass product IDs returned from catalog');
    return [];
  }

  // Fetch product details
  const products = await fetchProductDetails(allIds);

  // Tag platforms
  for (const id of pcIds) {
    const p = products.get(id);
    if (p && !p.platforms.includes('PC')) p.platforms.push('PC');
  }
  for (const id of consoleIds) {
    const p = products.get(id);
    if (p && !p.platforms.includes('Console')) p.platforms.push('Console');
  }

  // Convert to array and sort alphabetically
  return Array.from(products.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function GET() {
  try {
    // Check cache
    if (cachedCatalog && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json({
        games: cachedCatalog,
        gameCount: cachedCatalog.length,
        cached: true,
      });
    }

    const catalog = await buildCatalog();

    if (catalog.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch Game Pass catalog. Microsoft might be having a moment.' },
        { status: 502 }
      );
    }

    // Cache it
    cachedCatalog = catalog;
    cacheTimestamp = Date.now();

    return NextResponse.json({
      games: catalog,
      gameCount: catalog.length,
      cached: false,
    });
  } catch (err) {
    console.error('Game Pass API error:', err);
    Sentry.captureException(err, { tags: { route: 'gamepass' } });
    return NextResponse.json(
      { error: 'Failed to fetch Game Pass catalog' },
      { status: 500 }
    );
  }
}
