# Walkthrough: [TASK-BM-008] Fix Bidirectional Text Alignment (LTR/RTL) & Left Alignment pada Pesan Kajian

Dokumen ini merupakan laporan resmi implementasi dan verifikasi teknis perbaikan sistem *Bidirectional Text* (BiDi LTR/RTL) serta penataan rata kiri (*left alignment*) pada tampilan pesan informasi kajian di portal dakwah Banten Mengaji (merujuk pada GitHub Issue #3).

---

## 1. Ringkasan Masalah & Analisis Akar Masalah (Root Cause Analysis)

Sebelum perbaikan ini:
1. **Gejala Visual**:
   - Di aplikasi WhatsApp, pesan kajian tersusun rapi: Basmalah terbaca RTL di tengah/atas, sedangkan teks informasi kajian (ustadz, judul, waktu, lokasi) tersusun rata kiri secara normal (LTR).
   - Namun di website Banten Mengaji (khususnya halaman detail kajian seluler), seluruh teks Latin mengalami penataan rata kanan (*Right-to-Left*).
   - Akibatnya, tanda kutip (`"M.H"`), angka (`99`), tanda hubung, serta emoji penanda waktu/tema (`🗓️`, `⏰`, `⭐`) terbalik urutannya atau meloncat ke sisi berlawanan.
2. **Akar Masalah Teknis**:
   - Kontainer wrapper utama menggunakan atribut `dir="auto"` dengan styling `whitespace-pre-wrap`.
   - Berdasarkan spesifikasi HTML dan Unicode Bidirectional Algorithm (UAX #9), atribut `dir="auto"` pada kontainer induk menentukan arah baca berdasarkan **karakter berarah tegas pertama (*first strong directional character*)** di dalam seluruh teks.
   - Karena pesan kajian diawali dengan lafadz Basmalah (`﷽` atau `بِسْمِ اللهِ`), browser mendeteksi aksara Arab sebagai karakter pertama, sehingga menetapkan arah dasar seluruh kontainer menjadi `dir="rtl"`. Seluruh baris Latin di bawahnya pun terpaksa dirender dalam konteks RTL.

---

## 2. Rincian Modifikasi Berkas

### A. Core BiDi Text Utility ([`lib/utils/whatsappText.ts`](file:///C:/website-islam/lib/utils/whatsappText.ts))
1. **Pemisahan Paragraf & Deteksi Aksara Arab Murni**:
   - Jika suatu paragraf hanya berisi aksara Arab (seperti `﷽`, `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`, salam, atau kutipan ayat/hadits), dibungkus terisolasi dengan:
     ```html
     <div dir="rtl" class="text-center font-arabic text-xl sm:text-2xl py-1 my-1 text-slate-900 dark:text-slate-100 font-normal leading-loose">
       ...
     </div>
     ```
   - Tampilan pembuka Basmalah menjadi rata tengah (*centered*), proporsional, dan anggun selayaknya kaligrafi pembuka pesan dakwah.
2. **Isolasi Frasa Arab di Dalam Baris Latin (`<bdi class="font-arabic">`)**:
   - Untuk baris campuran (seperti `🎙️ *Pemateri:* Ustadz Dr. Fulan, Lc., M.A. حفظه الله تعالى`), frasa Arab sisipan diisolasi dengan tag HTML5 `<bdi class="font-arabic">...</bdi>`.
   - Isolasi ini mencegah perambatan arah baca Arab ke karakter netral di sekitarnya (seperti tanda kutip gelar, titik, spasi, dan emoji).
3. **Paragraf Latin Standar**:
   - Paragraf Latin dibungkus dengan:
     ```html
     <div dir="ltr" class="text-left leading-relaxed">...</div>
     ```
   - Seluruh emoji di sisi kiri tetap berada di kiri, nomor/tanggal/jam mengalir alami dari kiri ke kanan.
4. **Perbaikan Word Boundary pada `stripHtmlToWhatsAppText`**:
   - Menambahkan batasan kata `\b` pada regex pembersih tag formatting (`<(?:strong|b)\b[^>]*>`, `<(?:em|i)\b[^>]*>`, `<(?:del|s|strike)\b[^>]*>`).
   - Mencegah tag `<bdi>` salah terdeteksi sebagai tag `<b>` tebal, sehingga fungsi salin clipboard WhatsApp menghasilkan teks yang 100% identik dengan aslinya (*lossless roundtrip*).

### B. Halaman Detail Jadwal Kajian ([`app/jadwal-kajian/[slug]/page.tsx`](file:///C:/website-islam/app/jadwal-kajian/%5Bslug%5D/page.tsx))
- Mengubah pembungkus pesan kajian dari `dir="auto"` menjadi:
  ```tsx
  <div
    dir="ltr"
    className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200 space-y-4 leading-relaxed font-sans break-words text-left [unicode-bidi:plaintext] [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_em]:italic [&_del]:line-through"
    dangerouslySetInnerHTML={{ __html: formatWhatsAppText(rawContentText) }}
  />
  ```
- Menambahkan penegasan `dir="ltr" text-left [unicode-bidi:plaintext]` pada kontainer `catatan_faedah`.
- Menyelaraskan hierarki heading semantik menjadi `h2` untuk memenuhi kaidah aksesibilitas WCAG.

### C. Komponen Input Smart Scratchpad ([`components/dashboard/WhatsAppScratchpad.tsx`](file:///C:/website-islam/components/dashboard/WhatsAppScratchpad.tsx))
- Mengubah textarea dari `dir="auto"` menjadi `dir="ltr"` dengan kelas `text-left [unicode-bidi:plaintext]`.
- Mengubah kontainer pratinjau web dari `dir="auto"` menjadi `dir="ltr"` dengan kelas `space-y-4 break-words leading-relaxed text-left [unicode-bidi:plaintext]`.

### D. Tipografi Arab ([`app/globals.css`](file:///C:/website-islam/app/globals.css))
Menambahkan styling kelas utilitas `.font-arabic` dengan font stack teruji lintas platform:
```css
.font-arabic {
  font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', 'Geeza Pro', 'Arial', sans-serif;
}
```

### E. Peningkatan Aksesibilitas Tombol Aksi
- [`components/kajian/CopyWhatsAppButton.tsx`](file:///C:/website-islam/components/kajian/CopyWhatsAppButton.tsx): Menyelaraskan `aria-label` dengan teks tombol yang terlihat (WCAG 2.5.3 Label in Name).
- [`components/ui/ShareButton.tsx`](file:///C:/website-islam/components/ui/ShareButton.tsx): Meningkatkan rasio kontras warna tombol dengan `bg-emerald-700 hover:bg-emerald-800 text-white` serta minimum touch target 44px.
- [`components/ui/GlobalSearch.tsx`](file:///C:/website-islam/components/ui/GlobalSearch.tsx): Menyelaraskan `aria-label` dengan teks placeholder pencarian.

---

## 3. Hasil Pengujian & Verifikasi Kualitas

### A. Pengujian Unit Logika BiDi ([`scripts/test-bidi-text.ts`](file:///C:/website-islam/scripts/test-bidi-text.ts))
Pengujian unit otomatis dijalankan melalui skrip `npx tsx scripts/test-bidi-text.ts`:

| No | Skenario Pengujian | Input/Kondisi | Ekspektasi | Hasil | Status |
|:---|:---|:---|:---|:---|:---:|
| 1 | Baris Basmalah Aksara Arab Murni | `﷽` | Dibungkus `dir="rtl"` dan `text-center font-arabic` | Sesuai | **PASS** |
| 2 | Baris Latin dengan Tanda Kutip & Angka | `"Kajian Fiqih M.H" 99 Masalah` | Berada dalam blok `dir="ltr" text-left` tanpa jumping | Sesuai | **PASS** |
| 3 | Frasa Doa Arab Sisipan | `Ustadz ... حفظه الله تعالى` | Diisolasi dengan `<bdi class="font-arabic">` | Sesuai | **PASS** |
| 4 | Preservasi Posisi Emoji di Sisi Kiri | `📌`, `🎙️`, `🗓️`, `⏰` | Terletak di awal baris mendahului teks Latin | Sesuai | **PASS** |
| 5 | Tautan Live Streaming Otomatis | URL streaming YouTube | Tautan aktif `<a>` dengan atribut rel dan target aman | Sesuai | **PASS** |
| 6 | Konversi Bolak-Balik (Lossless Round-trip) | Format HTML $\leftrightarrow$ Teks Asli WA | 100% kecocokan karakter tanpa perubahan teks | Sesuai | **PASS** |
| 7 | Penanganan Teks Kosong | String kosong `""` | Mengembalikan `""` tanpa error | Sesuai | **PASS** |
| 8 | Hadits/Ayat Arab Multibaris | Teks hadits Arab lengkap | Terformat `dir="rtl"` secara utuh | Sesuai | **PASS** |

**Tingkat Kelulusan Unit Test: 100% (8 dari 8 tes lolos)**.

### B. Validasi Kode & Kompilasi
- **ESLint**:
  ```bash
  npx eslint lib/utils/whatsappText.ts components/dashboard/WhatsAppScratchpad.tsx components/kajian/CopyWhatsAppButton.tsx components/ui/ShareButton.tsx components/ui/GlobalSearch.tsx "app/jadwal-kajian/[slug]/page.tsx"
  ```
  $\rightarrow$ **0 Error, 0 Warning**.
- **TypeScript Typecheck**:
  ```bash
  npx tsc --noEmit
  ```
  $\rightarrow$ **0 Error (Exit code: 0)**.
- **Production Build (Next.js 16 Turbopack)**:
  ```bash
  npm run build
  ```
  $\rightarrow$ **Compiled successfully in 56s, 19/19 static pages generated (Exit code: 0)**.

### C. Verifikasi Antarmuka Browser via Chrome DevTools MCP
1. **Tangkapan Layar Tampilan Mobile (Viewport 375x812)**:
   ![Verifikasi Mobile](C:/Users/hp/.gemini/antigravity/brain/48250b00-4b24-4f17-b0a6-9f5c16b32b62/verifikasi-bidi-mobile.png)
   - Basmalah `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم` tampil anggun rata tengah di atas.
   - Seluruh baris Latin tersusun rapi rata kiri.
   - Judul materi dengan tanda kutip `"Kifaa Hul Banna Muhammady Lc. M.H"` dan angka `99` tersusun sempurna tanpa terbalik.
   - Doa `حفظه الله تعالى` tampil proporsional rata tengah dengan tipografi Arab.
   - Emoji `🗓️` dan `⏰` berada tepat di sisi kiri mendahului tanggal dan waktu kajian.

2. **Tangkapan Layar Tampilan Desktop (Viewport 1280x800)**:
   ![Verifikasi Desktop](C:/Users/hp/.gemini/antigravity/brain/48250b00-4b24-4f17-b0a6-9f5c16b32b62/verifikasi-bidi-desktop.png)
   - Layout lebar desktop tersaji seimbang dan bersih.

3. **Audit Kualitas Lighthouse**:
   - **Best Practices**: 100 / 100
   - **SEO**: 100 / 100
   - **Agentic Browsing**: 100 / 100
   - **Accessibility**: 94 / 100

---

## 4. Kesimpulan
Semua kriteria penerimaan untuk TASK-BM-008 dan GitHub Issue #3 telah terpenuhi secara menyeluruh:
1. Masalah teks Latin rata kanan (*RTL*) berhasil diselesaikan dengan menetapkan kontainer `dir="ltr"` dan kelas Tailwind `text-left [unicode-bidi:plaintext]`.
2. Aksara Arab murni tampil rata tengah secara anggun (`dir="rtl" text-center font-arabic`), sedangkan frasa doa Arab sisipan diisolasi dengan `<bdi class="font-arabic">`.
3. Tanda kutip, angka, dan emoji tidak lagi terbalik atau meloncat baris.
4. Fitur salin pesan WhatsApp tetap 100% akurat dan *lossless*.
5. Seluruh pengujian lolos 100% dan siap digabungkan ke branch utama (*main*).
