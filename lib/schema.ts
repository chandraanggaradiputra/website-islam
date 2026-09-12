// lib/schema.ts
import { WPKajian, WPMasjid, WPArtikel, formatKategoriJamaah } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://banten-mengaji.vercel.app';

/**
 * Skema Global Organisasi & Website
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Banten Mengaji',
    url: BASE_URL,
    description: 'Portal Informasi Direktori Masjid & Jadwal Kajian Islam Bermanhaj Salaf se-Provinsi Banten',
    inLanguage: 'id-ID',
    publisher: {
      '@type': 'Organization',
      name: 'Banten Mengaji',
      url: BASE_URL,
      logo: `${BASE_URL}/banten-mengaji.jpeg`,
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Provinsi Banten',
      },
    },
  };
}

/**
 * Skema Jadwal Kajian (Event)
 */
export function getKajianJsonLd(kajian: WPKajian, masjid?: WPMasjid | null) {
  const masjidName =
    masjid?.title?.rendered ||
    (typeof kajian.acf?.masjid_terkait === 'object' && kajian.acf.masjid_terkait !== null
      ? (kajian.acf.masjid_terkait as any).title?.rendered
      : 'Masjid di Banten');

  const masjidAddress = masjid?.acf?.alamat_lengkap || 'Provinsi Banten, Indonesia';

  // Format tanggal ISO jika tersedia
  const startDate = kajian.acf?.tanggal_kajian
    ? `${kajian.acf.tanggal_kajian}T${kajian.acf.jam_mulai || '18:30'}:00+07:00`
    : undefined;

  const endDate =
    kajian.acf?.tanggal_kajian && kajian.acf?.jam_selesai
      ? `${kajian.acf.tanggal_kajian}T${kajian.acf.jam_selesai}:00+07:00`
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: kajian.title?.rendered || 'Jadwal Kajian Islam',
    description: `Kajian Islam ilmiah membahas ${kajian.acf?.kitab_bahasan || 'ilmu syar\'i'} bersama ${kajian.acf?.nama_ustadz || 'Asatidz'} di ${masjidName}. Terbuka untuk jamaah ${formatKategoriJamaah(kajian.acf?.kategori_jamaah)}.`,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus:
      kajian.acf?.status_kajian === 'libur'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: masjidName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: masjidAddress,
        addressRegion: 'Banten',
        addressCountry: 'ID',
      },
      ...(masjid?.acf?.google_maps_url ? { hasMap: masjid.acf.google_maps_url } : {}),
    },
    performer: {
      '@type': 'Person',
      name: kajian.acf?.nama_ustadz || 'Ustadz',
    },
    organizer: {
      '@type': 'Organization',
      name: `DKM ${masjidName}`,
      url: BASE_URL,
    },
    isAccessibleForFree: true,
  };
}

/**
 * Skema Direktori Masjid (PlaceOfWorship)
 */
export function getMasjidJsonLd(masjid: WPMasjid) {
  const cleanDesc = masjid.content?.rendered?.replace(/<[^>]*>/g, '').trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'PlaceOfWorship',
    name: masjid.title?.rendered || 'Masjid',
    description: cleanDesc || `Profil dan informasi kegiatan dakwah di ${masjid.title?.rendered}.`,
    url: `${BASE_URL}/masjid/${masjid.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: masjid.acf?.alamat_lengkap || 'Provinsi Banten',
      addressRegion: 'Banten',
      addressCountry: 'ID',
    },
    ...(masjid.acf?.no_wa_dkm ? { telephone: masjid.acf.no_wa_dkm } : {}),
    ...(masjid.acf?.google_maps_url ? { hasMap: masjid.acf.google_maps_url } : {}),
    ...(masjid.featured_media_url ? { image: masjid.featured_media_url } : {}),
  };
}

/**
 * Skema Panduan DKM (HowTo)
 */
export function getPanduanDkmJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Panduan Layanan & Dasbor DKM Masjid Banten Mengaji',
    description: 'Tata cara pendaftaran masjid dan pengelolaan jadwal kajian Islam di portal Banten Mengaji.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Langkah 1: Registrasi Masjid & DKM',
        text: 'Mengisi formulir pendaftaran akun pengurus dan data masjid di halaman pendaftaran.',
        url: `${BASE_URL}/daftar-dkm`,
      },
      {
        '@type': 'HowToStep',
        name: 'Langkah 2: Verifikasi Administrator',
        text: 'Administrator Banten Mengaji memvalidasi kelayakan profil masjid demi menjaga akurasi informasi.',
      },
      {
        '@type': 'HowToStep',
        name: 'Langkah 3: Akses Dasbor & Login',
        text: 'Pengurus masuk menggunakan email dan password terdaftar untuk mengelola profil dan jadwal.',
        url: `${BASE_URL}/login`,
      },
      {
        '@type': 'HowToStep',
        name: 'Langkah 4: Publikasi Jadwal Kajian',
        text: 'Menginput jadwal kajian rutin atau tematik (jam, pemateri, kitab, dan poster).',
        url: `${BASE_URL}/dashboard/dkm`,
      },
      {
        '@type': 'HowToStep',
        name: 'Langkah 5: Syiar Otomatis ke Jamaah',
        text: 'Jadwal kajian otomatis terbit di beranda, direktori kajian, serta terindeks oleh mesin pencari AI.',
      },
    ],
  };
}

// 4. Schema Artikel (Tetap Dipertahankan)
export function generateArtikelSchema(artikel: WPArtikel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: artikel.title.rendered,
    datePublished: artikel.date,
    image: artikel.featured_media_url ? [artikel.featured_media_url] : [],
    author: {
      '@type': 'Person',
      name: artikel.author_name || 'Redaksi Banten Mengaji',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Banten Mengaji',
    },
  };
}