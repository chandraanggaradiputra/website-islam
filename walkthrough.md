# Walkthrough: Implementasi Alur Klaim Masjid Terdaftar (Opsi B) pada Pendaftaran & Persetujuan DKM

## Ringkasan Eksekusi
Seluruh tahapan implementasi **Alur Klaim Masjid Terdaftar (Opsi B)** telah berhasil dikerjakan pada branch `staging-website-islam`, diverifikasi bebas galat menggunakan `npx tsc --noEmit` dan `npm run build` (Turbopack), digabungkan (merge) ke branch `main`, dan telah dipush ke GitHub remote (`origin staging-website-islam` dan `origin main`).

---

## 1. Rincian Pekerjaan yang Diselesaikan

### A. Skenario Pengajuan Klaim Masjid Terdaftar (`lib/actions/dkm.ts`)
- **Fungsi `submitDaftarDKM`**:
  - Ketika calon pengurus DKM memilih masjid yang sudah terdaftar di sistem (`isNewMasjid === false`):
    - Mengambil ID masjid yang dipilih (`claimedMasjidId = Number(masjidOption)`).
    - Memvalidasi kepemilikan tunggal via `getMasjidById(claimedMasjidId)`: jika masjid sudah memiliki author DKM (`existingMasjid.author > 1`), proses dibatalkan dengan pesan yang ramah dan edukatif.
    - Membuat entri postingan antrean baru di CPT `masjid` dengan status `'pending'` bertitel `[Klaim] ${existingMasjidTitle}`.
    - Menyematkan metadata pendaftar terenkripsi Base64 di konten postingan yang memuat:
      * `namaPengurus` / `namaLengkap`
      * `email`
      * `noWhatsapp` / `wa`
      * `password` (untuk diaktifkan saat disetujui)
      * `catatan`
      * `isNewMasjid: false`
      * `claimedMasjidId` & `masjidId`
      * `namaMasjid` & `masjidName`
    - **Proteksi Masjid Asli**: Postingan masjid fisik asli **tetap berstatus `publish`** sehingga masjid tidak hilang dari pencarian publik selama proses verifikasi berlangsung.
    - Mengirimkan email notifikasi kepada Administrator bahwa terdapat permohonan klaim kepengurusan masjid masuk.

---

### B. Penyempurnaan Alur Persetujuan & Penolakan Admin (`lib/actions/dkm.ts`)
- **Fungsi `approveDKMRegistration(registrationId)`**:
  - Mengekstrak dan mendekode metadata Base64 dari postingan pending.
  - Mendeteksi status permohonan secara komprehensif (`isClaim = appData.isNewMasjid === false || Boolean(appData.claimedMasjidId) || masjidTitle.startsWith('[Klaim]') || masjidTitle.startsWith('KLAIM:')`).
  - Membuat akun pengguna WordPress baru di `wp_users` (`roles: ['author']`) dengan kredensial email dan password pendaftar.
  - **Percabangan Logika Berdasarkan Status Permohonan**:
    * **Jika Klaim Masjid Terdaftar (`isClaim === true`)**:
      1. Menautkan author akun DKM ke postingan masjid fisik asli:
         `POST /wp-json/wp/v2/masjid/${claimedMasjidId}` dengan payload `{ "author": userId }`.
      2. Menghapus entri postingan antrean klaim sementara (`registrationId`) secara permanen:
         `DELETE /wp-json/wp/v2/masjid/${registrationId}?force=true`.
    * **Jika Usulan Masjid Baru (`isClaim === false`)**:
      - Mem-publish postingan usulan (`registrationId`) dengan `{ status: 'publish', author: userId, kecamatan: [...] }`.
  - Mengirim email persetujuan resmi melalui Mailketing berisi kredensial login (Email dan Password pendaftaran) ke pengurus DKM.

- **Fungsi `rejectDKMRegistration(registrationId)`**:
  - Mengekstrak metadata pendaftar dan mengirim email penolakan dengan santun.
  - Menghapus entri postingan antrean sementara (`registrationId`) dengan `force=true`.
  - Postingan masjid fisik asli pada Opsi B tetap utuh dan aman di direktori publik.

---

### C. Pembaruan Kartu Antrean di Dasbor Admin (`components/dashboard/AdminDashboardTabs.tsx`)
- Pada Tab 1 ("Antrean DKM & Usulan Masjid"):
  - **Klaim Masjid Terdaftar (`app.isNewMasjid === false`)**:
    - Menampilkan badge biru: `🏛️ Klaim Masjid Terdaftar` (`bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300`).
    - Menampilkan teks informasi terkait:
      `Masjid Terkait: [Nama Masjid Asli] (ID: #[claimedMasjidId])`.
  - **Usulan Masjid Baru (`app.isNewMasjid === true`)**:
    - Menampilkan badge hijau: `✨ Usulan Masjid Baru` (`bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300`).

---

### D. Penyelarasan Tipe Data (`types/index.ts`)
- Menambahkan field opsional `claimedMasjidId?: number;` pada antarmuka `DKMRegistrationApplication`.

---

## 2. Hasil Verifikasi & Pengujian
1. **Type Checking**:
   - Perintah: `npx tsc --noEmit`
   - Hasil: **Lolos 100% tanpa error (Exit code 0)**.
2. **Production Build**:
   - Perintah: `npm run build` (Next.js Turbopack)
   - Hasil: **Sukses terkompilasi 20 rute statis & dinamis (Exit code 0)**.
3. **Status Git**:
   - Commit ID: `e24c695`
   - Merge ke `main`: Fast-forward
   - Remote sync: Branch `staging-website-islam` dan `main` sinkron dengan remote GitHub (`origin`).
