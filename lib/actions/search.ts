'use server';

import { SearchResultItem } from '@/types';

const WP_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const encodedQuery = encodeURIComponent(query.trim());

  try {
    const [kajianRes, masjidRes, artikelRes] = await Promise.allSettled([
      fetch(`${WP_BASE_URL}/kajian?search=${encodedQuery}&per_page=5&_embed`),
      fetch(`${WP_BASE_URL}/masjid?search=${encodedQuery}&per_page=5&_embed`),
      fetch(`${WP_BASE_URL}/posts?search=${encodedQuery}&per_page=5&_embed`),
    ]);

    const results: SearchResultItem[] = [];

    // Process Kajian
    if (kajianRes.status === 'fulfilled' && kajianRes.value.ok) {
      const data = await kajianRes.value.json();
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          results.push({
            id: item.id,
            title: item.title?.rendered || 'Kajian Tanpa Judul',
            subtitle: item.acf?.nama_ustadz || 'Ustadz tidak diketahui',
            category: 'kajian',
            url: `/jadwal-kajian/${item.slug}`,
            badgeText: 'Kajian',
          });
        });
      }
    }

    // Process Masjid
    if (masjidRes.status === 'fulfilled' && masjidRes.value.ok) {
      const data = await masjidRes.value.json();
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          results.push({
            id: item.id,
            title: item.title?.rendered || 'Masjid Tanpa Nama',
            subtitle: item.acf?.alamat_lengkap || 'Alamat tidak tersedia',
            category: 'masjid',
            url: `/masjid/${item.slug}`,
            badgeText: 'Masjid',
          });
        });
      }
    }

    // Process Artikel
    if (artikelRes.status === 'fulfilled' && artikelRes.value.ok) {
      const data = await artikelRes.value.json();
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const author = Array.isArray(item._embedded?.author) && item._embedded.author.length > 0 
            ? item._embedded.author[0].name 
            : 'Admin';
            
          results.push({
            id: item.id,
            title: item.title?.rendered || 'Artikel Tanpa Judul',
            subtitle: author,
            category: 'artikel',
            url: `/artikel/${item.slug}`,
            badgeText: 'Artikel',
          });
        });
      }
    }

    return results;

  } catch (error: unknown) {
    console.error('Global search error:', error);
    return [];
  }
}
