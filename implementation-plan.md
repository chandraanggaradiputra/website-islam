# Rencana Implementasi: PWA Native, Arsip Rekaman Video Kajian, & Pembaruan Panduan DKM

Branch Target: `staging-website-islam`

## 1. Ringkasan & Ruang Lingkup Perubahan
Tugas ini mengimplementasikan tiga rangkaian fitur utama pada portal Banten Mengaji:

1. **Implementasi PWA Resmi (Progressive Web App)**:
   - **`app/manifest.ts`**: Manifes native Next.js Metadata Route yang mendefinisikan identitas PWA (`Banten Mengaji`), palet warna (`#093c96`), ikon, dan mode `standalone`.
   - **`public/sw.js`**: Service worker minimalis dengan strategi caching network-first untuk aset statis dan offline handling.
   - **`components/pwa/PwaHandler.tsx`**: Komponen client untuk mendaftarkan service worker, menangkap event `beforeinstallprompt` (Chrome/Android), menampilkan prompt instalasi elegan, dan menyediakan petunjuk instalasi untuk iPhone/iPad (iOS Safari).
   - **`app/layout.tsx`**: Pemasangan `<PwaHandler />` dan penambahan metadata PWA (`themeColor`, `apple-touch-icon`).

2. **Fitur Arsip Faedah & Rekaman Kajian Banten**:
   - **`lib/utils/youtube.ts`**: Helper parser URL YouTube untuk mengekstrak Video ID dari berbagai variasi URL (`watch?v=`, `youtu.be/`, `live/`, `embed/`) dan menghasilkan embed URL privasi-ramah (`youtube-nocookie.com/embed/`).
   - **`app/jadwal-kajian/page.tsx` & `components/kajian/KajianFilter.tsx`**:
     - Membawa seluruh data kajian (`allKajian`) ke filter tanpa memotong kajian yang telah selesai.
     - Menambahkan tab pemisah:
       * **Tab 1: Kajian Mendatang**: Menampilkan kajian berstatus aktif/libur yang belum lewat waktu (`!isKajianExpired(...)`).
       * **Tab 2: Arsip & Rekaman Kajian**: Menampilkan kajian yang telah selesai (`isKajianExpired(...) === true` atau `status_kajian === 'selesai'`).
     - Pada kartu kajian arsip (`components/kajian/KajianCard.tsx`), menampilkan badge `Selesai - Rekaman Tersedia` (jika ada `link_streaming`) atau `Kajian Selesai` beserta tanggal pelaksanaan.
   - **`app/jadwal-kajian/[slug]/page.tsx`**:
     - Jika kajian berstatus selesai/kedaluwarsa:
       * Menggantikan tombol Google Calendar dengan banner informasi pelaksanaan kajian.
       * Jika memiliki `link_streaming`, menyematkan pemutar video responsif YouTube (`aspect-video rounded-2xl`).
       * Menampilkan blok "Catatan & Ringkasan Faedah Kajian".
     - Jika belum selesai: Menampilkan tombol kalender dan rute masjid normal.

3. **Pembaruan Halaman Panduan DKM (`app/panduan-dkm/page.tsx`)**:
   - Menambahkan 2 kartu panduan baru:
     * **Panduan Pasang Aplikasi (PWA)**: Petunjuk praktis instalasi untuk pengguna Android (Chrome) dan iPhone (iOS Safari).
     * **Panduan Menyematkan Rekaman Kajian (Untuk DKM)**: Panduan langkah memasukkan link rekaman/live YouTube ke dalam postingan kajian agar menjadi arsip faedah abadi.

4. **Verifikasi & Alur Git**:
   - Pengujian `npx tsc --noEmit` dan `npm run build`.
   - Commit pada `staging-website-islam`, merge ke `main`, dan push ke GitHub `origin main`.

---

## 2. Rincian Perubahan Berkas

### A. Komponen & Konfigurasi PWA
#### [NEW] [app/manifest.ts](file:///C:/website-islam/app/manifest.ts)
- Generator manifest Next.js yang mengembalikan metadata PWA: nama, tema `#093c96`, icons, `display: 'standalone'`.

#### [NEW] [public/sw.js](file:///C:/website-islam/public/sw.js)
- Service Worker untuk caching aset statis dengan penanganan fetch network-first dan pembersihan cache lama saat aktivasi.

