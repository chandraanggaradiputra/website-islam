# Rencana Implementasi: Refaktor Layout Dasbor Desktop (Flowbite Sidebar) & Harmonisasi Palet Warna #093c96

Branch Target: `staging-website-islam`

## 1. Ringkasan & Ruang Lingkup Perubahan
Tugas ini merefaktor antarmuka navigasi dasbor desktop menjadi lebih modern, terstruktur, dan elegan dengan mengadopsi standar **Flowbite Default Sidebar**:
1. **Modularisasi Komponen Sidebar (`components/dashboard/DashboardSidebar.tsx`)**:
   - Memisahkan kode sidebar dari `app/dashboard/layout.tsx` ke dalam komponen modular `'use client'`.
   - Memanfaatkan lebar standar Flowbite `w-64` (16rem / 256px), tinggi `h-screen sticky top-0`, latar belakang bersih `bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`, dan `overflow-y-auto`.
   - Hanya tampil pada viewport desktop (`hidden md:flex flex-col`), mempertahankan navigasi mobile yang ada.
2. **Harmonisasi Palet Warna Mas Chan Digital**:
   - **Primer / Brand**: Menggunakan **Royal Navy Mas Chan Digital** (`#093c96`) untuk elemen navigasi aktif (`bg-[#093c96] text-white shadow-sm shadow-[#093c96]/20 font-medium rounded-xl`) dan identitas brand.
   - **Aksen Islami**: Menggunakan **Warm Islamic Gold** (`#C5A059` / `#D4AF37`) untuk kartu masjid yang dikelola DKM, badge status verifikasi, dan aksen visual.
3. **Struktur Konten Sidebar**:
   - **Header**: Logo Banten Mengaji, badge portal, kartu profil user (nama, role badge), dan khusus DKM menampilkan kartu masjid binaan beserta wilayah kecamatannya dengan aksen gold.
   - **Menu Navigasi Dinamis**:
     - *Role DKM*: Dasbor (`/dashboard/dkm`), Profil Masjid Saya (`/dashboard/dkm/profil-masjid`), Tambah Jadwal Kajian (`/dashboard/dkm/tambah-kajian`), serta placeholder ber-badge "Segera" untuk Kegiatan & Keuangan.
     - *Role Admin*: Dasbor Admin (`/dashboard/admin`), Verifikasi DKM (`/dashboard/admin?tab=dkm`), Kelola Masjid (`/dashboard/admin?tab=masjid`), Kelola Kajian (`/dashboard/admin?tab=kajian`), Tambah Kajian Admin (`/dashboard/admin/tambah-kajian`), dan placeholder "Segera" untuk Kelola Pengguna & Pengaturan.
   - **Footer**: Tautan cepat "Lihat Situs Publik" (`/`) dengan ikon `ExternalLink` dan tombol "Logout" elegan dengan hover merah lembut.
4. **Refaktor `app/dashboard/layout.tsx`**:
   - Mengintegrasikan `<DashboardSidebar />` menggantikan inline desktop `<aside>`.
   - Meneruskan data sesi (`role`, `name`, `email`, `masjidName`, `masjidId`, dan kecamatan bila tersedia) secara proporsional.
   - Menjaga kebersihan tata letak kontainer konten utama (`flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50 dark:bg-slate-950`).
5. **Komentar Kode Proporsional**:
   - Memberikan komentar terstruktur pada setiap fungsi, state, dan blok UI utama untuk kemudahan pemahaman Product Owner.
6. **Alur Verifikasi & Git (MURNI FRONTEND)**:
   - Menjalankan `npx tsc --noEmit` dan `npm run build`.
   - Melakukan commit dan push **HANYA** ke remote branch `staging-website-islam` (**TIDAK MERGE KE `main`** sesuai aturan khusus pekerjaan frontend).

---

## 2. Rincian Perubahan Berkas

### A. Komponen Sidebar Dasbor Baru
#### [NEW] [components/dashboard/DashboardSidebar.tsx](file:///C:/website-islam/components/dashboard/DashboardSidebar.tsx)
- Komponen client (`'use client'`) yang menerima props:
  ```typescript
  export interface DashboardSidebarProps {
    userRole?: 'admin' | 'dkm';
    userName?: string;
    userEmail?: string;
    masjidName?: string;
    masjidId?: number;
    kecamatanName?: string;
  }
  ```
- Deteksi tautan aktif dinamis menggunakan `usePathname()` dan `useSearchParams()`.
- Bagian UI:
  1. *Header & Profil*: Logo Banten Mengaji, nama user, role badge (`Admin` / `Pengurus DKM`).
  2. *Kartu Masjid DKM*: Menampilkan nama masjid, lokasi/kecamatan, dan badge status resmi beraksen emas `#C5A059`.
  3. *Navigasi*: Daftar menu sesuai role pengguna dengan styling Flowbite dan warna aktif `#093c96`.
  4. *Footer*: Tautan "Lihat Situs Publik" dan aksi Logout via Server Action `logout`.

---

### B. Refaktor Tata Letak Dasbor
#### [MODIFY] [app/dashboard/layout.tsx](file:///C:/website-islam/app/dashboard/layout.tsx)
- Impor `DashboardSidebar` dari `@/components/dashboard/DashboardSidebar`.
- Ambil data sesi pengguna (`getSession()`).
- Jika user adalah DKM dan memiliki `masjidId`, ambil data masjid terkait secara asinkron (`getMasjidById`) untuk mengekstrak nama kecamatan/kota.
- Pasang `<DashboardSidebar ... />` di dalam `<Suspense>` boundary untuk performa streaming terbaik.
- Bersihkan markup desktop aside lama agar layout lebih rapi dan modular.
- Pertahankan mobile header (< md) dan desktop top header (md+) secara harmonis.

---

## 3. Rencana Verifikasi & Pengujian
1. **Type Checking**:
   - Jalankan `npx tsc --noEmit` di root proyek untuk memastikan tidak ada kesalahan tipe data TypeScript.
2. **Turbopack Build**:
   - Jalankan `npm run build` untuk memverifikasi bahwa proses kompilasi Next.js berhasil 100%.
3. **Verifikasi Visual & Interaksi Antarmuka**:
   - Memastikan sidebar desktop menetap di sisi kiri dengan lebar `w-64`, styling Flowbite, dan latar belakang responsif mode terang/gelap.
   - Memastikan warna aktif tautan menu menggunakan `#093c96` dengan bayangan lembut.
   - Memastikan kartu masjid DKM menampilkan aksen emas `#C5A059` yang serasi.
   - Memastikan navigasi pada mobile tetap berfungsi tanpa benturan layout.
   - Memastikan tombol logout dan kembali ke situs publik bekerja dengan baik.

---

## 4. Alur Git & Dokumentasi (Aturan Khusus Frontend)
1. Bekerja pada branch worktree `staging-website-islam`.
2. Lakukan commit perubahan:
   `git commit -m "feat(dashboard): refaktor layout dasbor desktop dengan flowbite sidebar & harmonisasi warna #093c96"`
3. **PUSH HANYA KE REMOTE `staging-website-islam`**:
   `git push origin staging-website-islam`
   *(PERINGATAN: Karena pekerjaan ini murni frontend visual/styling, DILARANG merge ke branch `main`).*
4. Susun laporan akhir pada berkas `walkthrough.md`.
