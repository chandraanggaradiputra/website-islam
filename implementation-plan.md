# Rencana Implementasi: Alur Klaim Masjid Terdaftar (Opsi B) pada Pendaftaran & Persetujuan DKM

Branch Target: `staging-website-islam`

## 1. Ringkasan & Ruang Lingkup Perubahan
Tugas ini mengimplementasikan alur lengkap klaim kepengurusan DKM untuk masjid yang sudah terdaftar di direktori publik (Opsi B), tanpa mengganggu status tayang postingan masjid asli:
1. **Skenario Pengajuan Klaim Masjid Terdaftar (`lib/actions/dkm.ts`)**:
   - Ketika pengguna memilih masjid terdaftar (`isNewMasjid === false`), sistem memvalidasi ketersediaan masjid dan kepemilikan DKM (`!author || author <= 1`).
   - Membuat postingan moderasi baru di CPT `masjid` dengan status `pending` bertitel `[Klaim] ${namaMasjid}`, yang menyematkan metadata Base64 lengkap (`namaLengkap`, `email`, `wa`, `password`, `catatan`, `isNewMasjid: false`, `claimedMasjidId`, `namaMasjid`).
   - Postingan masjid asli tetap bertatus `publish` agar tidak hilang dari pencarian publik.
   - Mengirim notifikasi email kepada Administrator mengenai permohonan klaim masuk.
2. **Penyempurnaan Alur Persetujuan & Penolakan Admin (`lib/actions/dkm.ts`)**:
   - Pada `approveDKMRegistration`:
     - Membuat akun pengguna baru (`author`) di WordPress dengan username (email) dan password pendaftar.
     - **Percabangan Klaim (`isNewMasjid === false`)**: Memperbarui postingan masjid fisik asli (`claimedMasjidId`) dengan menyematkan `author: newUserId`, lalu menghapus postingan antrean klaim sementara secara permanen (`force=true`).
     - **Percabangan Usulan Baru (`isNewMasjid === true`)**: Menerbitkan postingan usulan menjadi `publish` dengan `author: newUserId`.
     - Mengirimkan email persetujuan resmi berisi kredensial login akun DKM.
   - Pada `rejectDKMRegistration`:
     - Menghapus postingan antrean sementara (`force=true`) tanpa memengaruhi postingan masjid asli.
     - Mengirim email penolakan dengan santun melalui Mailketing.
3. **Penyempurnaan Antrean Moderasi di Dasbor Admin (`components/dashboard/AdminDashboardTabs.tsx`)**:
   - Jika `metadata.isNewMasjid === false` (Klaim): Menampilkan badge biru `Klaim Masjid Terdaftar` serta teks informatif `Masjid Terkait: [Nama Masjid] (ID: #[claimedMasjidId])`.
   - Jika `metadata.isNewMasjid === true` (Usulan Baru): Menampilkan badge hijau `Usulan Masjid Baru`.
4. **Pembaruan Tipe Data (`types/index.ts`)**:
   - Menambahkan field opsional `claimedMasjidId?: number` pada antarmuka `DKMRegistrationApplication`.
5. **Verifikasi & Alur Git**:
   - Pengujian `npx tsc --noEmit` dan `npm run build` di root proyek.
   - Commit, merge ke `main`, dan push kedua branch ke remote GitHub (`origin`).
   - Penyusunan laporan akhir `walkthrough.md`.

---

## 2. Rincian Perubahan Berkas

### A. Tipe Data Antrean DKM
#### [MODIFY] [types/index.ts](file:///C:/website-islam/types/index.ts)
- Pada `DKMRegistrationApplication`:
  - Tambahkan properti `claimedMasjidId?: number;`.

---

### B. Alur Pengajuan, Persetujuan, & Penolakan Server Action
#### [MODIFY] [lib/actions/dkm.ts](file:///C:/website-islam/lib/actions/dkm.ts)
- **`getStoredRegistrations`**:
  - Deteksi status klaim secara komprehensif: `appData.isNewMasjid === false || Boolean(appData.claimedMasjidId) || masjidTitle.startsWith('[Klaim]') || masjidTitle.startsWith('KLAIM:')`.
  - Ekstrak `claimedMasjidId: isClaim ? (appData.claimedMasjidId || appData.masjidId) : undefined`.
  - Bersihkan judul klaim sehingga `masjidName` menampilkan nama masjid asli.
- **`submitDaftarDKM`**:
  - Saat `!isNewMasjid`:
    - Ambil data masjid fisik via `getMasjidById(claimedMasjidId)`.
    - Pastikan judul postingan antrean menggunakan format `[Klaim] ${existingMasjidTitle}`.
    - Simpan metadata Base64 dengan kunci `claimedMasjidId`, `namaMasjid`, `namaLengkap`, `wa`, dsb.
    - Kirim notifikasi email ke Admin perihal klaim masjid.
- **`approveDKMRegistration`**:
  - Deteksi apakah permohonan merupakan klaim (`isClaim`).
  - Buat akun pengguna WordPress baru -> peroleh `userId`.
  - Jika klaim:
    - Update masjid fisik asli `claimedMasjidId` dengan `{ author: userId }`.
    - Hapus entri klaim draft sementara `registrationId` (`force=true`).
  - Jika usulan baru:
    - Update entri `registrationId` menjadi `status: 'publish'` dan `{ author: userId }`.
  - Kirim email persetujuan resmi memuat kredensial akun ke email pengurus DKM.
- **`rejectDKMRegistration`**:
  - Baca metadata, kirim email penolakan ramah, dan hapus entri antrean `registrationId` (`force=true`). Masjid asli tetap aman.

---

### C. Pembaruan Kartu Antrean Moderasi Admin
#### [MODIFY] [components/dashboard/AdminDashboardTabs.tsx](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx)
- Pada baris antrean pendaftaran DKM (Tab 1):
  - Jika `!isNewMasjid`:
    - Render badge biru: `🏛️ Klaim Masjid Terdaftar` (`bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300`).
    - Render teks detail: `Masjid Terkait: [Nama Masjid] (ID: #[claimedMasjidId])`.
  - Jika `isNewMasjid`:
    - Render badge hijau: `✨ Usulan Masjid Baru` (`bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300`).

---

## 3. Rencana Verifikasi & Pengujian
1. **Type Checking**:
   - Jalankan `npx tsc --noEmit` untuk memastikan kesesuaian tipe data.
2. **Production Build**:
   - Jalankan `npm run build` untuk menjamin kompilasi Turbopack sukses tanpa error.
3. **Pengujian Fungsional**:
   - Uji payload pengajuan klaim masjid: memastikan postingan antrean berstatus `pending` bertitel `[Klaim] ...` dan memuat `claimedMasjidId` tanpa mengubah status masjid asli.
   - Uji alur persetujuan admin: memastikan akun pengguna WordPress dibuat, masjid fisik asli ditautkan ke `author: userId`, dan postingan pending sementara dihapus.
   - Uji alur penolakan admin: memastikan postingan pending dihapus sementara masjid fisik asli tetap aman.
   - Uji tampilan dashboard admin: memastikan badge biru klaim dan hijau usulan baru tampil sesuai spesifikasi.

---

## 4. Alur Git & Dokumentasi
1. Kerjakan dan selesaikan semua modifikasi di branch `staging-website-islam`.
2. Commit: `git commit -m "feat(dkm): implementasi alur klaim masjid terdaftar opsi b pada pendaftaran & persetujuan dkm"`.
3. Merge `staging-website-islam` ke `main`.
4. Push kedua branch ke remote GitHub `origin`.
5. Susun laporan akhir pada `walkthrough.md`.
