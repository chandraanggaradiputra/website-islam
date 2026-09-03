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

// Fungsi penggabungan data kajian dengan nama masjid yang akurat
export function enrichKajianWithMasjid(kajianList: unknown[], masjidList: WPMasjid[] = []): WPKajian[] {
  return (kajianList as WPKajian[]).map((kajian) => {
    const raw = kajian.acf?.masjid_terkait as unknown;
    let targetId: number | null = null;

    // Ekstrak ID dari berbagai kemungkinan format ACF
    if (Array.isArray(raw) && raw.length > 0) {
      const first = raw[0];
      targetId = typeof first === 'object' && first !== null 
        ? Number((first as { ID?: number; id?: number }).ID || (first as { ID?: number; id?: number }).id) 
        : Number(first);
    } else if (typeof raw === 'object' && raw !== null) {
      targetId = Number((raw as { ID?: number; id?: number }).ID || (raw as { ID?: number; id?: number }).id);
    } else if (raw) {
      targetId = Number(raw);
    }

    // Cari masjid yang cocok di database
    const matchedMasjid = targetId ? masjidList.find((m) => Number(m.id) === targetId) : null;

    // AMBIL NAMA ASLI ATAU NULL (DILARANG MEMASUKKAN NAMA MASJID DEFAULT PALSU)
    let resolvedName: string | null = null;
    if (matchedMasjid?.title?.rendered) {
      resolvedName = matchedMasjid.title.rendered;
    } else if (typeof raw === 'object' && raw !== null && (raw as { post_title?: string }).post_title) {
      resolvedName = (raw as { post_title: string }).post_title;
    } else if (Array.isArray(raw) && typeof raw[0] === 'object' && raw[0] !== null && (raw[0] as { post_title?: string }).post_title) {
      resolvedName = (raw[0] as { post_title: string }).post_title;
    } else if (kajian.acf?.nama_masjid_manual) {
      resolvedName = kajian.acf.nama_masjid_manual;
    }

    if (kajian.acf) {
      kajian.acf.tanggal_kajian = normalizeACFDate(kajian.acf.tanggal_kajian);
      kajian.acf.hari_kajian = normalizeACFHari(kajian.acf.hari_kajian);
      
      // Standardisasi Terminologi: Normalisasi typo 'khusus_akhawat' dari backend
      if (kajian.acf.kategori_jamaah === ('khusus_akhawat' as unknown)) {
        kajian.acf.kategori_jamaah = 'khusus_akhwat';
      }
    }
    
    kajian.featured_media_url = extractFeaturedImage(kajian) || kajian.featured_media_url;

    return {
      ...kajian,
      masjid_name: resolvedName,
      masjid_detail: matchedMasjid || null,
    };
  });
}

export async function getKajianList(): Promise<WPKajian[]> {
  try {
    const [resKajian, resMasjid] = await Promise.all([
      fetch(`${WP_BASE_URL}/kajian?_embed&per_page=50`, { next: { revalidate: 60 } }),
      fetch(`${WP_BASE_URL}/masjid?_embed&per_page=100`, { next: { revalidate: 60 } })
    ]);

    if (!resKajian.ok) return [];
    
    const listKajian: WPKajian[] = await resKajian.json();
    if (!Array.isArray(listKajian)) return [];

    const listMasjid: WPMasjid[] = resMasjid.ok ? await resMasjid.json() : [];

    return enrichKajianWithMasjid(listKajian, Array.isArray(listMasjid) ? listMasjid : []);
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
      const listMasjid = await getMasjidList();
      const enriched = enrichKajianWithMasjid(data, listMasjid);
      return enriched[0] || null;
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