#### [NEW] [components/pwa/PwaHandler.tsx](file:///C:/website-islam/components/pwa/PwaHandler.tsx)
- Komponen client mendaftarkan `/sw.js`.
- Mendeteksi `beforeinstallprompt` untuk Android/Chrome dan memicu banner install ramah.
- Mendeteksi iOS Safari dan menampilkan petunjuk "Share -> Add to Home Screen".
- Menyimpan status dismiss di `sessionStorage` agar tidak mengganggu pengguna.

#### [MODIFY] [app/layout.tsx](file:///C:/website-islam/app/layout.tsx)
- Impor dan pasang `<PwaHandler />`.
- Tambahkan properti PWA pada metadata (`manifest`, `appleWebApp`).

---

### B. Helper & Modul Arsip Rekaman Video Kajian
#### [NEW] [lib/utils/youtube.ts](file:///C:/website-islam/lib/utils/youtube.ts)
- `getYouTubeVideoId(url)`: regex parser untuk berbagai format URL YouTube.
- `getYouTubeEmbedUrl(url)`: mengembalikan URL embed `https://www.youtube-nocookie.com/embed/${videoId}`.

#### [MODIFY] [components/kajian/KajianCard.tsx](file:///C:/website-islam/components/kajian/KajianCard.tsx)
- Deteksi status selesai / expired.
- Jika selesai dan memiliki rekaman: render badge hijau `Selesai - Rekaman Tersedia` dengan ikon Video.
- Jika selesai tanpa rekaman: render badge abu-abu `Kajian Selesai`.

#### [MODIFY] [components/kajian/KajianFilter.tsx](file:///C:/website-islam/components/kajian/KajianFilter.tsx)
- Tambahkan tab navigasi: **Kajian Mendatang** vs **Arsip & Rekaman Kajian**.
- Kelompokkan data kajian sesuai masa berlaku (`!isKajianExpired` vs `isKajianExpired`).
- Pertahankan filter wilayah (Kota, Kecamatan, Asatidz) pada kedua tab.

#### [MODIFY] [app/jadwal-kajian/page.tsx](file:///C:/website-islam/app/jadwal-kajian/page.tsx)
- Teruskan `allKajian` ke `<KajianFilter />` agar tab arsip memiliki akses ke seluruh kajian masa lalu.

#### [MODIFY] [app/jadwal-kajian/[slug]/page.tsx](file:///C:/website-islam/app/jadwal-kajian/[slug]/page.tsx)
- Cek status expired/selesai.
- Jika selesai:
  * Sembunyikan `CalendarButton`, tampilkan banner info kajian selesai.
  * Tampilkan video player iframe YouTube jika `link_streaming` tersedia.
  * Tampilkan judul "Catatan & Ringkasan Faedah Kajian".

---

### C. Pembaruan Panduan DKM
#### [MODIFY] [app/panduan-dkm/page.tsx](file:///C:/website-islam/app/panduan-dkm/page.tsx)
- Tambahkan 2 kartu panduan komprehensif berdesain modern:
  1. Kartu Panduan Instalasi PWA (Android & iOS Safari).
  2. Kartu Panduan Publikasi Link Rekaman Video YouTube bagi DKM.

---

## 3. Rencana Verifikasi & Pengujian
1. **Type Checking**:
   - Jalankan `npx tsc --noEmit` untuk memastikan nol error TypeScript.
2. **Kompilasi Produksi**:
   - Jalankan `npm run build` untuk memverifikasi Turbopack build berhasil 100%.
3. **Pengujian PWA**:
   - Verifikasi URL `/manifest.webmanifest` dapat diakses dan mengembalikan JSON valid.
   - Verifikasi `/sw.js` terdaftar di browser.
4. **Pengujian Fungsional Video & Arsip**:
   - Uji helper `getYouTubeEmbedUrl` pada berbagai format URL YouTube.
   - Verifikasi pergantian tab Kajian Mendatang dan Arsip & Rekaman Kajian.
   - Verifikasi halaman single kajian saat kajian telah selesai menampilkan pemutar video.

---

## 4. Alur Git & Dokumentasi
1. Kerjakan di branch `staging-website-islam`.
2. Commit: `git commit -m "feat: implementasi pwa native, arsip rekaman video kajian & panduan dkm"`
3. Merge ke `main`:
   ```bash
   git checkout main
   git merge staging-website-islam
   git push origin main
   git checkout staging-website-islam
   ```
4. Dokumentasikan seluruh perubahan pada `walkthrough.md`.
