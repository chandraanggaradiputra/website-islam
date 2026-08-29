import { WPKajian, WPMasjid, WPArtikel } from '@/types';

const WP_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';

export function extractFeaturedImage(post: unknown): string | null {
  const p = post as { 
    _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }> };
    featured_media_url?: string;
  };
  if (p._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return p._embedded['wp:featuredmedia'][0].source_url;
  }
  if (p.featured_media_url) return p.featured_media_url;
  return null;
}

export function normalizeACFDate(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

export function normalizeACFHari(hariStr?: string): string {
  if (!hariStr) return '';
  if (hariStr.includes(':')) {
    return hariStr.split(':')[1]?.trim() || hariStr;
  }
  return hariStr;
}

export async function getKajianList(): Promise<WPKajian[]> {
  try {
    const [resKajian, resMasjid] = await Promise.all([
      fetch(`${WP_BASE_URL}/kajian?_embed&per_page=100`, { next: { revalidate: 60 } }),
      fetch(`${WP_BASE_URL}/masjid?_embed&per_page=100`, { next: { revalidate: 60 } })
    ]);

    if (!resKajian.ok) return [];
    const listKajian: WPKajian[] = await resKajian.json();
    const listMasjid: WPMasjid[] = resMasjid.ok ? await resMasjid.json() : [];

    return listKajian.map((kajian) => {
      const terkait = kajian.acf?.masjid_terkait;
      let masjidId = Number(terkait);
      if (typeof terkait === 'object' && terkait !== null) {
        masjidId = Number((terkait as { ID?: number }).ID || (terkait as { id?: number }).id);
      }

      const matchedMasjid = listMasjid.find((m) => Number(m.id) === Number(masjidId));
      
      if (kajian.acf) {
        kajian.acf.tanggal_kajian = normalizeACFDate(kajian.acf.tanggal_kajian);
        kajian.acf.hari_kajian = normalizeACFHari(kajian.acf.hari_kajian);
      }
      
      kajian.featured_media_url = extractFeaturedImage(kajian) || kajian.featured_media_url;

      return {
        ...kajian,
        masjid_detail: matchedMasjid || null,
      };
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching Kajian list:', err.message);
    }
    return [];
  }
}

export async function getKajianBySlug(slug: string): Promise<WPKajian | null> {
  try {
    const res = await fetch(`${WP_BASE_URL}/kajian?slug=${slug}&_embed`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data: WPKajian[] = await res.json();
    if (data.length > 0) {
      const kajian = data[0];
      const terkait = kajian.acf?.masjid_terkait;
      let masjidId = Number(terkait);
      if (typeof terkait === 'object' && terkait !== null) {
        masjidId = Number((terkait as { ID?: number }).ID || (terkait as { id?: number }).id);
      }

      const listMasjid = await getMasjidList();
      const matchedMasjid = listMasjid.find((m) => Number(m.id) === Number(masjidId));
      
      if (kajian.acf) {
        kajian.acf.tanggal_kajian = normalizeACFDate(kajian.acf.tanggal_kajian);
        kajian.acf.hari_kajian = normalizeACFHari(kajian.acf.hari_kajian);
      }
      
      kajian.featured_media_url = extractFeaturedImage(kajian) || kajian.featured_media_url;

      return {
        ...kajian,
        masjid_detail: matchedMasjid || null,
      };
    }
    return null;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error fetching Kajian slug ${slug}:`, err.message);
    }
    return null;
  }
}

export async function getMasjidList(): Promise<WPMasjid[]> {
  try {
    const res = await fetch(`${WP_BASE_URL}/masjid?_embed&per_page=100`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data: WPMasjid[] = await res.json();
    return data.map(masjid => {
      masjid.featured_media_url = extractFeaturedImage(masjid) || masjid.featured_media_url;
      return masjid;
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching Masjid list:', err.message);
    }
    return [];
  }
}

export async function getMasjidBySlug(slug: string): Promise<WPMasjid | null> {
  try {
    const res = await fetch(`${WP_BASE_URL}/masjid?slug=${slug}&_embed`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data: WPMasjid[] = await res.json();
    if (data.length > 0) {
      const masjid = data[0];
      masjid.featured_media_url = extractFeaturedImage(masjid) || masjid.featured_media_url;
      return masjid;
    }
    return null;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error fetching Masjid slug ${slug}:`, err.message);
    }
    return null;
  }
}

export async function getArtikelList(): Promise<WPArtikel[]> {
  try {
    const res = await fetch(`${WP_BASE_URL}/posts?_embed&per_page=10`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data: WPArtikel[] = await res.json();
    return data.map(artikel => {
      artikel.featured_media_url = extractFeaturedImage(artikel) || artikel.featured_media_url;
      return artikel;
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching Artikel list:', err.message);
    }
    return [];
  }
}

export async function getArtikelBySlug(slug: string): Promise<WPArtikel | null> {
  try {
    const res = await fetch(`${WP_BASE_URL}/posts?slug=${slug}&_embed`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data: WPArtikel[] = await res.json();
    if (data.length > 0) {
      const artikel = data[0];
      artikel.featured_media_url = extractFeaturedImage(artikel) || artikel.featured_media_url;
      return artikel;
    }
    return null;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error fetching Artikel slug ${slug}:`, err.message);
    }
    return null;
  }
}

export async function getKecamatanList(): Promise<{ id: number; name: string }[]> {
  try {
    const res = await fetch(`${WP_BASE_URL}/kecamatan?per_page=100`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching Kecamatan list:', err.message);
    }
    return [];
  }
}