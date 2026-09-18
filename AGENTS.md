# 🕌 Standar Rekayasa Kode & Instruksi AI Agent Proyek "Banten Mengaji"

Dokumen ini adalah **Instruksi Acuan Mutlak (Single Source of Truth)** bagi seluruh AI Agent di Antigravity yang bekerja pada repositori **`website-islam`** (Portal Informasi, Direktori Masjid, dan Jadwal Kajian Islam se-Provinsi Banten).

**Filosofi Utama**: *"Kode dan arsitektur dakwah yang baik itu kritis terhadap celah, jujur soal ketidakpastian data, dan menolak asumsi tersembunyi — jika ada data masjid/kajian yang tidak valid atau kosong, tampilkan status informatif secara jujur, bukan mengarang atau menebak data tiruan."*

---

## 🏢 Business Constants & Identitas Resmi (Banten Mengaji)

- **Nama Platform**: Banten Mengaji (Portal Dakwah, Direktori Masjid DKM, & Jadwal Kajian Islam se-Provinsi Banten).
- **Domain Produksi Live**: `https://banten-mengaji.vercel.app` (Deployment di Vercel).
- **Repositori GitHub**: `https://github.com/chandraanggaradiputra/website-islam` (Branch aktif: `main` dan `staging-website-islam`).
- **Direktori Lokal**: `C:/website-islam` (Windows 10 / PowerShell / VS Code / Antigravity IDE).
- **Email Resmi & Pengirim**: `admin@maschandigital.id`.
- **Backend WordPress Headless**: `https://salaf.maschandigital.id/wp-json/wp/v2/` (Murni konten dakwah, non-komersial).
- **Stack Teknologi**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript 7.

---

## ⚖️ Standar Manhaj & Nilai Syariat Islam (Strict Sharia Compliance)

1. **Prinsip Manhaj Salafus Shalih**:
   - Seluruh konten, jadwal kajian, dan artikel wajib selaras dengan pemahaman Al-Qur'an dan As-Sunnah sesuai manhaj para sahabat Nabi.
2. **Terminologi Syar'i Baku**:
   - Wajib menggunakan istilah Islami baku: **"Ikhwan"** dan **"Akhwat"** (bukan pria/wanita biasa), **"Asatidzah"**, **"Kajian Rutin"**, **"Kajian Tematik"**, serta **"DKM"**.
3. **Dakwah Murni Non-Komersial & Bebas Riba**:
   - Platform ini murni khidmat dakwah tanpa e-commerce, tanpa sistem dompet digital/saldo penampung (bebas Riba Qardh), dan tanpa iklan yang melanggar syariat.
   - Rekening donasi di direktori masjid hanya ditujukan untuk operasional dan pemakmuran masjid resmi DKM terkait.
4. **Batasan Visual & Estetika Syar'i**:
   - Menghindari ilustrasi makhluk bernyawa secara berlebihan. Mengutamakan tipografi Arab/Latin yang bersih, kaligrafi islami, serta palet warna yang teduh dan menenangkan.

---

## 🔴 5 Prinsip Rekayasa Kode Baku (Strict Engineering Principles)

### 1. Dilarang Keras Diam-Diam Fallback ke "Data Default" (Zero Silent Fallback)
* Jika ID masjid, jadwal kajian, atau parameter kecamatan tidak valid/kosong, kembalikan **Error 404**, **Null**, atau **Array Kosong `[]`**.
* **Dilarang**: Menaruh fallback ID masjid acak atau memaksa kecamatan default ke "Serang" jika pengguna memilih kecamatan lain yang datanya kosong.

### 2. Taksonomi Kecamatan di Root Payload
* Pada endpoint direktori masjid (`/masjid`), ID taksonomi `kecamatan` **WAJIB** dikirim dan dibaca pada level **ROOT payload** (`payload.kecamatan = [termId]`), **BUKAN** di dalam objek `acf`.

### 3. Normalisasi Fasilitas Masjid Berawalan Peluru (`• `)
* Nilai enum ACF fasilitas masjid mewajibkan awalan simbol peluru `• ` (contoh: `• Parkir Mobil & Motor`, `• Area Khusus Akhawat (Hijab)`). Selalu gunakan helper `normalizeFasilitas()` di `lib/actions/dkm.ts` dan `lib/actions/masjid.ts`.

### 4. Validasi Batas Waktu & Arsip Otomatis Kajian (Zona WIB)
* Fungsi `isKajianExpired(tanggalKajian, jamSelesai, jamMulai)` di `lib/utils/kajian.ts` wajib berpatokan ketat pada zona waktu **WIB (+07:00)**.
* Kajian yang telah lewat waktunya otomatis dikunci dan diarsipkan (`status_kajian: 'selesai'`).
* Kajian berstatus `libur` tetap ditampilkan di halaman publik dengan lencana merah tegas **"DILIBURKAN"**.

