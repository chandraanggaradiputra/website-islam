# 📖 Dokumentasi Arsitektur Backend Headless WordPress

**Proyek**: Portal Syiar Dakwah Islam Bermanhaj Salaf Kota Serang  
**Arsitektur**: Headless WordPress (CMS/Backend) \+ Next.js 16.3.3 App Router (Frontend)  
**Target Lokasi**: Kota Serang, Banten, Indonesia

---

## 1\. Ikhtisar & Standar REST API

- **Base URL Backend**: `https://salaf.maschandigital.id/wp-json/wp/v2/`  
- **Format Output**: JSON  
- **Konfigurasi Wajib**:  
  - Seluruh Custom Post Type & Taksonomi wajib mengaktifkan `Show in REST API: true`.  
  - Field Group di Advanced Custom Fields (ACF) / Pods wajib mengaktifkan `Show in REST API: true` agar data custom fields muncul pada object `acf` di respon JSON.  
  - Media gambar otomatis dikonversi ke `.webp` via plugin kompresi gambar WordPress.

---

## 2\. Custom Post Type: Direktori Masjid (`masjid`)

### A. Pengaturan CPT

- **Post Type Key / Slug**: `masjid`  
- **REST API Base**: `masjid` (Endpoint: `/wp-json/wp/v2/masjid`)  
- **Supports**: `title` (Nama Masjid), `editor` (Profil/Deskripsi), `thumbnail` (Foto Utama Masjid).

### B. Taksonomi: Kecamatan di Kota Serang (`kecamatan`)

- **Taxonomy Slug**: `kecamatan`  
- **Hierarchical**: `true`  
- **REST API Base**: `kecamatan`  
- **Daftar Term Kecamatan**:  
  1. `Serang`  
  2. `Cipocok Jaya`  
  3. `Kasemen`  
  4. `Taktakan`  
  5. `Walantaka`  
  6. `Curug`

### C. Custom Fields (`acf` object)

| Field Key (Slug) | Tipe Data | Deskripsi & Format |
| :---- | :---- | :---- |
| `alamat_lengkap` | Text Area | Alamat detail jalan, RT/RW, kelurahan |
| `google_maps_url` | URL | Tautan rute resmi Google Maps |
| `no_wa_dkm` | Text | Nomor WhatsApp DKM (Format: `08xxxxxxxxxx`) |
| `nama_kontak_dkm` | Text | Nama pengurus DKM penanggung jawab |
| `nama_bank` | Text | Nama Bank Infaq (contoh: `Bank Syariah Indonesia (BSI)`) |
| `nomor_rekening` | Text | Nomor rekening infaq operasional |
| `atas_nama_rekening` | Text | Nama rekening (contoh: `DKM Masjid Al-Ikhlas Serang`) |
| `fasilitas` | Checkbox / Array | Pilihan: `Parkir Mobil & Motor`, `Tempat Wudhu Terpisah`, `Ruangan Ber-AC`, `Area Khusus Akhawat`, `Perpustakaan Kitab` |
| `instagram_url` | URL | Link akun Instagram resmi DKM (opsional) |
| `youtube_url` | URL | Link channel YouTube streaming (opsional) |

---

## 3\. Custom Post Type: Jadwal Kajian (`kajian`)

### A. Pengaturan CPT

- **Post Type Key / Slug**: `kajian`  
- **REST API Base**: `kajian` (Endpoint: `/wp-json/wp/v2/kajian`)  
- **Supports**: `title` (Judul Kajian / Tema), `editor` (Catatan Tambahan), `thumbnail` (Flyer / Poster).

### B. Taksonomi: Kategori Kajian (`kategori_kajian`)

- **Taxonomy Slug**: `kategori_kajian`  
- **Hierarchical**: `true`  
- **REST API Base**: `kategori_kajian`  
- **Daftar Term Kategori**:  
  1. `Kajian Rutin Pekanan`  
  2. `Kajian Rutin Bulanan`  
  3. `Tabligh Akbar / Tematik`  
  4. `Kajian Khusus Akhawat`  
  5. `Kajian Bahasa Arab & Tajwid`

### C. Custom Fields (`acf` object)

