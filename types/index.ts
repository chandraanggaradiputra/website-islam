// types/index.ts

export * from './prayer';

export type UserRole = 'admin' | 'dkm';

export interface UserSession {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  masjidId?: number;
  masjidName?: string;
  token?: string;
}

export interface DKMRegistrationPayload {
  namaPengurus: string;
  email: string;
  noWhatsapp: string;
  masjidOption: string; // 'NEW_MASJID' or mosque ID string
  masjidId?: number;
  isNewMasjid?: boolean;
  namaMasjidBaru?: string;
  kecamatan?: number;
  kecamatanNama?: string;
  alamatMasjid?: string;
  googleMapsUrl?: string;
  fasilitas?: string[];
  namaBank?: string;
  nomorRekening?: string;
  atasNamaRekening?: string;
  catatan?: string;
}

export interface DKMRegistrationApplication {
  id: string | number;
  date: string;
  namaPengurus: string;
  email: string;
  noWhatsapp: string;
  masjidId?: number;
  masjidName?: string;
  isNewMasjid: boolean;
  newMasjidData?: {
    namaMasjid: string;
    kecamatanId?: number;
    kecamatanName?: string;
    alamatLengkap: string;
    googleMapsUrl?: string;
    fasilitas?: string[];
    namaBank?: string;
    nomorRekening?: string;
    atasNamaRekening?: string;
  };
  catatan?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdMasjidId?: number;
}

export type JenisKajian = 'rutin' | 'tematik';
export type KategoriJamaah = 'umum' | 'khusus_ikhwan' | 'khusus_akhwat';
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
  status?: 'publish' | 'pending' | 'draft' | 'future' | 'private' | 'trash';
  title: { rendered: string };
  content: { rendered: string };
  featured_media?: number;
  featured_media_url?: string;
  kecamatan?: number[];
  acf: MasjidACF;
  post_title?: string;
  post_name?: string;
  author?: number;
  _embedded?: {
    author?: { name: string; id?: number }[];
    'wp:featuredmedia'?: Array<{ source_url?: string; id?: number }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
    [key: string]: unknown;
  };
}

export interface KajianACF {
  jenis_kajian: JenisKajian;
  kategori_jamaah: KategoriJamaah;
  nama_ustadz: string;
  kitab_bahasan?: string;
  masjid_terkait: number | WPMasjid;
  nama_masjid_manual?: string;
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
  date?: string;
  status?: 'publish' | 'pending' | 'draft' | 'future' | 'private' | 'trash';
  title: { rendered: string };
  content: { rendered: string };
  featured_media_url?: string;
  kategori_kajian?: number[];
  acf: KajianACF;
  masjid_detail?: WPMasjid | null;
  masjid_name?: string | null;
  _embedded?: {
    author?: { name: string }[];
    'wp:featuredmedia'?: unknown[];
    [key: string]: unknown;
  };
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

export type SearchCategory = 'kajian' | 'masjid' | 'artikel';

export interface SearchResultItem {
  id: number;
  title: string;
  subtitle: string;
  category: SearchCategory;
  url: string;
  badgeText: string;
}