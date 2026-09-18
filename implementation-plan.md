# Implementation Plan: Pembenahan Aksesibilitas WCAG 2.2, Alur Auto-Publish DKM, Caching, & UX Formulir Kajian

Berdasarkan evaluasi sistem dan masukan pengurus DKM Masjid At Taqwa WILDAN Kota Serang, rencana implementasi ini menyempurnakan alur publikasi jadwal kajian, performa caching dan SEO instan, antarmuka pengisian formulir kajian (UX & pemilih waktu 24 jam), serta pemenuhan standar aksesibilitas internasional **WCAG 2.2 Level AA**.

---

## User Review Required

> [!IMPORTANT]
> **Perubahan Alur Bisnis: Auto-Publish Jadwal Kajian DKM**  
> Jadwal kajian yang dikirim oleh pengurus DKM terverifikasi akan **langsung terbit (`status: 'publish'`, ACF `status_kajian: 'aktif'`)** tanpa menunggu moderasi atau persetujuan manual Super Admin. Jadwal baru akan langsung muncul di katalog publik `/jadwal-kajian`, halaman beranda `/`, dan sitemap XML `/sitemap.xml`, serta memicu notifikasi otomatis ke mesin pencari melalui protokol IndexNow.

> [!NOTE]
> **Penyelarasan Skema Validasi Jenis Kajian (Rutin vs Tematik)**  
> - **Kajian Rutin**: Pilihan Hari Kajian (Senin–Ahad) menjadi **wajib**, sedangkan tanggal pelaksanaan spesifik bersifat opsional.  
> - **Kajian Tematik**: Tanggal pelaksanaan menjadi **wajib**, sedangkan pilihan hari bersifat opsional.  
> - **Kategori Jamaah**: Diselaraskan ke opsi baku syar'i: *"Umum (Ikhwan & Akhwat)"*, *"Khusus Ikhwan"*, dan *"Khusus Akhwat"*.

---

## Proposed Changes

Grouped by layer & component:

### A. Backend & Caching Layer (`lib/actions/`)

