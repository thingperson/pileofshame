import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import Wordmark from '@/components/Wordmark';
import { DISCORD_INVITE_URL } from '@/lib/social';
import { findArchetypeBySlug, ARCHETYPE_REGISTRY } from '@/lib/archetypeRegistry';

export const dynamicParams = false;

export function generateStaticParams() {
  return ARCHETYPE_REGISTRY.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = findArchetypeBySlug(slug);
  if (!a) return { title: 'Archetype not found | Inventory Full' };

  // OG image is co-located at /archetype/[slug]/opengraph-image.tsx and Next
  // wires it into og:image automatically. We only set title/description here.
  // Add a CTA suffix to the description so it pushes the unfurl above the
  // 110-char "good" threshold and tells the reader what to do next.
  const ctaTitle = `I'm ${a.title}. What's your gaming archetype?`;
  const ctaDescription = `${a.flavor} Find yours at inventoryfull.gg. Free, no signup.`;

  return {
    title: `${a.title} | Inventory Full`,
    description: ctaDescription,
    openGraph: {
      title: ctaTitle,
      description: ctaDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ctaTitle,
      description: ctaDescription,
    },
  };
}

export default async function ArchetypePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = findArchetypeBySlug(slug);
  if (!a) notFound();

  const toneColor =
    a.tone === 'roast' ? 'var(--color-accent-pink)'
    : a.tone === 'respect' ? 'var(--color-accent-purple)'
    : 'var(--color-text-muted)';

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-16">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" aria-label="Inventory Full">
            <Wordmark width={140} />
          </Link>
          <Link
            href="/about"
            className="text-xs font-[family-name:var(--font-mono)] hover:text-accent-purple transition-colors"
            style={{ color: 'var(--color-text-faint)' }}
          >
            About
          </Link>
        </div>

        <div
          className="rounded-2xl border p-8 sm:p-12 text-center"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <p
            className="mb-3 text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest"
            style={{ color: toneColor }}
          >
            Player archetype
          </p>

          <h1
            className="text-3xl sm:text-4xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {a.title}
          </h1>

          <div className="flex justify-center mb-8">
            <Image
              src={`/sprites/h2/${a.spriteKey}.png`}
              alt={a.title}
              width={256}
              height={256}
              priority
              style={{
                width: 256,
                height: 256,
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 8px 32px ${a.tone === 'roast' ? 'rgba(255, 90, 138, 0.25)' : a.tone === 'respect' ? 'rgba(167, 139, 250, 0.25)' : 'rgba(26, 226, 192, 0.25)'})`,
              }}
            />
          </div>

          <p
            className="text-base sm:text-lg leading-relaxed max-w-md mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {a.flavor}
          </p>
        </div>

        <div className="mt-10 text-center">
          <p
            className="text-xs mb-5 font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Find out which one you are.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
              color: '#fff',
              boxShadow: '0 4px 24px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
            }}
          >
            Open Inventory Full
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-text-faint)' }}>
            Discord
          </a>
          <a href="/privacy" className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-text-faint)' }}>
            Privacy
          </a>
          <a href="/terms" className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-text-faint)' }}>
            Terms
          </a>
        </div>
      </div>
    </main>
  );
}
