# TASK: [TASK-BM-009] Integrasi Jadwal Shalat MyQuran API (Kemenag RI) & Tampilan Kalender Hijriah
Branch Target: staging-website-islam (lalu merge ke main)
GitHub Issue: https://github.com/chandraanggaradiputra/website-islam/issues/4

Dokumentasi Alur & SOP Tiga Pilar:
1. Sebelum eksekusi: Buat implementation-plan.md lalu posting/push ke komentar GitHub Issue #4 agar Admin Chan dapat meninjau secara mandiri.
2. Tunggu konfirmasi (*Proceed*) dari Admin Chan atau Mas Chan di komentar GitHub / chat.
3. Setelah eksekusi: Verifikasi runtime via dev server & Chrome DevTools MCP (Brave), susun walkthrough.md, post ringkasannya ke Issue #4, merge ke main, dan push origin (auto-deploy Vercel).

---

## 1. Konteks Masalah & Target
Widget jadwal shalat di Banten Mengaji saat ini belum menampilkan penanggalan Kalender Hijriah.
Target tugas:
1. Mengintegrasikan **MyQuran API** (sumber resmi Bimas Islam Kemenag RI `bimasislam.kemenag.go.id`) yang selaras 100% dengan hisab aplikasi **HijrahApp**.
2. Menampilkan tanggal **Kalender Hijriah** (contoh: *15 Rabiul Akhir 1448 H*) berdampingan dengan tanggal Masehi di widget jadwal shalat.
3. Menyediakan pemilihan 8 Kota/Kabupaten se-Banten yang responsif dan akurat.

---

## 2. Rincian Endpoint MyQuran API
- **Kalender Hijriah**: `GET https://api.myquran.com/v2/cal/hijr`
- **Jadwal Shalat**: `GET https://api.myquran.com/v2/sholat/jadwal/{id_kota}/{tahun}/{bulan}/{tanggal}`
- **ID Kota/Kabupaten Wilayah Banten**:
  - Kota Serang: `1107` (Default)
  - Kota Cilegon: `1101`
  - Kabupaten Serang: `1104`
  - Kota Tangerang: `1102`
  - Kota Tangerang Selatan: `1108`
  - Kabupaten Tangerang: `1105`
  - Kabupaten Pandeglang: `1103`
  - Kabupaten Lebak: `1106`

---

## 3. Rincian Modifikasi Berkas
1. **Fetcher & State Management**:
   - Perbarui atau buat fungsi utilitas di `lib/prayerTimes.ts` (atau `lib/utils/prayerTimes.ts`) untuk mengambil data jadwal shalat dan tanggal hijriah dari MyQuran API.
   - Sediakan fallback data yang aman jika API eksternal mengalami kendala koneksi (*Zero Silent Fallback*).
2. **Komponen UI**:
   - Perbarui tampilan widget jadwal shalat agar memuat baris:
     `[Hari], [Tanggal Masehi] / [Tanggal Hijriah]`
   - Tampilkan waktu: Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya.
   - Pastikan dropdown pemilih kota/kabupaten Banten mudah diakses di perangkat ponsel.
3. **Kepatuhan Aksesibilitas (WCAG 2.2 AA)**:
   - Pastikan rasio kontras teks waktu shalat minimal 4.5:1.
   - Target sentuh tombol dan dropdown minimal 24x24 px (ideal 44x44 px di mobile).

---

## 4. Langkah Verifikasi & Git
1. Uji coba lokal via dev server Turbopack (`npm run dev`) pada viewport seluler dan desktop.
2. Cocokkan hasil waktu shalat dengan aplikasi HijrahApp untuk Kota Serang.
3. Validasi kode: `npx tsc --noEmit` (harus 0 error) dan `npm run build` (sukses).
4. Audit antarmuka via Chrome DevTools MCP (Brave): Lighthouse A11y ≥ 95 dan SEO 100.
5. Fast-forward merge ke branch `main`, push origin, dan dokumentasikan hasil di `walkthrough.md`.