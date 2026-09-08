import type { MetadataRoute } from 'next';
import { getKajianList, getMasjidList, getArtikelList } from '@/lib/wordpress';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://banten-mengaji.vercel.app';

  // Ambil data dinamis dari WP API
  const [kajianList, masjidList, artikelList] = await Promise.all([
    getKajianList(),
    getMasjidList(),
    getArtikelList(),
  ]);

  const dynamicKajian = kajianList.map((kajian) => ({
    url: `${baseUrl}/jadwal-kajian/${kajian.slug}`,
    lastModified: new Date((kajian as any).modified || kajian.date || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const dynamicMasjid = masjidList.map((masjid) => ({
    url: `${baseUrl}/masjid/${masjid.slug}`,
    lastModified: new Date((masjid as any).modified || (masjid as any).date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const dynamicArtikel = artikelList.map((artikel) => ({
    url: `${baseUrl}/artikel/${artikel.slug}`,
    lastModified: new Date((artikel as any).modified || artikel.date || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    '',
    '/jadwal-kajian',
    '/masjid',
    '/artikel',
    '/jadwal-sholat',
    '/daftar-dkm',
    '/donasi',
    '/kebijakan-privasi',
    '/syarat-ketentuan',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1 : 0.9,
  }));

  return [...staticRoutes, ...dynamicKajian, ...dynamicMasjid, ...dynamicArtikel];
}
