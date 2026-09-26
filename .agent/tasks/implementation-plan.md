# Implementation Plan: [TASK-BM-008] Fix Bidirectional Text Alignment (LTR/RTL) & Left Alignment pada Pesan Kajian

Dokumen ini merupakan rancangan implementasi teknis untuk menyelesaikan masalah penataan teks dwiarah (*Bidirectional Text* - LTR/RTL) serta *left alignment* pada pesan kajian di portal dakwah Banten Mengaji (merujuk pada GitHub Issue #3).

---

## 1. Konteks Masalah & Akar Masalah (Root Cause Analysis)

### A. Gejala yang Ditemukan
Berdasarkan perbandingan tampilan antara pesan informasi jadwal kajian di **WhatsApp** dengan tampilan pada **website Banten Mengaji** (tangkapan layar perangkat seluler):
1. **Di WhatsApp**: Teks tersusun seimbang dan alami. Kalimat Arab (Basmalah & doa *hafizhahullah*) terbaca dengan arah baca RTL (*Right-to-Left*), sedangkan teks Latin (informasi kajian, ustadz, waktu, lokasi) terbaca normal dan rata kiri LTR (*Left-to-Right*).
2. **Di Website**: Elemen teks pada kartu preview / format pesan kajian mengalami penataan rata kanan / RTL yang memengaruhi seluruh blok teks Latin. Akibatnya:
   - Teks Latin ikut rata kanan secara tidak wajar.
   - Tanda kutip (`"M.H"`), angka (`99`), tanda minus/titik, serta emoji (`🗓️`, `⏰`, `⭐`) terbalik urutannya atau meloncat posisi karena terpengaruh aturan BiDi (*Bidirectional Algorithm*) Arab.
   - Pengunjung dan jamaah mengalami kesulitan membaca rincian jadwal kajian di perangkat seluler.

### B. Akar Masalah Teknis (Technical Root Cause)
1. **Container-level `dir="auto"` Misleading**:
   Pada `app/jadwal-kajian/[slug]/page.tsx` (baris 338) dan `components/dashboard/WhatsAppScratchpad.tsx` (baris 212 & 232), kontainer pembungkus utama memiliki atribut `dir="auto"` dengan styling `whitespace-pre-wrap`.
2. **Evaluasi Karakter Pertama oleh Browser**:
   Berdasarkan spesifikasi HTML & Unicode Bidirectional Algorithm (UAX #9), atribut `dir="auto"` pada elemen kontainer mengevaluasi **karakter berarah tegas pertama (*first strongly typed character*)** di dalam seluruh konten elemen tersebut.
3. Karena pesan kajian standar hampir selalu diawali dengan lafadz Basmalah (`﷽` atau `بِسْمِ اللهِ`), browser mendeteksi karakter pertama tersebut sebagai aksara Arab berkategori *Strong RTL*.
4. Akibatnya, browser menetapkan arah dasar (*base direction*) seluruh blok kontainer menjadi **RTL** (`dir="rtl"`). Seluruh paragraf dan baris di bawahnya (yang 95% berbahasa Indonesia/Latin) terpaksa dirender dalam konteks RTL:
   - Perataan teks menjadi rata kanan (`text-align: right`).
   - Karakter netral di awal baris (seperti emoji `📌`, `🎙️`, `⏰`) terdorong ke sisi paling kanan.
   - Tanda kutip (`"M.H"`), tanda kurung, titik, dan angka berurutan terbalik posisinya.

---

## 2. Rencana Solusi & Arsitektur Teknis

Solusi dirancang dengan mengombinasikan 4 lapisan perbaikan:

### A. Kontainer Utama: Penegasan LTR & Text Left Terisolasi
- Menghapus `dir="auto"` dari kontainer wrapper utama.
- Menetapkan secara eksplisit `dir="ltr"` dan kelas Tailwind `text-left` pada kontainer pesan kajian di:
  1. `app/jadwal-kajian/[slug]/page.tsx`
  2. `components/dashboard/WhatsAppScratchpad.tsx` (pada tab pratinjau web dan input textarea)
- Menambahkan kelas CSS `[unicode-bidi:plaintext]` agar browser menghitung arah baca tiap paragraf/baris secara independen tanpa terpengaruh oleh paragraf sebelumnya.

### B. Utilitas Pemformat Teks Cerdas ([`lib/utils/whatsappText.ts`](file:///C:/website-islam/lib/utils/whatsappText.ts))
Memperbarui fungsi `formatWhatsAppText(text: string): string` agar menghasilkan markup HTML terstruktur yang ramah BiDi:
1. **Deteksi Paragraf/Baris Berkarakter Arab Murni**:
   - Jika suatu paragraf/baris hanya berisi aksara Arab (seperti `﷽`, `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`, salam, atau kutipan ayat/hadits murni), bungkus dalam:
     ```html
     <div dir="rtl" class="text-center font-arabic text-xl sm:text-2xl py-1 my-1 text-slate-900 dark:text-slate-100 font-normal leading-loose">
       ...
     </div>
     ```
   - Tampilan pembuka Basmalah menjadi rata tengah (*centered*), proporsional, dan anggun selayaknya kaligrafi pembuka pesan dakwah.
2. **Isolasi Frasa Arab di Dalam Baris Latin (`<bdi>`)**:
   - Untuk baris campuran (seperti `🎙️ *Pemateri:* Ustadz Dr. Fulan, Lc., M.A. حفظه الله تعالى`), frasa Arab (`حفظه الله تعالى`) diisolasi dengan tag HTML5 `<bdi class="font-arabic">...</bdi>`.
   - Tag `<bdi>` (*Bidirectional Isolation*) mencegah perambatan arah baca Arab ke karakter netral di sekitarnya (titik gelar, tanda kutip, emoji, dan spasi).
3. **Paragraf Latin / Indonesia**:
   - Paragraf Latin standar dibungkus dengan:
     ```html
     <div dir="ltr" class="text-left leading-relaxed">...</div>
     ```
   - Seluruh emoji di sisi kiri tetap berada di kiri, nomor/tanggal/jam mengalir alami dari kiri ke kanan.
4. **Perbaikan Word Boundary pada `stripHtmlToWhatsAppText`**:
   - Memperbaiki ekspresi reguler pembersih tag `strong`, `em`, `del`:
     - Dari `/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi` menjadi `/<(?:strong|b)\b[^>]*>(.*?)<\/(?:strong|b)\b>/gi`.
     - Ini mencegah tag `<bdi>` salah terdeteksi sebagai tag `<b>` tebal, sehingga fungsi salin clipboard WhatsApp menghasilkan teks yang 100% identik dengan aslinya (*lossless roundtrip*).

### C. Tipografi Aksara Arab ([`app/globals.css`](file:///C:/website-islam/app/globals.css))
Menambahkan kelas utilitas `.font-arabic` dengan font stack teruji:
```css
.font-arabic {
  font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', 'Geeza Pro', 'Arial', sans-serif;
}
```

---

## 3. Rincian Berkas yang Akan Diubah

| Berkas | Perubahan yang Dilakukan |
|:---|:---|
| [`lib/utils/whatsappText.ts`](file:///C:/website-islam/lib/utils/whatsappText.ts) | 1. Implementasi pemformatan paragraf cerdas dengan isolasi Arab murni (`dir="rtl" text-center font-arabic`), isolasi frasa campuran (`<bdi class="font-arabic">`), dan LTR rata kiri.<br>2. Perbaikan regex word boundary `\b` pada `stripHtmlToWhatsAppText`. |
| [`app/jadwal-kajian/[slug]/page.tsx`](file:///C:/website-islam/app/jadwal-kajian/%5Bslug%5D/page.tsx) | 1. Mengubah pembungkus pesan kajian dari `dir="auto"` menjadi `dir="ltr"` dengan kelas `text-left [unicode-bidi:plaintext]`.<br>2. Menambahkan `dir="ltr" text-left [unicode-bidi:plaintext]` pada kontainer `catatan_faedah`. |
| [`components/dashboard/WhatsAppScratchpad.tsx`](file:///C:/website-islam/components/dashboard/WhatsAppScratchpad.tsx) | 1. Mengubah textarea `dir="auto"` menjadi `dir="ltr"` dengan `text-left [unicode-bidi:plaintext]`.<br>2. Mengubah kontainer pratinjau web dari `dir="auto"` menjadi `dir="ltr"` dengan `text-left [unicode-bidi:plaintext]`. |
| [`app/globals.css`](file:///C:/website-islam/app/globals.css) | Menambahkan definisi styling `.font-arabic` untuk font stack aksara Arab. |
| `scripts/test-bidi-text.ts` | Skrip pengujian otomatis unit test untuk memvalidasi roundtrip, isolasi `<bdi>`, pemisahan baris Basmalah, penanganan quote, angka, dan emoji. |

---

## 4. Rencana Pengujian & Verifikasi (Verification Plan)

### A. Pengujian Unit Otomatis (`scripts/test-bidi-text.ts`)
1. **Test 1**: Verifikasi pemisahan baris Basmalah `﷽` menjadi `dir="rtl"` dan `text-center font-arabic`.
2. **Test 2**: Verifikasi baris Latin dengan tanda kutip gelar `"M.H"` dan angka `99` tetap berada dalam `dir="ltr"` dan tidak terbalik.
3. **Test 3**: Verifikasi isolasi `<bdi class="font-arabic">` untuk doa *hafizhahullah* `حفظه الله تعالى`.
4. **Test 4**: Verifikasi penempatan emoji kalender (`🗓️`), jam (`⏰`), dan pin (`📌`) di sisi kiri baris.
5. **Test 5**: Verifikasi *lossless roundtrip* antara `formatWhatsAppText` dan `stripHtmlToWhatsAppText` (100% kecocokan karakter).

### B. Validasi Kode & Kompilasi
1. **ESLint**: `npx eslint lib/utils/whatsappText.ts components/dashboard/WhatsAppScratchpad.tsx "app/jadwal-kajian/[slug]/page.tsx"` (harus 0 error).
2. **TypeScript**: `npx tsc --noEmit` (harus 0 error).
3. **Production Build**: `npm run build` (harus sukses 100%).

### C. Verifikasi Antarmuka Browser via Chrome DevTools MCP
1. Menjalankan dev server Turbopack (`npm run dev`).
2. Melakukan inspeksi halaman detail kajian (`/jadwal-kajian/...`) pada viewport seluler:
   - Mobile: 375x667 (iPhone SE) & 412x915 (Pixel / Galaxy).
   - Desktop: 1280x800.
3. Mengambil tangkapan layar (*screenshot*) verifikasi rendering visual.
4. Menjalankan audit aksesibilitas Lighthouse (`lighthouse_audit`) untuk memastikan skor WCAG 2.2 AA ≥ 95.

---

## 5. Rencana Git & Sinkronisasi
1. Eksekusi kode pada branch `staging-website-islam`.
2. Commit dengan pesan standar konvensional:
   `fix(kajian): perbaiki perataan teks dwiarah LTR RTL dan posisi tanda baca (TASK-BM-008)`
3. Checkout ke `main`, lakukan fast-forward merge:
   `git merge staging-website-islam --ff-only`
4. Push kedua branch ke GitHub remote `origin`:
   `git push origin main staging-website-islam`
5. Susun laporan resmi pada `.agent/tasks/walkthrough.md`.
