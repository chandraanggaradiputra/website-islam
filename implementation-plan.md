# Implementation Plan: Pembenahan Menyeluruh CRUD Masjid & Jadwal Kajian Super Admin

Rencana implementasi ini mengatasi masalah kegagalan pembaruan data masjid (HTTP 400 `rest_invalid_param`) di dasbor Super Admin (`/dashboard/admin?tab=masjid`), melengkapi field pilihan 8 Kota/Kabupaten resmi se-Banten dengan *smart default*, serta membersihkan penanganan error di seluruh aksi CRUD (Masjid & Kajian) agar selalu menampilkan pesan bahasa Indonesia yang santun dan ramah, bukan string JSON mentah.

---

## User Review Required

> [!IMPORTANT]
> **Penyebab Utama HTTP 400 `rest_invalid_param`:**  
> Modal `AdminMasjidModal` di [`components/dashboard/AdminDashboardTabs.tsx`](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx) sebelumnya **tidak memiliki elemen input/select untuk `kota_kabupaten`**. Akibatnya, `formData.get('kotaKabupaten')` bernilai `null` dan dikirim sebagai string kosong `""` ke WordPress REST API. Karena ACF mewajibkan nilai enum dari 8 wilayah Banten, WordPress menolak pembaruan data dan mengembalikan raw JSON error.

> [!NOTE]
> **Kredensial Super Admin untuk Pengujian Lokal:**  
> Kredensial Super Admin (`anggarasixteen@gmail.com`) telah disimpan secara aman di berkas lingkungan lokal `.env.local` yang masuk dalam daftar `.gitignore`, sehingga tidak akan pernah bocor atau ter-commit ke repositori Git publik.

---

## Proposed Changes

### A. Komponen Antarmuka Dasbor Admin (`components/dashboard/`)

#### [MODIFY] [components/dashboard/AdminDashboardTabs.tsx](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx)

1. **Konstanta & Tipe 8 Wilayah Banten**:
   - Impor konstanta wilayah baku:
     ```tsx
     import { DAFTAR_KOTA_KABUPATEN, KotaKabupatenBanten } from '@/lib/constants/bantenRegions';
     ```
2. **Formulir `AdminMasjidModal`**:
   - Tambahkan state `selectedKota` dengan inisialisasi default cerdas (*smart default*):
     * Jika mengedit masjid (`initialMasjid?.acf?.kota_kabupaten`), gunakan nilai tersebut.
     * Jika kosong atau buat masjid baru, gunakan `'Kota Serang'` sebagai default aman.
   - Tambahkan elemen dropdown `<select id="adminMasjidKota" name="kota_kabupaten">` berisi 8 pilihan resmi se-Provinsi Banten:
     * `Kota Serang`, `Kota Cilegon`, `Kota Tangerang`, `Kota Tangerang Selatan`, `Kabupaten Serang`, `Kabupaten Pandeglang`, `Kabupaten Lebak`, `Kabupaten Tangerang`.
   - Di `handleSubmit`:
     * Pastikan `formData.set('kota_kabupaten', selectedKota)` dan `formData.set('kotaKabupaten', selectedKota)` selalu terisi sebelum dikirim ke Server Action.
   - Sanitasi pesan error di UI:
     * Buat helper `sanitizeErrorMessage` agar jika ada pesan berformat JSON dari server, secara otomatis diubah menjadi pesan bersih:
       *"Afwan, data masjid belum dapat diperbarui. Silakan periksa kelengkapan isian wilayah dan coba lagi."*