#### [MODIFY] [lib/actions/kajian.ts](file:///C:/website-islam/lib/actions/kajian.ts)
- **Fungsi `submitKajian(formData: FormData)`**:
  - Ubah parameter status posting WordPress REST API dari `'pending'` menjadi `'publish'`.
  - Pastikan ACF field `status_kajian` diset ke `'aktif'`.
  - Tangkap atribut `slug` dari respon WordPress saat kajian baru dibuat.
  - Tambahkan revalidasi cache instan:
    ```typescript
    revalidatePath('/jadwal-kajian');
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    revalidatePath('/dashboard/dkm');
    revalidatePath('/dashboard/admin');
    ```
  - Panggil auto-ping IndexNow ke Bing, Yandex, & Naver:
    ```typescript
    if (slug) {
      const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'banten-mengaji.vercel.app';
      notifySearchEngines([`https://${host}/jadwal-kajian/${slug}`]).catch(() => {});
    }
    ```
  - Tangani error dengan pesan ramah, santun, dan informatif (menghilangkan istilah teknis REST API / Database):
    ```typescript
    return {
      success: false,
      message: "Afwan, jadwal kajian belum dapat disimpan. Silakan periksa isian data Anda atau coba beberapa saat lagi.",
      error: "Afwan, jadwal kajian belum dapat disimpan. Silakan periksa isian data Anda atau coba beberapa saat lagi."
    };
    ```
- **Fungsi `updateKajianByDkm(formData: FormData)`**:
  - Perbaiki pesan error teknis menjadi bahasa Indonesia yang santun.
  - Pastikan revalidasi mencakup `/jadwal-kajian`, `/`, `/sitemap.xml`, dan detail kajian slug terkait.

#### [MODIFY] [lib/actions/dkm.ts](file:///C:/website-islam/lib/actions/dkm.ts)
- Bersihkan pesan error mentah database/server menjadi pesan informatif yang ramah.
- Pastikan revalidasi jalur caching lengkap saat DKM disetujui atau dimutakhirkan.

---

### B. Form UX & Input Guide (`components/dashboard/`)

#### [MODIFY] [components/dashboard/TambahKajianForm.tsx](file:///C:/website-islam/components/dashboard/TambahKajianForm.tsx)
- **Skema Zod Dinamis (`zodResolver`)**:
  - Gunakan `.superRefine` untuk memvalidasi:
    * Jika `jenisKajian === 'rutin'`: `hariKajian` wajib diisi.
    * Jika `jenisKajian === 'tematik'`: `tanggal` wajib diisi.
- **Label & Panduan Antarmuka Pengguna**:
  - *Jenis Kajian*: Pilihan jelas:
    * `"Kajian Rutin (Pekanan / Bulanan)"`
    * `"Kajian Tematik (Tabligh Akbar / Bedah Kitab)"`
  - *Indikator Wajib*: Teks dinamis pada label `Hari Kajian` ("Wajib untuk Rutin") dan `Tanggal Pelaksanaan` ("Wajib untuk Tematik").
  - *Jam Mulai & Selesai*: Tambahkan teks bantuan:
    `"Format 24 Jam (Contoh: 18.30 untuk Ba'da Maghrib, 20.00 untuk Ba'da Isya)"`
  - *Kategori Jamaah*: Opsi baku:
    * `umum`: `"Umum (Ikhwan & Akhwat)"`
    * `khusus_ikhwan`: `"Khusus Ikhwan"`
    * `khusus_akhwat`: `"Khusus Akhwat"`
  - *Tautan Streaming*: Placeholder informatif `"https://youtube.com/... atau tautan kajian online lainnya"`.
- **Notifikasi Sukses**:
  - Ganti pesan konfirmasi menjadi:
    `"Jazakallahu khairan. Jadwal kajian berhasil dipublikasikan dan langsung tayang di portal Banten Mengaji."`

#### [MODIFY] [components/dashboard/AdminDashboardTabs.tsx](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx)
- Selaraskan modal `AdminKajianModal` dengan panduan format waktu 24 jam dan pilihan jenis kajian yang seragam.

---

### C. Standar Aksesibilitas WCAG 2.2 Level AA

#### [MODIFY] [components/kajian/KajianCard.tsx](file:///C:/website-islam/components/kajian/KajianCard.tsx)
- **Target Size (SC 2.5.8)**:
  - Tautan "Lihat Detail Lengkap" / "Tonton Rekaman" diperbarui dengan padding yang proporsional dan `min-h-[44px]` (fleksibel dengan sentuhan jari layar sentuh).
- **Kontras Warna Badge (SC 1.4.3 - Minimum 4.5:1)**:
  - Badge Tematik: Ubah `text-amber-700 bg-amber-100` (rasio < 4.5:1) menjadi `bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800` (rasio kontras > 6.5:1).
  - Badge Rutin: `bg-blue-100 text-blue-900 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800` (rasio kontras > 7:1).
  - Badge Jamaah & Status: Tingkatkan kontras teks ke minimum 4.5:1 pada latar terang maupun mode gelap.

#### [MODIFY] [components/masjid/MasjidCard.tsx](file:///C:/website-islam/components/masjid/MasjidCard.tsx)
- Tingkatkan kontras badge fasilitas dari `text-slate-600` menjadi `text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700` (rasio > 7:1).
- Pastikan tombol "Lihat Profil" dan "Rute Maps" memenuhi tinggi minimum `min-h-[44px]`.

#### [MODIFY] [components/ui/ShareButton.tsx](file:///C:/website-islam/components/ui/ShareButton.tsx)
- **Label in Name (SC 2.5.3)**:
  - Selaraskan label yang terlihat dengan nama aksesibilitas: tombol dengan teks tampak *"Bagikan ke WhatsApp"* dan atribut `aria-label="Bagikan ke WhatsApp"`.
  - Pastikan tinggi tombol memenuhi `min-h-[40px]`.

#### [MODIFY] [components/ui/FontResizer.tsx](file:///C:/website-islam/components/ui/FontResizer.tsx)
- **Label in Name (SC 2.5.3)**:
  - Ubah `aria-label` agar menyertakan teks yang terlihat:
    * Tombol `A-`: `aria-label="A- (Perkecil ukuran teks)"`
    * Tombol `A+`: `aria-label="A+ (Perbesar ukuran teks)"`
  - Berikan target sentuh `min-h-[36px] min-w-[36px]`.

#### [MODIFY] [components/kajian/KajianFilter.tsx](file:///C:/website-islam/components/kajian/KajianFilter.tsx)
- Pastikan tombol filter reset, tab "Mendatang" dan "Arsip" memiliki target sentuh minimum 44px dan rasio kontras teks badge memenuhi kriteria WCAG 2.2.

---

## Verification Plan

### Automated Build & Type Tests
1. **TypeScript Type Safety**:
   ```bash
   npx tsc --noEmit
   ```
   *Target*: 0 error (`exit code 0`).
2. **Turbopack Production Compilation**:
   ```bash
   npm run build
   ```
   *Target*: 100% seluruh 21 rute aplikasi terkompilasi sukses.

### Runtime Verification via Chrome DevTools MCP (Brave)
1. **Pengujian Form Tambah Kajian**:
   - Jalankan server `npm run dev` pada `http://localhost:3000`.
   - Buka halaman `/dashboard/dkm/tambah-kajian` menggunakan viewport smartphone (390×844 px).
   - Uji validasi jenis kajian Rutin (Hari wajib) dan Tematik (Tanggal wajib).
   - Periksa format pemilih waktu jam (format 24 jam).
2. **Audit Lighthouse Aksesibilitas WCAG 2.2**:
   - Jalankan Lighthouse audit pada halaman `/jadwal-kajian` dan `/dashboard/dkm/tambah-kajian`.
   - *Target*: Skor Accessibility ≥ 95 dan SEO 100.
3. **Dokumentasi Hasil**:
   - Catat hasil pengujian dan tangkapan layar ke dalam dokumen `walkthrough.md`.

### Git Fast-Forward Merge Protocol
1. Commit di branch `staging-website-islam`.
2. Push ke remote `origin staging-website-islam`.
3. Checkout ke `main`, merge `staging-website-islam` (--ff-only), lalu push ke `origin main`.
4. Kembalikan branch kerja ke `staging-website-islam`.
