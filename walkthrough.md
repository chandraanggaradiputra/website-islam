# Walkthrough: Implementasi Kolom Teks Broadcast WhatsApp (Smart Scratchpad & Live Preview) & Tombol Salin Format WA

**Branch Kerja:** `staging-website-islam` → `main`
**Tanggal:** 19 September 2026
**Mode Pengujian:** MODE CEPAT (Terminal Only: `npx tsc --noEmit` & `npm run build`)

---

## Ringkasan Pekerjaan

Fitur ini menjawab kebutuhan pengurus DKM dan Super Admin yang terbiasa mengelola informasi kajian dari teks siaran (*broadcast*) WhatsApp. Sebelumnya, pengurus harus bolak-balik menyalin materi dari WhatsApp ke form satu per satu tanpa ada tempat menampung teks broadcast utuh.

Melalui pendekatan **Opsi A (Smart Scratchpad)**:
1. Formulir input/edit kajian (DKM dan Admin) kini memiliki penampung teks siaran WhatsApp di **posisi paling atas**.
2. Smart Scratchpad ramah format WhatsApp: mendukung teks Arab dengan `dir="auto"`, emoji, baris baru, serta tab `[Tulis / Tempel Teks]` dan `[Pratinjau Web]` yang otomatis merender `*bold*`, `_italic_`, dan tautan aktif.
3. Teks broadcast disimpan ke WordPress REST API pada field standar `content` (`post_content`).
4. Halaman detail kajian publik (`/jadwal-kajian/[slug]`) kini menampilkan blok khusus informasi siaran WhatsApp lengkap dengan tombol interaktif **"📋 Salin Format WhatsApp"** (berstandar WCAG 2.2 touch target 44px dan umpan balik visual instan).

---

## Berkas yang Dibuat & Dimodifikasi

### 1. Berkas Baru

| Berkas | Keterangan |
|---|---|
| [`lib/utils/whatsappText.ts`](file:///C:/website-islam/lib/utils/whatsappText.ts) | Utilitas pemformatan teks WhatsApp: `formatWhatsAppText()` (konversi `*bold*`, `_italic_`, URL ke HTML aman), `stripHtmlToWhatsAppText()` (konversi HTML kembali ke format teks WA siap salin), dan `generateDefaultKajianBroadcast()` (generator fallback teks siaran untuk kajian lama). |
| [`components/dashboard/WhatsAppScratchpad.tsx`](file:///C:/website-islam/components/dashboard/WhatsAppScratchpad.tsx) | Komponen client Smart Scratchpad dengan 2 tab: `[Tulis / Tempel Teks]` (textarea dengan `dir="auto"`, jumlah karakter, panduan format) dan `[Pratinjau Web]` (pratinjau pesan bergaya bubble). |
| [`components/kajian/CopyWhatsAppButton.tsx`](file:///C:/website-islam/components/kajian/CopyWhatsAppButton.tsx) | Komponen tombol salin format WhatsApp interaktif dengan umpan balik visual ("✓ Format WhatsApp Tersalin!"), fallback clipboard API, dan kepatuhan WCAG 2.2. |

### 2. Berkas yang Dimodifikasi

| Berkas | Keterangan Perubahan |
|---|---|
| [`components/dashboard/TambahKajianForm.tsx`](file:///C:/website-islam/components/dashboard/TambahKajianForm.tsx) | Menambahkan field `content` pada schema zod, menempatkan `WhatsAppScratchpad` di **posisi paling atas formulir** (di bawah kartu masjid DKM), dan menyertakan `content` saat submit. |
| [`components/dashboard/AdminTambahKajianForm.tsx`](file:///C:/website-islam/components/dashboard/AdminTambahKajianForm.tsx) | Menempatkan `WhatsAppScratchpad` di posisi paling atas formulir admin (`name="content"`). |
| [`components/dashboard/AdminDashboardTabs.tsx`](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx) | Menempatkan `WhatsAppScratchpad` pada modal edit/tambah kajian admin (`AdminKajianModal`) dengan nilai default dari `stripHtmlToWhatsAppText(kajian?.content?.rendered)`. |
| [`lib/actions/kajian.ts`](file:///C:/website-islam/lib/actions/kajian.ts) | Menambahkan penanganan field `content` pada `submitKajian`, `createKajianByAdmin`, dan `updateKajianByAdmin` menuju WordPress REST API. |
| [`app/jadwal-kajian/[slug]/page.tsx`](file:///C:/website-islam/app/jadwal-kajian/%5Bslug%5D/page.tsx) | Menambahkan `CopyWhatsAppButton` pada bilah aksi cepat di samping tombol Kalender & Bagikan, serta menyajikan blok informasi siaran WhatsApp dengan tombol salin. |

---

## Hasil Verifikasi Terminal (Mode Cepat)

### 1. Uji Tipe TypeScript (`npx tsc --noEmit`)
```text
Exit code: 0
Error count: 0 (Lolos tanpa kesalahan tipe data)
```

### 2. Uji Kompilasi Produksi Next.js (`npm run build`)
```text
▲ Next.js 16.3.3 (Turbopack)
✓ Compiled successfully in 58s
  Running TypeScript ...
  Finished TypeScript in 22.5s ...
✓ Generating static pages using 3 workers (22/22) in 33.5s
  Finalizing page optimization ...
Route (app)                         Revalidate  Expire
...
├ ƒ /dashboard/admin/tambah-kajian
├ ƒ /dashboard/dkm/tambah-kajian
├ ƒ /jadwal-kajian/[slug]
...
Exit code: 0
```
Seluruh 22+ rute berhasil dikompilasi tanpa kegagalan atau hambatan.

---

## Standar Aksesibilitas (WCAG 2.2)

- **Target Sentuh**: Tombol `CopyWhatsAppButton` dan tab switcher pada `WhatsAppScratchpad` memiliki tinggi sentuh minimal 44px (`min-h-[44px]`).
- **Arah Teks (RTL/LTR)**: Menggunakan atribut `dir="auto"` sehingga teks bahasa Arab (misal: basmalah, hadits, ayat Al-Qur'an) otomatis rata kanan tanpa merusak teks Latin/Indonesia.
- **Label Aksesibilitas**: Tersedia atribut `aria-label`, `title`, dan status `aria-pressed` pada tab switcher.
- **Kontras Warna**: Menggunakan warna emerald-600/700 dengan teks putih pada tombol aktif untuk kontras yang memenuhi rasio WCAG Level AA.
