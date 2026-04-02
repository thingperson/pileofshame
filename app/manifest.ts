import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inventory Full',
    short_name: 'Inventory Full',
    description: 'Your backlog is full. Your time doesn\'t have to be. Clear space, recover fun.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
