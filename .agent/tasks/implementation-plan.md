# Implementation Plan: [TASK-BM-009] Integrasi Jadwal Shalat MyQuran API (Kemenag RI) & Tampilan Kalender Hijriah

Dokumen ini merupakan rancangan implementasi teknis untuk mengintegrasikan layanan **MyQuran API** (berbasis data resmi Bimas Islam Kementerian Agama Republik Indonesia) serta menyajikan penanggalan **Kalender Hijriah** dinamis berdampingan dengan Kalender Masehi pada portal dakwah Banten Mengaji (merujuk pada GitHub Issue #4).

---

## 1. Konteks Masalah & Sasaran

1. **Ketiadaan Penanggalan Hijriah**:
   Widget jadwal shalat di beranda dan halaman jadwal shalat saat ini belum menampilkan tanggal Kalender Hijriah. Jamaah dan penuntut ilmu sangat memerlukan penanggalan Hijriah untuk memantau waktu ibadah puasa sunnah (Ayyamul Bidh, Senin-Kamis), pergantian bulan hijriah, dan jadwal kajian tematik.
2. **Sinkronisasi Hisab Kemenag RI & HijrahApp**:
   Waktu shalat resmi di Provinsi Banten mengacu pada hisab Bimas Islam Kementerian Agama RI (`bimasislam.kemenag.go.id`) yang juga digunakan sebagai standar acuan aplikasi mobile **HijrahApp** (Yayasan Wasilah Dakwah Sunnah). Integrasi MyQuran API memastikan akurasi 100% dengan hisab resmi pemerintah dan aplikasi sunnah terpercaya.
3. **Cakupan 8 Wilayah se-Banten**:
   Memastikan ketersediaan jadwal shalat dan tanggal hijriah untuk seluruh 8 Kota/Kabupaten di Provinsi Banten dengan pemetaan ID kota resmi yang valid dan teruji.

---

## 2. Pemetaan Teknis Endpoint & ID Kota MyQuran API

### A. Endpoint API Resmi
1. **Kalender Hijriah Hari Ini**:
   - URL: `GET https://api.myquran.com/v2/cal/hijr`
   - URL Tanggal Spesifik: `GET https://api.myquran.com/v2/cal/hijr?date={YYYY-MM-DD}`
   - Format Respon:
     ```json
     {
       "status": true,
       "request": { "path": "/cal/hijr", "date": "2026-09-26", "adj": -1 },
       "data": {
         "date": ["Sabtu", "13 Rabiul Akhir 1448 H", "26-09-2026"],
         "num": [7, 26, 9, 2026, 13, 4, 1448]
       }
     }
     ```
2. **Jadwal Shalat Bulanan / Harian**:
   - URL Bulanan: `GET https://api.myquran.com/v2/sholat/jadwal/{id_kota}/{tahun}/{bulan}`
   - URL Harian: `GET https://api.myquran.com/v2/sholat/jadwal/{id_kota}/{tahun}/{bulan}/{tanggal}`
   - Format Data Harian:
     ```json
     {
       "tanggal": "Sabtu, 26/09/2026",
       "imsak": "04:18",
       "subuh": "04:28",
       "terbit": "05:40",
       "dhuha": "06:07",
       "dzuhur": "11:50",
       "ashar": "14:58",
       "maghrib": "17:54",
       "isya": "19:02",
       "date": "2026-09-26"
     }
     ```

### B. Hasil Verifikasi Live ID Kota/Kabupaten Wilayah Banten (MyQuran API v2)
Berdasarkan verifikasi endpoint pencarian kota `api.myquran.com/v2/sholat/kota/cari/...`:
- **Kota Serang**: `1106` (Default)
- **Kota Cilegon**: `1105`
- **Kota Tangerang**: `1107`
- **Kota Tangerang Selatan**: `1108`
- **Kabupaten Serang**: `1103`
- **Kabupaten Pandeglang**: `1102`
- **Kabupaten Lebak**: `1101`
- **Kabupaten Tangerang**: `1104`

*(Catatan: ID ini telah diverifikasi langsung via curl ke server MyQuran dan mengembalikan nama daerah resmi Kemenag).*

---

## 3. Rincian Modifikasi & Arsitektur Berkas

### A. Tipe Data ([`types/prayer.ts`](file:///C:/website-islam/types/prayer.ts))
- Memperluas antarmuka `EQuranDailyShalat` dengan properti opsional `tanggal_hijriah?: string`.
- Menambahkan properti `tanggal_hijriah_hari_ini?: string` pada `EQuranShalatData`.
- Menambahkan antarmuka kontrak respons MyQuran (`MyQuranHijriResponse`, `MyQuranJadwalResponse`).

### B. Konstanta Pemetaan Wilayah ([`lib/constants/bantenRegions.ts`](file:///C:/website-islam/lib/constants/bantenRegions.ts))
- Menambahkan pemetaan terpusat `BANTEN_MYQURAN_IDS`:
  ```typescript
  export const BANTEN_MYQURAN_IDS: Record<KotaKabupatenBanten, string> = {
    'Kota Serang': '1106',
    'Kota Cilegon': '1105',
    'Kota Tangerang': '1107',
    'Kota Tangerang Selatan': '1108',
    'Kabupaten Serang': '1103',
    'Kabupaten Pandeglang': '1102',
    'Kabupaten Lebak': '1101',
    'Kabupaten Tangerang': '1104',
  };
  ```

### C. Fetcher & State Management ([`lib/equranShalat.ts`](file:///C:/website-islam/lib/equranShalat.ts) / [`app/actions/prayer.ts`](file:///C:/website-islam/app/actions/prayer.ts))
- Mengimplementasikan fungsi fetcher jadwal shalat bulanan dari MyQuran API dengan format adaptif.
- Mengintegrasikan pengambilan penanggalan Hijriah dari endpoint `https://api.myquran.com/v2/cal/hijr`.
- Menyematkan Next.js Cache Revalidation 24 jam (`revalidate: 86400`, tag `['prayer-times', region]`).
- Menerapkan mekanisme ketahanan (*Zero Silent Fallback*): Jika API MyQuran mengalami kendala jaringan atau batas kuota, sistem otomatis beralih (*graceful fallback*) ke kalkulasi astronomi lokal pustaka `adhan` yang sudah tersedia, sehingga antarmuka tidak pernah rusak atau kosong.

### D. Widget Jadwal Shalat Beranda ([`components/prayer/PrayerTimesWidget.tsx`](file:///C:/website-islam/components/prayer/PrayerTimesWidget.tsx))
- **Penanggalan Ganda**: Menampilkan informasi waktu hari ini dalam format:
  `[Hari], [Tanggal Masehi] / [Tanggal Hijriah]`
  (Contoh: *Sabtu, 26 September 2026 M / 13 Rabiul Akhir 1448 H*).
- **Waktu Shalat Lengkap**: Menyajikan Subuh, Terbit, Dzuhur, Ashar, Maghrib, dan Isya.
- **Pemberitahuan Waktu Menuju Shalat Berikutnya**: Indikator dinamis shalat yang sedang aktif / berikutnya.
- **Pemilih Wilayah**: Dropdown 8 Kota/Kabupaten Banten dengan tombol deteksi GPS otomatis.
- **Aksesibilitas WCAG 2.2 AA**: Rasio kontras teks minimal 4.5:1, target sentuh interaktif minimal 44x44 px di mobile, dan label semantik yang ramah screen reader.

### E. Kalender Jadwal Shalat Bulanan ([`components/prayer/MonthlyPrayerCalendar.tsx`](file:///C:/website-islam/components/prayer/MonthlyPrayerCalendar.tsx))
- Menyematkan penanggalan Hijriah pada kartu ringkasan hari ini dan tabel jadwal bulanan.
- Memastikan pemilih wilayah dan navigasi bulan tetap sinkron.

---

## 4. Rencana Pengujian & Verifikasi (Verification Plan)

### A. Pengujian Unit Otomatis (`scripts/test-prayer-myquran.ts`)
1. **Validasi Pemetaan 8 Wilayah**: Memastikan 8 ID kota/kabupaten mengembalikan data valid dari MyQuran API.
2. **Validasi Kalender Hijriah**: Memastikan format tanggal hijriah (Hari, Tanggal, Bulan, Tahun H) berhasil diambil dan di-parse dengan benar.
3. **Validasi Waktu Shalat**: Memastikan kolom Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya terisi waktu valid format `HH:mm`.
4. **Validasi Ketahanan Fallback**: Memastikan jika URL API tidak valid atau offline, fallback lokal Adhan berjalan mulus tanpa melempar unhandled exception.

### B. Validasi Kode & Kompilasi
1. **ESLint**: `npx eslint` pada seluruh berkas yang dimodifikasi (harus 0 error).
2. **TypeScript**: `npx tsc --noEmit` (harus 0 error).
3. **Production Build**: `npm run build` (harus lolos 100%).

### C. Verifikasi Antarmuka Browser via Chrome DevTools MCP
1. Menjalankan dev server Turbopack lokal.
2. Membuka halaman Beranda (`/`) dan halaman Jadwal Sholat (`/jadwal-sholat`).
3. Menguji tampilan pada viewport mobile (375x812) dan desktop (1280x800).
4. Menangkap tangkapan layar verifikasi visual rendering widget jadwal shalat dan penanggalan hijriah.
5. Menjalankan audit Lighthouse Accessibility (skor ≥ 95).

---

## 5. Rencana Git & Prosedur Kolaborasi
1. Rencana implementasi ini diposting ke komentar **GitHub Issue #4** untuk peninjauan.
2. Menunggu persetujuan / konfirmasi (*Proceed*).
3. Setelah disetujui: Eksekusi kode pada branch `staging-website-islam`.
4. Jalankan seluruh pengujian, commit dengan pesan konvensional:
   `feat(prayer): integrasi jadwal shalat myquran kemenag ri dan kalender hijriah (TASK-BM-009)`
5. Fast-forward merge ke `main`, push remote origin ke GitHub untuk auto-deploy Vercel.
6. Buat walkthrough.md dan poskan ringkasan resolusi ke komentar Issue #4.