| Field Key (Slug) | Tipe Data | Deskripsi & Pilihan Nilai |
| :---- | :---- | :---- |
| `jenis_kajian` | Radio Button | `rutin` (Kajian Rutin) | `tematik` (Kajian Tematik / Akbar) |
| `kategori_jamaah` | Radio Button | `umum` (Ikhwan & Akhawat) | `khusus_ikhwan` | `khusus_akhawat` |
| `nama_ustadz` | Text | Nama lengkap asatidz pengisi materi (contoh: `Ustadz Abu Fulan, Lc.`) |
| `kitab_bahasan` | Text | Judul kitab yang dibahas (contoh: `Kitab Tauhid`, `Bulughul Maram`) |
| `masjid_terkait` | Post Object / ID | Relasi ke CPT `masjid` (ID atau Object Post Masjid) |
| `hari_kajian` | Select | `Senin` | `Selasa` | `Rabu` | `Kamis` | `Jumat` | `Sabtu` | `Ahad` |
| `tanggal_kajian` | Date Picker | Format: `Y-m-d` (Wajib untuk kajian tematik / tanggal spesifik) |
| `waktu_keterangan` | Text | Keterangan waktu (contoh: `Ba'da Maghrib s/d Isya`, `Pukul 09.00 WIB`) |
| `jam_mulai` | Time Picker | Format: `H:i` (contoh: `18:30` \- untuk integrasi Google Calendar) |
| `jam_selesai` | Time Picker | Format: `H:i` (contoh: `20:00` \- untuk integrasi Google Calendar) |
| `status_kajian` | Select | `aktif` (Berjalan) | `libur` (Diliburkan) | `selesai` (Arsip) |
| `link_streaming` | URL | Link live streaming YouTube/Facebook/Zoom (opsional) |

---

## 4\. Post Standar WordPress: Artikel & Faedah (`posts`)

- **Endpoint**: `/wp-json/wp/v2/posts?_embed`  
- **Kategori Bawaan**:  
  - `Aqidah & Manhaj`  
  - `Fiqih & Ibadah`  
  - `Tazkiyatun Nufus & Adab`  
  - `Tafsir & Hadits`  
  - `Faedah Singkat`  
- **Format Konten**: Menggunakan Gutenberg Block Editor dengan styling pendukung typography Arab & Tailwind Typography (`prose`).

---

## 5\. Kontrak Tipe Data TypeScript (Frontend Next.js 16.3.3)

// types/wordpress.ts

export type JenisKajian \= 'rutin' | 'tematik';

export type KategoriJamaah \= 'umum' | 'khusus\_ikhwan' | 'khusus\_akhawat';

export type StatusKajian \= 'aktif' | 'libur' | 'selesai';

export interface MasjidACF {

  alamat\_lengkap: string;

  google\_maps\_url: string;

  no\_wa\_dkm: string;

  nama\_kontak\_dkm: string;

  nama\_bank: string;

  nomor\_rekening: string;

  atas\_nama\_rekening: string;

  fasilitas: string\[\];

  instagram\_url?: string;

  youtube\_url?: string;

}

export interface WPMasjid {

  id: number;

  slug: string;

  title: { rendered: string };

  content: { rendered: string };

  featured\_media\_url?: string;

  kecamatan: number\[\]; // ID Term Kecamatan

  acf: MasjidACF;

}

export interface KajianACF {

  jenis\_kajian: JenisKajian;

  kategori\_jamaah: KategoriJamaah;

  nama\_ustadz: string;

  kitab\_bahasan: string;

  masjid\_terkait: number | WPMasjid;

  hari\_kajian?: string;

  tanggal\_kajian?: string; // YYYY-MM-DD

  waktu\_keterangan: string;

  jam\_mulai: string; // HH:mm

  jam\_selesai: string; // HH:mm

  status\_kajian: StatusKajian;

  link\_streaming?: string;

}

export interface WPKajian {

  id: number;

  slug: string;

  title: { rendered: string };

  content: { rendered: string };

  featured\_media\_url?: string;

  kategori\_kajian: number\[\];

  acf: KajianACF;

}

export interface WPArtikel {

  id: number;

  slug: string;

  date: string;

  title: { rendered: string };

  content: { rendered: string };

  excerpt: { rendered: string };

  featured\_media\_url?: string;

  categories: number\[\];

  author\_name?: string;

}  
