import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

/**
 * PS+ Catalog API
 *
 * Fetches the current PlayStation Plus game catalog from Sony's public
 * GraphQL endpoint (the same one the PS Store website uses).
 *
 * Flow:
 * 1. Hit web.np.playstation.com GraphQL with categoryGridRetrieve query
 * 2. Paginate through all results (100 per page)
 * 3. Filter to FULL_GAME only (skip bundles, add-ons, premium editions)
 * 4. Extract name, image, platforms, and PS+ tier
 *
 * Results are cached in-memory for 24 hours.
 */

const PSN_GRAPHQL_URL = 'https://web.np.playstation.com/api/graphql/v1/op';
const CATEGORY_ID = '3a7006fe-e26f-49fe-87e5-4473d7ed0fb2';
const PERSISTED_QUERY_HASH = '4ce7d410a4db2c8b635a48c1dcec375906ff63b19dadd87e073f8fd0c0481d35';
const PAGE_SIZE = 100;

// In-memory cache
let cachedCatalog: PSPlusGame[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface PSPlusGame {
  productId: string;
  name: string;
  imageUrl: string;
  description: string;
  genres: string[];
  platforms: string[];
  tier: string;
}

/** Pick the best image URL from a product's media array */
function pickImageUrl(media: Array<{ role: string; url: string }> | undefined): string {
  if (!media || media.length === 0) return '';

  const priority = ['GAMEHUB_COVER_ART', 'PORTRAIT_BANNER', 'FOUR_BY_THREE_BANNER', 'MASTER'];
  for (const role of priority) {
    const match = media.find((m) => m.role === role);
    if (match?.url) return match.url;
  }
  // Fallback to first available image
  return media[0]?.url || '';
}

/** Extract PS+ tier from price upsell text */
function extractTier(product: Record<string, unknown>): string {
  // The tier info lives in price.upsellText, e.g. "Extra", "Premium"
  const price = product.price as Record<string, unknown> | undefined;
  if (price?.upsellText && typeof price.upsellText === 'string') {
    return price.upsellText;
  }
  // Some products may have it nested differently
  const upsellText = product.upsellText as string | undefined;
  if (upsellText) return upsellText;
  return '';
}

/** Extract platform names from product */
function extractPlatforms(product: Record<string, unknown>): string[] {
  const platforms: string[] = [];
  const platformValues = product.platforms as string[] | undefined;
  if (Array.isArray(platformValues)) {
    return platformValues;
  }
  // Some responses nest platforms differently
  const skus = product.skus as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(skus)) {
    for (const sku of skus) {
      const skuPlatforms = sku.platforms as string[] | undefined;
      if (Array.isArray(skuPlatforms)) {
        for (const p of skuPlatforms) {
          if (!platforms.includes(p)) platforms.push(p);
        }
      }
    }
  }
  return platforms;
}

/** Fetch a single page of PS+ catalog results */
async function fetchPage(offset: number): Promise<{
  products: Record<string, unknown>[];
  totalCount: number;
}> {
  const variables = JSON.stringify({
    id: CATEGORY_ID,
    pageArgs: { size: PAGE_SIZE, offset },
    sortBy: { name: 'productReleaseDate', isAscending: false },
  });

  const extensions = JSON.stringify({
    persistedQuery: {
      version: 1,
      sha256Hash: PERSISTED_QUERY_HASH,
    },
  });

  const params = new URLSearchParams({
    operationName: 'categoryGridRetrieve',
    variables,
    extensions,
  });

  const url = `${PSN_GRAPHQL_URL}?${params.toString()}`;

  const res = await fetchWithTimeout(url, {
    headers: {
      'x-psn-store-locale-override': 'en-US',
      'content-type': 'application/json',
    },
  });

  if (res.status === 429) {
    throw new Error('RATE_LIMITED');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`PSN GraphQL fetch failed (offset ${offset}): ${res.status} — ${text}`);
    throw new Error(`PSN_FETCH_FAILED:${res.status}`);
  }

  const data = await res.json();

  // Check for GraphQL-level errors
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    const message = firstError?.message || 'Unknown GraphQL error';
    // Persisted query hash rotation shows up as a specific error
    if (
      message.includes('PersistedQueryNotFound') ||
      message.includes('persisted')
    ) {
      throw new Error('HASH_ROTATED');
    }
    console.error('PSN GraphQL errors:', JSON.stringify(data.errors));
    throw new Error(`GRAPHQL_ERROR:${message}`);
  }

  const categoryGrid = data?.data?.categoryGridRetrieve;
  if (!categoryGrid) {
    throw new Error('UNEXPECTED_RESPONSE');
  }

  return {
    products: (categoryGrid.products as Record<string, unknown>[]) || [],
    totalCount: (categoryGrid.totalCount as number) || 0,
  };
}

async function buildCatalog(): Promise<PSPlusGame[]> {
  // First page — also tells us the total count
  const firstPage = await fetchPage(0);
  const totalCount = firstPage.totalCount;
  let allProducts = [...firstPage.products];

  // Fetch remaining pages in parallel
  if (totalCount > PAGE_SIZE) {
    const remainingPages = Math.ceil((totalCount - PAGE_SIZE) / PAGE_SIZE);
    const pagePromises: Promise<{ products: Record<string, unknown>[]; totalCount: number }>[] = [];

    for (let i = 1; i <= remainingPages; i++) {
      pagePromises.push(fetchPage(i * PAGE_SIZE));
    }

    const pages = await Promise.all(pagePromises);
    for (const page of pages) {
      allProducts.push(...page.products);
    }
  }

  // Filter to full games only and map to our shape
  const games: PSPlusGame[] = [];

  for (const product of allProducts) {
    try {
      // Filter: only FULL_GAME
      const classification = product.webctas as unknown;
      const storeDisplayClassification = product.storeDisplayClassification as string | undefined;

      if (
        storeDisplayClassification &&
        storeDisplayClassification !== 'FULL_GAME'
      ) {
        continue;
      }

      const name = product.name as string | undefined;
      if (!name) continue;

      const id = (product.id as string) || '';
      const media = product.media as Array<{ role: string; url: string }> | undefined;
      const imageUrl = pickImageUrl(media);
      const platforms = extractPlatforms(product);
      const tier = extractTier(product);

      games.push({
        productId: id,
        name,
        imageUrl,
        description: '',
        genres: [],
        platforms,
        tier,
      });
    } catch (e) {
      // Skip malformed products
      console.error('Failed to parse PS+ product:', e);
    }
  }

  // Sort alphabetically
  return games.sort((a, b) => a.name.localeCompare(b.name));
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
        { error: 'Could not fetch PS+ catalog. PlayStation might be having a moment.' },
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
    const message = err instanceof Error ? err.message : String(err);

    if (message === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'PlayStation Store rate limit hit. Try again in a few minutes.' },
        { status: 429 }
      );
    }

    if (message === 'HASH_ROTATED') {
      return NextResponse.json(
        {
          error:
            'PlayStation Store persisted query hash has rotated. The PS+ catalog endpoint needs an updated sha256 hash.',
        },
        { status: 502 }
      );
    }

    if (message.startsWith('GRAPHQL_ERROR:')) {
      return NextResponse.json(
        { error: `PlayStation GraphQL error: ${message.replace('GRAPHQL_ERROR:', '')}` },
        { status: 502 }
      );
    }

    console.error('PS+ API error:', err);
    Sentry.captureException(err, { tags: { route: 'psplus' } });
    return NextResponse.json(
      { error: 'Failed to fetch PS+ catalog' },
      { status: 500 }
    );
  }
}