### 5. Strict Type Safety & Penanganan Error
* Seluruh tipe data entitas WordPress terpusat di `types/wordpress.ts`. Hindari penggunaan `any`. Tangani error secara aman: `catch (err: unknown)` dengan `if (err instanceof Error)`.

---

## 🌐 Integrasi Layanan Eksternal & Otomasi

1. **Jadwal Sholat Real-Time**:
   - Integrasi API EQuran.id (`https://equran.id/api/v2/shalat`) menggunakan data hisab resmi Kemenag RI, disertai fallback algoritma Adhan dengan waktu ihtiyath di `lib/prayerTimes.ts`.
2. **Generator Google Calendar**:
   - Helper `createGoogleCalendarUrl` di `lib/utils/calendar.ts` mengonversi waktu WIB (+07:00) ke format UTC ISO (`YYYYMMDDTHHmmssZ`) dan mendukung aturan berulang `RRULE:FREQ=WEEKLY` untuk kajian rutin.
3. **CRM & Notifikasi DKM**:
   - Terhubung ke Mailketing API (`https://api.mailketing.co.id/api/v1/send`) menggunakan List ID CRM `92693` untuk pengiriman email konfirmasi pendaftaran masjid DKM.
4. **Auto-Indexing & SEO Data Terstruktur**:
   - Auto-ping IndexNow ke `https://api.indexnow.org/indexnow` via `notifySearchEngines()` setiap kali jadwal kajian baru terbit atau diperbarui.
   - Skema Schema.org JSON-LD wajib terpasang: `PlaceOfWorship` pada profil masjid, `Event` pada jadwal kajian, dan `HowTo` pada halaman `/panduan-dkm`.

---

## ♿ Standar Aksesibilitas Web WCAG 2.2 (Level AA Mandatory)

1. **Target Size Minimum (SC 2.5.8)**:
   - Tombol jadwal sholat, kartu kajian, dan link navigasi mobile wajib berukuran minimal **24x24 CSS pixels** atau memiliki *spacing* pemisah yang aman.
2. **Focus Not Obscured (SC 2.4.11)**:
   - Elemen yang menerima fokus keyboard dilarang tertutup oleh *sticky header* atau *bottom navigation bar*. Wajib menyematkan `scroll-m-20` pada tautan dan elemen interaktif.
3. **Dragging Movements Alternative (SC 2.5.7)**:
   - Slider jadwal kajian atau profil masjid wajib menyediakan tombol navigasi panah alternatif selain gesture seret/swipe.
4. **Consistent Help (SC 3.2.6)**:
   - Tombol bantuan DKM, tautan panduan pendaftaran, dan kontak admin wajib berada di posisi yang konsisten di semua halaman.
5. **Label in Name (SC 2.5.3)**:
   - Atribut `aria-label` pada tombol wajib diawali atau memuat kata-kata dari teks tampak (*visible text*).
6. **WAI-ARIA Prohibited Attributes**:
   - Dilarang menyematkan `aria-label` pada tag generik (`<span>`, `<div>`) tanpa atribut `role` eksplisit (misal: gunakan `role="status"` pada badge status kajian).
7. **Rasio Kontras Warna (SC 1.4.3)**:
   - Seluruh teks wajib memenuhi rasio kontras minimal **4.5:1** terhadap warna latar belakang.

---

## 🔄 Alur Kerja Kolaborasi Standar (The Golden Workflow)

Setiap pengerjaan tugas oleh AI Agent di Antigravity wajib mengikuti 5 fase:

1. **Fase 1 (Sebelum Eksekusi)**:
   - Analisis kebutuhan teknis dan susun dokumen perencanaan **`implementation-plan.md`**.
   - Mas Chan / Admin Chan mereview dan memberikan persetujuan (*Proceed*).
2. **Fase 2 (Eksekusi Kode Lokal)**:
   - Bekerja di branch staging: **`staging-website-islam`** di direktori `C:/website-islam`.
   - Jalankan dev server lokal Next.js Turbopack.
3. **Fase 3 (Verifikasi Otomatis & Runtime)**:
   - `npx tsc --noEmit` (Wajib 0 error).
   - `npm run build` (Wajib seluruh rute terkompilasi).
   - Verifikasi antarmuka ponsel (390×844 px) via **Chrome DevTools MCP & Brave** untuk memastikan skor Aksesibilitas WCAG 2.2 (≥ 95) dan SEO (100).
4. **Fase 4 (Penyusunan Laporan)**:
   - Susun laporan resmi hasil uji coba ke dalam dokumen **`walkthrough.md`** (menggantikan format lama `AGENT_OUTPUT.md`).
5. **Fase 5 (Sinkronisasi Git & Deployment)**:
   - Commit di branch kerja: `git commit -m "feat/fix: [pesan terstruktur]"`
   - Fast-forward merge ke staging: `git checkout staging-website-islam && git merge [branch-fitur] --ff-only`
   - Fast-forward merge ke main: `git checkout main && git merge staging-website-islam --ff-only`
   - Push remote: `git push origin main staging-website-islam` (memicu auto-deploy Vercel).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->