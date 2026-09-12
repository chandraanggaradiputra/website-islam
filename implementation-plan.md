# Rencana Implementasi: Validasi Kepemilikan Tunggal DKM per Masjid, Pembersihan Typo "Akhwat", & Penerapan Workflow Baru

## Ringkasan Tugas
Tugas ini mencakup:
1. **Validasi Kepemilikan Tunggal DKM per Masjid**: Memastikan 1 masjid hanya dapat diklaim dan dikelola oleh 1 akun DKM resmi (`author > 1`), menyaring masjid yang sudah diklaim dari dropdown formulir pendaftaran DKM publik, serta mengunci otorisasi pembuatan/pembaruan kajian di Server Actions (`submitKajian` / `createKajian` & `updateKajianByDkm`) dan antarmuka form DKM (`TambahKajianForm.tsx`).
2. **Pembersihan Typo "Akhawat" Menjadi "Akhwat"**: Menyelaraskan seluruh komponen publik, formulir dashboard, dan tipe data agar menggunakan istilah baku syar'i `"Khusus Akhwat"`, termasuk helper defensif `formatKategoriJamaah` untuk normalisasi data lama.
3. **Pustaka Fasilitas**: Menjaga kompatibilitas `normalizeFasilitas` dalam memetakan input `'area khusus akhwat'` ke enum ACF WordPress tanpa menimbulkan error backend `rest_not_in_enum`.
4. **Alur Workflow Proyek**: Menjalankan pengujian ketat (`npx tsc --noEmit` dan `npm run build`), commit berkas, penggabungan branch `staging-website-islam` ke `main`, push ke GitHub, serta menyusun laporan `walkthrough.md`.

---

## 1. Rencana Perubahan Berkas

### A. Tipe Data & Helper Kategori Jamaah
- **Berkas**: `types/index.ts` (dan re-export `types/wordpress.ts`)
- **Tindakan**:
  - Konfirmasi tipe `export type KategoriJamaah = 'umum' | 'khusus_ikhwan' | 'khusus_akhwat';`
  - Tambahkan fungsi pembersih label defensif `formatKategoriJamaah(kategori?: string): string` yang mengembalikan `'Khusus Akhwat'` jika terdapat kata `'akhwat'` atau `'akhawat'`, `'Khusus Ikhwan'` jika terdapat `'ikhwan'`, dan `'Umum'` sebagai default.

### B. Validasi Pendaftaran DKM & Dropdown Masjid
- **Berkas**: `lib/actions/dkm.ts`
  - Pada `submitDaftarDKM`:
    - Validasi ketika pengguna memilih masjid yang sudah ada (`!isNewMasjid`).
    - Panggil `getMasjidById(Number(masjidOption))`.
    - Jika `existingMasjid?.author && existingMasjid.author > 1`, batalkan dan kembalikan pesan ramah:
      `"Masjid ini sudah memiliki pengurus DKM resmi yang terdaftar. 1 Masjid hanya dapat dikelola oleh 1 akun DKM. Silakan hubungi Admin Banten Mengaji jika memerlukan koordinasi kepengurusan."`
- **Berkas**: `components/dashboard/DaftarDKMForm.tsx`
  - Pada useMemo `filteredMasjidList`: Saring hanya masjid yang belum diklaim (`!m.author || m.author <= 1`).
  - Pada `FASILITAS_OPTIONS`: Perbarui teks opsi dari `'Area Khusus Akhawat (Hijab)'` menjadi `'• Area Khusus Akhwat (Hijab)'` / `'Area Khusus Akhwat (Hijab)'`.

### C. Penguncian Akses Upload & Edit Jadwal Kajian DKM
- **Berkas**: `lib/actions/kajian.ts`
  - Pada `submitKajian` (dan buat alias `export const createKajian = submitKajian`):
    - Validasi sesi untuk peran `dkm`:
      - `userMasjidId = Number(session.masjidId)`.
      - `targetMasjidId = Number(formData.get('masjid_terkait') || formData.get('masjidId') || userMasjidId)`.
      - Jika `!userMasjidId || targetMasjidId !== userMasjidId`, tolak akses dengan pesan:
        `"Akses Ditolak: Anda hanya berhak mengelola jadwal kajian untuk masjid resmi yang terhubung dengan akun DKM Anda."`
  - Pada `updateKajianByDkm`:
    - Periksa otorisasi DKM terhadap `session.masjidId` dan verifikasi bahwa payload `masjid_terkait` tidak menunjuk ke masjid lain.
  - Normalisasi penyimpanan `kategori_jamaah` agar selalu menyimpan `'khusus_akhwat'`.
