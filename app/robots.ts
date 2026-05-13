import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'Bytespider',
          'Amazonbot',
          'Meta-ExternalAgent',
          'Diffbot',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://inventoryfull.gg/sitemap.xml',
  };
}
