import { MetadataRoute } from 'next';

/**
 * Konfigurasi Web App Manifest untuk Progressive Web App (PWA) Banten Mengaji
 * Memungkinkan instalasi native di Android, iOS, dan Desktop browser.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Banten Mengaji - Pusat Kajian Sunnah Banten',
    short_name: 'Banten Mengaji',
    description: 'Platform Jadwal Kajian Sunnah & Direktori Masjid di Banten',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#093c96',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