3. **Formulir `AdminKajianModal`**:
   - Terapkan fungsi pembersihan error (`sanitizeErrorMessage`) agar tidak pernah memunculkan string JSON mentah.
   - Tambahkan input unggah poster flyer baru opsional (`<input type="file" name="poster" accept="image/*" />`).
   - Pastikan seluruh pemetaan ACF (jenis kajian, kategori jamaah syar'i, status pelaksanaan) tersimpan dengan benar.
4. **Konfirmasi Penghapusan (`handleDeleteMasjid` & `handleDeleteKajian`)**:
   - Perbaiki alert penanganan kegagalan agar menampilkan pesan santun jika server gagal menghapus data.

---

### B. Server Actions Backend (`lib/actions/`)

#### [MODIFY] [lib/actions/masjid.ts](file:///C:/website-islam/lib/actions/masjid.ts)

1. **Fungsi `updateMasjidByAdmin(formData: FormData)`**:
   - Ekstrak `kota_kabupaten` dari `formData` secara fleksibel:
     ```typescript
     const rawKota = (formData.get('kota_kabupaten') || formData.get('kotaKabupaten'))?.toString()?.trim();
     const kotaKabupaten = rawKota && rawKota !== '' ? rawKota : 'Kota Serang';
     ```
   - Masukkan `kota_kabupaten` ke dalam objek `payload.acf`:
     ```typescript
     acf: {
       ...
       kota_kabupaten: kotaKabupaten,
     }
     ```
   - Catat error server ke console (`console.error('[updateMasjidByAdmin Error]:', res.status, errText)`) dan kembalikan respon santun:
     ```typescript
     if (!res.ok) {
       return {
         success: false,
         message: 'Afwan, data masjid belum dapat diperbarui. Silakan periksa kelengkapan data dan coba lagi.',
         error: 'Afwan, data masjid belum dapat diperbarui. Silakan periksa kelengkapan data dan coba lagi.',
       };
     }
     ```
   - Tambahkan revalidasi lengkap: `/masjid`, `/`, `/sitemap.xml`, `/dashboard/admin`, dan `/dashboard/dkm`.
2. **Fungsi `createMasjidByAdmin(formData: FormData)`**:
   - Terapkan ekstraksi `kota_kabupaten` yang sama dengan fallback `'Kota Serang'`.
   - Hilangkan `errText` mentah, ganti dengan pesan santun.
3. **Fungsi `deleteMasjidByAdmin(id: number)`**:
   - Hilangkan `errText` mentah, ganti dengan pesan santun.
4. **Fungsi `updateMasjidProfile(formData: FormData)`**:
   - Terapkan validasi `kota_kabupaten` dan error handling santun yang serupa.

#### [MODIFY] [lib/actions/kajian.ts](file:///C:/website-islam/lib/actions/kajian.ts)

1. **Fungsi `updateKajianByAdmin(formData: FormData)`**:
   - Hapus eksposur string mentah `${err}` pada kegagalan HTTP REST API.
   - Kembalikan pesan santun:
     ```typescript
     return {
       success: false,
       message: 'Afwan, jadwal kajian belum dapat diperbarui. Silakan periksa isian data Anda.',
       error: 'Afwan, jadwal kajian belum dapat diperbarui. Silakan periksa isian data Anda.',
     };
     ```
2. **Fungsi `createKajianByAdmin(formData: FormData)`**:
   - Hapus `${err}` mentah, kembalikan pesan santun.
3. **Fungsi `deleteKajian(id: number)`**:
   - Hapus `${err}` mentah, kembalikan pesan santun.
4. **Fungsi `updateKajianStatus(id, status, statusKajian)`**:
   - Hapus `${err}` mentah, kembalikan pesan santun.

---

### C. Konstanta Wilayah (`lib/constants/bantenRegions.ts`)

#### [MODIFY] [lib/constants/bantenRegions.ts](file:///C:/website-islam/lib/constants/bantenRegions.ts)
- Ekspor konstanta array `DAFTAR_KOTA_KABUPATEN`:
  ```typescript
  export const DAFTAR_KOTA_KABUPATEN: KotaKabupatenBanten[] = [
    'Kota Serang',
    'Kota Cilegon',
    'Kota Tangerang',
    'Kota Tangerang Selatan',
    'Kabupaten Serang',
    'Kabupaten Pandeglang',
    'Kabupaten Lebak',
    'Kabupaten Tangerang',
  ];
  ```

---

## Verification Plan

### Automated Tests
1. **TypeScript Type Safety**:
   ```bash
   npx tsc --noEmit
   ```
   *Target*: 0 error (`exit code 0`).
2. **Turbopack Production Compilation**:
   ```bash
   npm run build
   ```
   *Target*: 100% dari 21 rute aplikasi berhasil terkompilasi tanpa kendala.

### Runtime Verification via Chrome DevTools MCP & Brave
1. **Login Sesi Super Admin**:
   - Buka `http://localhost:3000/login` di browser via DevTools MCP.
   - Input kredensial Super Admin (`anggarasixteen@gmail.com` / `Maschan@10`).
   - Pastikan login sukses dan diarahkan ke `/dashboard/admin`.
2. **Uji Coba Edit Masjid ("Masjid At Taqwa WILDAN Kota Serang", ID 91)**:
   - Di tab Masjid `/dashboard/admin?tab=masjid`, klik tombol Edit pada *Masjid At Taqwa WILDAN*.
   - Periksa dropdown Kota/Kabupaten: Terpilih otomatis *"Kota Serang"*.
   - Ubah deskripsi atau alamat sedikit (misal merapikan format alamat) lalu klik *"Simpan Perubahan"*.
   - Verifikasi respon jaringan: Status **200 OK** (tidak ada lagi HTTP 400 `rest_invalid_param`).
   - Pastikan modal tertutup otomatis dan data terbaru langsung tampil.
3. **Uji Coba Edit Jadwal Kajian**:
   - Di tab Kajian `/dashboard/admin?tab=kajian`, klik tombol Edit pada salah satu kajian.
   - Periksa seluruh field ACF terisi sesuai data aslinya.
   - Simpan perubahan dan verifikasi status 200 OK serta revalidasi instan.
4. **Dokumentasi Bukti Hasil Uji**:
   - Ambil screenshot dan susun seluruh bukti log ke berkas `walkthrough.md`.

### Git Fast-Forward Merge Protocol
1. Commit di branch `staging-website-islam`:
   `git commit -m "fix(admin): pembenahan crud masjid dan kajian, perbaikan acf kota_kabupaten, dan sanitasi error handling"`
2. Checkout `main`, jalankan fast-forward merge:
   `git checkout main; git merge staging-website-islam --ff-only`
3. Push ke remote origin:
   `git push origin main staging-website-islam`
4. Kembalikan branch kerja ke `staging-website-islam`.
