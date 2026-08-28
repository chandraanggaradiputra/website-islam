// types/index.ts

export type JenisKajian = 'rutin' | 'tematik';
export type KategoriJamaah = 'umum' | 'khusus_ikhwan' | 'khusus_akhawat';
export type StatusKajian = 'aktif' | 'libur' | 'selesai';

export interface MasjidACF {
  alamat_lengkap: string;
  google_maps_url: string;
  no_wa_dkm: string;
  nama_kontak_dkm?: string;
  nama_bank?: string;
  nomor_rekening?: string;
  atas_nama_rekening?: string;
  fasilitas?: string[];
  instagram_url?: string;
  youtube_url?: string;
}

export interface WPMasjid {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media_url?: string;
  kecamatan?: number[];
  acf: MasjidACF;
}

export interface KajianACF {
  jenis_kajian: JenisKajian;
  kategori_jamaah: KategoriJamaah;
  nama_ustadz: string;
  kitab_bahasan?: string;
  masjid_terkait: number | WPMasjid;
  hari_kajian?: string;
  tanggal_kajian?: string; // Format: YYYY-MM-DD
  waktu_keterangan: string;
  jam_mulai: string; // HH:mm
  jam_selesai?: string; // HH:mm
  status_kajian: StatusKajian;
  link_streaming?: string;
}

export interface WPKajian {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media_url?: string;
  kategori_kajian?: number[];
  acf: KajianACF;
}

export interface WPArtikel {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media_url?: string;
  categories?: number[];
  author_name?: string;
}

export interface PrayerTimeItem {
  name: string;
  time: string; // HH:mm
  isPassed: boolean;
  isNext: boolean;
}