- **Berkas**: `components/dashboard/TambahKajianForm.tsx`
  - Ekstrak prop `masjidId` dan `masjidName`.
  - Sisipkan `masjid_terkait` ke form data tersembunyi.
  - Pastikan field pilihan masjid untuk peran `dkm` terkunci permanen.
  - Pastikan opsi dropdown kategori jamaah bernilai `khusus_akhwat` dan berlabel `"Khusus Akhwat"`.

### D. Normalisasi Fasilitas & Pembersihan Typo di Antarmuka
- **Berkas**: `lib/utils/fasilitas.ts`
  - Perbarui pemetaan `ACF_FASILITAS_MAP` dan keyword search agar `'area khusus akhwat'`, `'area khusus akhwat (hijab)'`, `'• area khusus akhwat (hijab)'`, dsb. terpetakan secara aman ke format ACF yang diterima backend tanpa memicu `rest_not_in_enum`.
- **Berkas**: `components/dashboard/DKMMasjidProfileForm.tsx`
  - Ganti opsi checklist dari `'Area Khusus Akhawat (Hijab)'` menjadi `'• Area Khusus Akhwat (Hijab)'` / `'Area Khusus Akhwat (Hijab)'`.
  - Normalisasi data `initialFasilitas` agar tidak terputus karena perbedaan ejaan.
- **Berkas**: `components/dashboard/AdminDashboardTabs.tsx`
  - Ganti opsi fasilitas `'Area Khusus Akhawat (Hijab)'` menjadi `'• Area Khusus Akhwat (Hijab)'` / `'Area Khusus Akhwat (Hijab)'`.
- **Berkas**: `components/kajian/KajianCard.tsx`
  - Gunakan `formatKategoriJamaah(acf.kategori_jamaah)` pada badge sehingga menampilkan label baku `"Khusus Akhwat"`.
- **Berkas**: `app/jadwal-kajian/[slug]/page.tsx`
  - Gunakan `formatKategoriJamaah(acf?.kategori_jamaah)` pada badge kategori jamaah untuk menampilkan teks `"Khusus Akhwat"`.
- **Berkas**: `components/kajian/KajianFilter.tsx`
  - Gunakan opsi dropdown berlabel `"Khusus Akhwat"` dengan nilai `khusus_akhwat`.
  - Terapkan logika filter defensif untuk mencakup data dengan ejaan lama maupun baru.

---

## 2. Strategi Pengujian & Verifikasi
1. **Verifikasi Statis & Tipe Data**:
   - Menjalankan `npx tsc --noEmit` untuk menjamin tidak ada kesalahan tipe data TypeScript.
2. **Kompilasi Turbopack / Next.js Build**:
   - Menjalankan `npm run build` untuk menjamin seluruh halaman terkompilasi dengan sempurna.
3. **Pengujian Fungsionalitas**:
   - Memastikan dropdown di form pendaftaran DKM hanya menampilkan masjid yang belum terhubung dengan akun DKM lain.
   - Memastikan server action `submitDaftarDKM` menolak klaim jika masjid sudah memiliki author DKM (`author > 1`).
   - Memastikan DKM terkunci hanya dapat mengunggah dan mengedit kajian untuk masjid miliknya.
   - Memastikan badge dan filter di halaman publik menampilkan `"Khusus Akhwat"`.

---

## 3. Alur Git Sesuai SOP
1. Seluruh perubahan diterapkan pada branch worktree `staging-website-islam`.
2. Verifikasi lolos `npx tsc --noEmit` dan `npm run build`.
3. Commit perubahan:
   - `git commit -m "feat(dkm): validasi kepemilikan tunggal dkm & normalisasi terminologi akhwat"`
4. Merge `staging-website-islam` ke `main`.
5. Push kedua branch ke remote GitHub (`origin staging-website-islam` dan `origin main`).
6. Penyusunan laporan akhir `walkthrough.md` di root proyek.
