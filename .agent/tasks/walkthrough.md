# Walkthrough: [TASK-BM-003] Peningkatan Aksesibilitas WCAG 2.2 AA, Responsivitas Mobile, dan Zero Silent Fallback (page.tsx & KajianCard.tsx)

Dokumen ini merupakan laporan resmi pelaksanaan dan verifikasi teknis perbaikan antarmuka publik beranda (`app/page.tsx`) dan kartu kajian (`components/kajian/KajianCard.tsx`) sesuai standar audit frontend modern WCAG 2.2 Level AA.

---

## 1. Ringkasan Perbaikan Arsitektur & Aksesibilitas

### A. Komponen Kartu Kajian (`components/kajian/KajianCard.tsx`)
1. **Focus State Standar WCAG 2.2 AA (`FOCUS_RING`)**:
   - Menerapkan ring fokus berstandar `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#093c96] dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900` pada seluruh tautan aksi.
2. **Pembersihan & Sanitasi Tanggal/Hari**:
   - Fungsi `formatTanggal(rawDate?: string): string | null` menangani format standar ISO (`YYYY-MM-DD`) dan format numerik ACF (`YYYYMMDD`), serta mengembalikan `null` bila data tidak valid sehingga tidak ada lagi teks `"undefined"` yang bocor ke layar pengguna.
   - Variabel `jadwalHari` divalidasi ketat (`Setiap ${acf.hari_kajian.trim()}`) hanya jika field tersedia.
3. **Rasio Kontras Warna (Contrast Ratio >= 4.5:1)**:
   - Warna teks sekunder/muted ditingkatkan dari `text-slate-600`/`text-slate-400` menjadi `text-slate-700 dark:text-slate-300 font-medium`.
   - Judul ustadz dan masjid menggunakan kontras tinggi `text-slate-900 dark:text-slate-100`.
   - Seluruh ikon Lucide diberi `aria-hidden="true"` untuk menjaga pengalaman pembaca layar (screen reader) tetap bersih.
4. **Responsivitas Layar Sempit (Mobile 375px)**:
   - Baris nama masjid diubah dari `line-clamp-1` menjadi `line-clamp-2` dengan `items-start` agar nama masjid yang panjang tetap terbaca utuh di layar HP tanpa terpotong.
5. **Aksesibilitas Tombol & Touch Target (WCAG 2.5.5 / 2.5.8)**:
   - Tombol link detail menerapkan touch target minimum `min-h-[44px]`.
   - Ditambahkan label konteks screen reader `<span className="sr-only">: {htmlParser(title.rendered)}</span>` sehingga pengguna tuna netra dapat membedakan tujuan navigasi antar kartu kajian.

---

### B. Beranda Utama (`app/page.tsx`)
1. **Hierarki Heading H1-H3 Semantik**:
   - Ditambahkan heading tingkat halaman tunggal `<h1 className="sr-only">Banten Mengaji, Portal Dakwah Sunnah Banten</h1>`.
   - Judul seksi ("Waktu Sholat", "Kajian Terdekat", "Direktori Masjid", "Artikel Terbaru") distandarisasi sebagai `<h2>` dengan atribut `aria-labelledby`.
   - Kartu kajian dan artikel menggunakan `<h3>` untuk menjaga hierarki dokumen HTML tetap valid dan terstruktur.
2. **Zero Silent Fallback & Ketahanan Runtime (`Promise.allSettled`)**:
   - Pemanggilan data diubah menggunakan `Promise.allSettled([getKajianList(), getMasjidList(), getArtikelList()])`.
   - Kegagalan pengambilan data (fetch error) dipisahkan secara tegas dari kondisi data kosong:
     * **Kondisi Fetch Gagal (`null`)**: Merender `StateBox error` dengan `role="alert"` dan pesan informatif kepada pengguna untuk memuat ulang halaman, serta mencatat error ke konsol server.
     * **Kondisi Data Kosong (`[]`)**: Merender `StateBox` informatif dengan `role="status"` ("Belum ada jadwal...", "Belum ada artikel...").
3. **Helper Komponen Bersih**:
   - `SectionHeader`: Menjamin seluruh tombol "Lihat Semua" memiliki touch target `min-h-[44px]`, styling `FOCUS_RING`, dan konteks screen reader yang eksplisit (`<span className="sr-only">: {srContext}</span>`).
   - `StateBox`: Kotak pesan status seragam dengan varian normal dan error untuk kontras visual yang jelas.
4. **Peningkatan Kartu Artikel**:
   - Menambahkan `FOCUS_RING` pada tautan kartu artikel.
   - Meningkatkan rasio kontras teks tanggal dan excerpt ke `text-slate-700 dark:text-slate-300 font-medium`.

---

## 2. Hasil Verifikasi Kualitas & Kompilasi

| No | Pengujian | Perintah / Alat | Status | Catatan |
|:---|:---|:---|:---:|:---|
| 1 | TypeScript Typecheck | `npx tsc --noEmit` | **PASS** | 0 error, semua tipe data dan props valid |
| 2 | Code Linting | `npx eslint app/page.tsx components/kajian/KajianCard.tsx` | **PASS** | 0 error, 0 warning |
| 3 | Production Build | `npm run build` | **PASS** | 23/23 halaman statis berhasil dioptimasi, zero build break |

---

## 3. Matriks Kepatuhan Aksesibilitas WCAG 2.2

| Kriteria WCAG | Level | Keterangan Implementasi | Hasil |
|:---|:---:|:---|:---:|
| **1.3.1 Info and Relationships** | A | Hierarki dokumen rapi: `<h1>` unik, `<h2>` pada tiap section, `<h3>` pada judul kartu | **Lolos** |
| **1.4.3 Contrast (Minimum)** | AA | Rasio kontras teks sekunder `text-slate-700 dark:text-slate-300` >= 4.5:1 | **Lolos** |
| **2.4.4 Link Purpose (In Context)** | A | Tautan "Lihat Semua" dan kartu memiliki label `sr-only` spesifik konteks | **Lolos** |
| **2.4.7 Focus Visible** | AA | Ring fokus kontras tinggi `FOCUS_RING` 2px dengan offset pada keyboard navigation | **Lolos** |
| **2.5.8 Target Size (Minimum)** | AA | Target klik/sentuh tombol navigasi berukuran minimal `44px x 44px` | **Lolos** |
| **4.1.3 Status Messages** | AA | Pesan error/status menggunakan `role="alert"` dan `role="status"` | **Lolos** |
