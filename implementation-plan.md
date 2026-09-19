# Rencana Implementasi: Kolom Teks Broadcast WhatsApp (Smart Scratchpad & Live Preview) & Salin Format WA

Rencana teknis ini disusun untuk menambahkan fitur penampung dan pengolah teks siaran (*broadcast*) WhatsApp pada formulir penambahan & penyuntingan jadwal kajian (DKM & Admin) menggunakan pendekatan **Opsi A (Smart Scratchpad)**, serta menyajikan teks siaran tersebut pada halaman detail kajian publik dengan tombol **"📋 Salin Format WhatsApp"**.

---

## User Review Required

> [!IMPORTANT]
> **Penyimpanan Teks Broadcast WhatsApp:**
> Teks broadcast disimpan ke WordPress REST API pada field standar `content` (`post_content`), sehingga otomatis kompatibel dengan WP REST API tanpa memerlukan penambahan ACF field baru.
> 
> **Kebijakan MCP:**
> Sesuai instruksi pengguna, pengujian dilakukan dalam **MODE CEPAT (Terminal Only)** menggunakan `npx tsc --noEmit` dan `npm run build`, **tanpa** menjalankan Chrome DevTools MCP browser otomatis.

---

## Proposed Changes

### 1. Helper Pemformat & Pembersih Teks WhatsApp

#### [NEW] [whatsappText.ts](file:///C:/website-islam/lib/utils/whatsappText.ts)
- `formatWhatsAppText(text: string): string`:
  - Mengamankan karakter HTML dasar (`&`, `<`, `>`).
  - Mengubah sintaks tebal WhatsApp `*teks*` menjadi `<strong>teks</strong>`.
  - Mengubah sintaks miring WhatsApp `_teks_` menjadi `<em>teks</em>`.
  - Mengubah URL aktif (`http://` atau `https://`) menjadi tautan `<a href="..." target="_blank" ...>`.
- `stripHtmlToWhatsAppText(html: string): string`:
  - Mengonversi HTML yang disimpan WordPress kembali menjadi teks murni siap kirim ke grup WhatsApp.
  - Mengonversi `<br>`, `<p>`, entitas HTML (`&amp;`, `&quot;`, `&#8211;`), dan mempertahankan format `*bold*` serta baris baru.
- `generateDefaultKajianBroadcast(params)`:
  - Generator teks siaran standar untuk kajian lama yang belum memiliki isi teks broadcast kustom, sehingga tombol "Salin Format WhatsApp" tetap berfungsi 100% pada semua kajian.

---

### 2. Komponen Smart Scratchpad (DKM & Admin)

#### [NEW] [WhatsAppScratchpad.tsx](file:///C:/website-islam/components/dashboard/WhatsAppScratchpad.tsx)
- Komponen client (`'use client'`) dengan 2 tab:
  1. **Tab [Tulis / Tempel Teks]**:
     - Area `<textarea>` luas (7-9 baris) dengan `dir="auto"` (otomatis RTL untuk teks Arab dan LTR untuk teks Latin/Indonesia).
     - Placeholder informatif yang memandu pengurus DKM menempelkan draf siaran WhatsApp mereka.
     - Badge ringkas berisi panduan sintaks WhatsApp (`*teks*` untuk tebal, `_teks_` untuk miring, tautan otomatis, dan baris baru).
  2. **Tab [Pratinjau Web]**:
     - Menampilkan tampilan siaran langsung yang dirender dengan `formatWhatsAppText()`, `whitespace-pre-wrap`, dan styling pesan yang rapi.
- Mendukung mode *controlled* (`value` & `onChange`) untuk `react-hook-form` serta mode *uncontrolled* (`name="content"` & `defaultValue`) untuk form standar.

---

### 3. Integrasi Formulir DKM

#### [MODIFY] [TambahKajianForm.tsx](file:///C:/website-islam/components/dashboard/TambahKajianForm.tsx)
- Menambahkan field `content` (opsional) pada skema validasi `zod` (`kajianSchema`).
- Menempatkan komponen `WhatsAppScratchpad` di **posisi paling atas formulir** (langsung di bawah kartu status masjid pengurus DKM, sebelum kolom rincian).
- Mengirimkan nilai `content` melalui `formData.append('content', data.content)`.

---

### 4. Integrasi Formulir Admin

#### [MODIFY] [AdminTambahKajianForm.tsx](file:///C:/website-islam/components/dashboard/AdminTambahKajianForm.tsx)
- Menempatkan `WhatsAppScratchpad` di posisi teratas Section 2 (Informasi Materi & Pemateri) dengan input `name="content"`.

#### [MODIFY] [AdminDashboardTabs.tsx](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx) (Komponen `AdminKajianModal`)
- Menempatkan `WhatsAppScratchpad` di bagian atas formulir modal edit/tambah kajian dengan nilai awal `defaultValue={stripHtmlToWhatsAppText(kajian?.content?.rendered || '')}`.

---

### 5. Penyesuaian Server Actions

#### [MODIFY] [lib/actions/kajian.ts](file:///C:/website-islam/lib/actions/kajian.ts)
- `submitKajian`: Mengambil `formData.get('content')` dan menyertakannya ke payload WordPress REST API `content`.
- `createKajianByAdmin`: Mengambil `formData.get('content')` dan menyertakannya ke payload WordPress REST API `content`.
- `updateKajianByAdmin`: Mengambil `formData.get('content')` jika tersedia dan memperbarui field `content` pada postingan WordPress terkait.

---

### 6. Komponen Tombol Salin Format WhatsApp

#### [NEW] [CopyWhatsAppButton.tsx](file:///C:/website-islam/components/kajian/CopyWhatsAppButton.tsx)
- Komponen client (`'use client'`) dengan fitur:
  - Menyalin teks ke clipboard perangkat pengguna via `navigator.clipboard.writeText` dengan fallback.
  - Umpan balik visual interaktif: status berubah menjadi "✓ Format WhatsApp Tersalin!" dengan warna hijau emerald selama 2,5 detik.
  - Memenuhi standar aksesibilitas WCAG 2.2: target sentuh `min-h-[44px]`, label ARIA deskriptif.

---

### 7. Halaman Detail Kajian Publik

#### [MODIFY] [app/jadwal-kajian/[slug]/page.tsx](file:///C:/website-islam/app/jadwal-kajian/%5Bslug%5D/page.tsx)
- Menambahkan tombol `CopyWhatsAppButton` pada bilah aksi cepat di bagian atas (bersebelahan dengan `CalendarButton` dan `ShareButton`).
- Menyajikan blok khusus "Teks Informasi & Siaran WhatsApp" yang merender teks broadcast menggunakan `formatWhatsAppText`, lengkap dengan tombol salin format WA tepat di atas blok teks tersebut.

---

## Verification Plan

### Automated / Terminal Tests (Mode Cepat)
1. **Validasi Tipe TypeScript:**
   ```bash
   npx tsc --noEmit
   ```
   *Target: 0 error.*
2. **Uji Build Produksi Next.js:**
   ```bash
   npm run build
   ```
   *Target: Build sukses tanpa peringatan atau kegagalan kompilasi pada semua 22+ rute.*

### Git Workflow
1. Branch kerja: `staging-website-islam`.
2. Commit perubahan dengan pesan konvensi yang jelas.
3. Fast-forward merge `staging-website-islam` ke `main`.
4. Push kedua branch ke GitHub remote `origin`.
5. Penyusunan laporan akhir `walkthrough.md`.
