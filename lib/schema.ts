// lib/schema.ts
import { WPKajian, WPMasjid, WPArtikel } from '@/types';
import { normalizeACFDate } from './wordpress';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maschandigital.id';

// 1. Schema Organisasi & Website (Root)
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Syiar Salaf Kota Serang',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Pusat informasi jadwal kajian Islam bermanhaj Salafus Shalih dan direktori masjid di Kota Serang, Banten.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Banten Indah Permai Blok E1 No.12A, Kelurahan Unyur',
      addressLocality: 'Kota Serang',
      addressRegion: 'Banten',
      postalCode: '42111',
      addressCountry: 'ID',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+6282298148474',
      contactType: 'customer service',
      email: 'admin@maschandigital.id',
    },
  };
}

// 2. Schema Event / Kajian
export function generateKajianSchema(kajian: WPKajian) {
  const tanggal = normalizeACFDate(kajian.acf?.tanggal_kajian) || '2026-08-29';
  const jamMulai = kajian.acf?.jam_mulai?.slice(0, 5) || '18:30';
  const jamSelesai = kajian.acf?.jam_selesai?.slice(0, 5) || '20:00';
  const masjid = kajian.masjid_name || kajian.masjid_detail?.title?.rendered || 'Kota Serang';

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: kajian.title.rendered,
    description: kajian.acf?.kitab_bahasan ? `Pembahasan kitab: ${kajian.acf.kitab_bahasan}` : kajian.title.rendered,
    startDate: `${tanggal}T${jamMulai}:00+07:00`,
    endDate: `${tanggal}T${jamSelesai}:00+07:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
    image: kajian.featured_media_url ? [kajian.featured_media_url] : [],
    location: {
      '@type': 'Place',
      name: masjid,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kota Serang',
        addressRegion: 'Banten',
        addressCountry: 'ID',
      },
    },
    performer: {
      '@type': 'Person',
      name: kajian.acf?.nama_ustadz || 'Asatidz Ahlussunnah',
    },
    organizer: {
      '@type': 'Organization',
      name: masjid,
    },
  };
}

// 3. Schema Masjid (PlaceOfWorship)
export function generateMasjidSchema(masjid: WPMasjid) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Mosque',
    name: masjid.title.rendered,
    description: masjid.content?.rendered?.replace(/<[^>]*>?/gm, '').slice(0, 200) || masjid.title.rendered,
    image: masjid.featured_media_url ? [masjid.featured_media_url] : [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: masjid.acf?.alamat_lengkap || 'Kota Serang',
      addressLocality: 'Kota Serang',
      addressRegion: 'Banten',
      addressCountry: 'ID',
    },
    telephone: masjid.acf?.no_wa_dkm || '+6282298148474',
  };
}

// 4. Schema Artikel
export function generateArtikelSchema(artikel: WPArtikel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: artikel.title.rendered,
    datePublished: artikel.date,
    image: artikel.featured_media_url ? [artikel.featured_media_url] : [],
    author: {
      '@type': 'Person',
      name: artikel.author_name || 'Redaksi Syiar Salaf Serang',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Syiar Salaf Kota Serang',
    },
  };
}