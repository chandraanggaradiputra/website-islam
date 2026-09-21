/**
 * Helper utilitas untuk jadwal kajian
 */

import { decodeHtmlEntities } from '@/lib/utils/text';
import { WPKajian, WPMasjid } from '@/types';
import { enrichKajianWithMasjid } from '@/lib/wordpress';

function extractTime(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }
  return null;
}

/**
 * Memvalidasi apakah kajian tematik telah melewati tanggal & jam pelaksanaannya.
 * Berdasarkan zona waktu Indonesia Barat (WIB / +07:00).
 * Kajian Rutin tanpa tanggal_kajian spesifik tidak pernah kedaluwarsa secara otomatis (return false).
 */
export function isKajianExpired(
  tanggalKajian?: string,
  jamSelesai?: string,
  jamMulai?: string
): boolean {
  if (!tanggalKajian || typeof tanggalKajian !== 'string' || !tanggalKajian.trim()) {
    return false;
  }

  const rawDate = tanggalKajian.trim();
  let dateFormatted = '';

  // Format YYYYMMDD (contoh: 20260908)
  if (/^\d{8}$/.test(rawDate)) {
    dateFormatted = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
  } else {
    // Format YYYY-MM-DD atau YYYY/MM/DD
    const match = rawDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      dateFormatted = `${year}-${month}-${day}`;
    } else {
      dateFormatted = rawDate;
    }
  }

  // Validasi format tanggal YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFormatted)) {
    return false;
  }

  // Dapatkan waktu (prioritas jam_selesai, lalu jam_mulai, fallback akhir hari 23:59)
  const time = extractTime(jamSelesai) || extractTime(jamMulai) || { hours: 23, minutes: 59 };
  const hoursStr = String(time.hours).padStart(2, '0');
  const minutesStr = String(time.minutes).padStart(2, '0');

  // Waktu target di zona WIB (+07:00)
  const targetIso = `${dateFormatted}T${hoursStr}:${minutesStr}:00+07:00`;
  const targetTimestamp = new Date(targetIso).getTime();

  if (isNaN(targetTimestamp)) {
    return false;
  }

  return Date.now() > targetTimestamp;
}

/**
 * Mengekstrak catatan faedah kajian (jika ada) dari ACF catatan_faedah / ringkasan_faedah
 * atau dari konten yang ditandai dengan marker CATATAN_FAEDAH.
 * Mengembalikan string kosong jika belum diisi oleh DKM.
 */
export function getKajianCatatanFaedah(kajian?: {
  content?: { rendered?: string; raw?: string };
  acf?: { catatan_faedah?: string; ringkasan_faedah?: string };
} | null): string {
  if (!kajian) return '';

  if (kajian.acf?.catatan_faedah && typeof kajian.acf.catatan_faedah === 'string' && kajian.acf.catatan_faedah.trim()) {
    return decodeHtmlEntities(kajian.acf.catatan_faedah.trim());
  }

  if (kajian.acf?.ringkasan_faedah && typeof kajian.acf.ringkasan_faedah === 'string' && kajian.acf.ringkasan_faedah.trim()) {
    return decodeHtmlEntities(kajian.acf.ringkasan_faedah.trim());
  }

  const raw = kajian.content?.raw || kajian.content?.rendered || '';
  if (raw.includes('catatan-faedah')) {
    const match = raw.match(/<div class="catatan-faedah">([\s\S]*?)<\/div>/i);
    const contentText = match ? match[1] : raw;
    const stripped = contentText
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    return decodeHtmlEntities(stripped);
  }

  if (raw.includes('<!-- CATATAN_FAEDAH -->')) {
    const parts = raw.split('<!-- CATATAN_FAEDAH -->');
    const afterMarker = parts[1] || '';
    const stripped = afterMarker
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    return decodeHtmlEntities(stripped);
  }

  return '';
}

/**
 * Mengambil daftar kajian yang telah selesai dan memiliki catatan faedah
 * Diurutkan dari tanggal kajian terbaru ke yang terlama.
 */
export async function getKajianFaedahList(): Promise<WPKajian[]> {
  try {
    const WP_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://salaf.maschandigital.id/wp-json/wp/v2';
    const [resKajian, resMasjid] = await Promise.all([
      fetch(`${WP_BASE_URL}/kajian?_embed&per_page=100`, { next: { revalidate: 60 } }),
      fetch(`${WP_BASE_URL}/masjid?_embed&per_page=100`, { next: { revalidate: 60 } }),
    ]);

    if (!resKajian.ok) return [];

    const listKajian: WPKajian[] = await resKajian.json();
    if (!Array.isArray(listKajian)) return [];

    const listMasjid: WPMasjid[] = resMasjid.ok ? await resMasjid.json() : [];
    const enriched = enrichKajianWithMasjid(listKajian, Array.isArray(listMasjid) ? listMasjid : []);

    // Filter secara ketat: hanya ambil kajian yang memiliki catatan faedah valid
    const faedahList = enriched.filter((k) => {
      const faedah = getKajianCatatanFaedah(k);
      return faedah && faedah.trim().length > 0;
    });

    // Urutkan berdasarkan tanggal kajian terbaru (descending)
    faedahList.sort((a, b) => {
      const dateA = a.acf?.tanggal_kajian ? new Date(a.acf.tanggal_kajian).getTime() : 0;
      const dateB = b.acf?.tanggal_kajian ? new Date(b.acf.tanggal_kajian).getTime() : 0;
      return dateB - dateA;
    });

    return faedahList;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching Kajian Faedah list:', err.message);
    }
    return [];
  }
}

