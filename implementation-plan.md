# Rencana Implementasi: Modul Kelola DKM Masjid & Pengaturan Sistem di Dashboard Admin

Branch Target: `staging-website-islam`

## 1. Ringkasan & Ruang Lingkup Perubahan
Tugas ini mengimplementasikan dua modul baru pada Dasbor Super Admin untuk menggantikan placeholder ber-badge "Segera", sehingga Super Admin memiliki kendali penuh atas manajemen pengurus DKM dan konfigurasi pusat sistem:

1. **Modul Kelola DKM Masjid (Tab ke-4: `?tab=pengguna`)**:
   - Mengambil daftar seluruh pengurus DKM terdaftar (role `author` di WordPress REST API).
   - Menghubungkan setiap akun DKM dengan masjid binaan yang dikelolanya (`masjid.author === user.id`).
   - Menyediakan aksi cepat:
     - **Hubungi WhatsApp**: Tautan langsung ke WhatsApp pengurus DKM dengan pesan salam otomatis.
     - **Reset Password**: Modal interaktif untuk mereset kata sandi akun DKM langsung ke REST API WordPress tanpa perlu membuka WP-Admin.
2. **Modul Pengaturan Sistem (Tab ke-5: `?tab=pengaturan`)**:
   - Antarmuka komprehensif untuk mengelola parameter pusat:
     - **Kontak Dukungan DKM**: Nomor WhatsApp Admin (`0822-9814-8474`) dan Email Notifikasi (`admin@maschandigital.id`).
     - **Rekening Infaq & Donasi Portal**: Informasi perbankan resmi (BSI & Aladin Syariah) sebagai rujukan operasional dakwah.
     - **Status Integrasi API**: Pemantauan visual status 4 integrasi pihak ketiga (WordPress REST API, Mailketing API, EQuran.id, IndexNow Protocol).
3. **Pembaruan Navigasi Sidebar Desktop (`DashboardSidebar.tsx`)**:
   - Menghilangkan badge "Segera" pada menu `Kelola Pengguna` (diarahkan ke `/dashboard/admin?tab=pengguna`).
   - Menghilangkan badge "Segera" pada menu `Pengaturan Sistem` (diarahkan ke `/dashboard/admin?tab=pengaturan`).
4. **Server Actions Baru (`lib/actions/admin.ts`)**:
   - `getDKMUsersList()`: Mengambil dan memperkaya data pengguna DKM dengan masjid binaan dan kontak WhatsApp.
   - `resetDKMUserPassword(userId, newPassword)`: Memperbarui kata sandi akun WordPress DKM secara aman.
   - `getSystemSettings()` & `updateSystemSettings(settings)`: Membaca dan menyimpan konfigurasi pengaturan pusat ke berkas persisten JSON.
5. **Verifikasi & Alur Git**:
   - Pengujian `npx tsc --noEmit` dan `npm run build`.
   - Commit dan merge `staging-website-islam` ke `main`, lalu push ke remote GitHub `origin`.

---

## 2. Rincian Perubahan Berkas

### A. Tipe Data Baru
#### [MODIFY] [types/index.ts](file:///C:/website-islam/types/index.ts)
- Tambahkan antarmuka:
  ```typescript
  export interface DKMUserItem {
    id: number;
    name: string;
    email: string;
    username: string;
    phone?: string;
    masjidId?: number;
    masjidName?: string;
    kecamatanName?: string;
    registeredDate: string;
  }

  export interface SystemSettings {
    whatsappAdmin: string;
    emailAdmin: string;
    donasiBankName: string;
    donasiAccountNumber: string;
    donasiAccountHolder: string;
    donasiBankSecondaryName?: string;
    donasiAccountSecondaryNumber?: string;
    donasiAccountSecondaryHolder?: string;
  }
  ```

---

### B. Server Actions Administrasi Baru
#### [NEW] [lib/actions/admin.ts](file:///C:/website-islam/lib/actions/admin.ts)
- **`getDKMUsersList()`**:
  - Validasi sesi Super Admin.
  - Memanggil `GET /wp-json/wp/v2/users?per_page=100&context=edit` dengan `Authorization: getWPAdminAuthHeader()`.
  - Filter pengguna ber-role `author`.
  - Menggabungkan data dengan `getMasjidList()` (mencocokkan `m.author === u.id`) dan nomor kontak WhatsApp dari metadata registrasi/masjid.
- **`resetDKMUserPassword(userId: number, newPassword: string)`**:
  - Validasi sesi Super Admin dan panjang minimal password (>= 6 karakter).
  - Memanggil `POST /wp-json/wp/v2/users/${userId}` dengan payload `{ password: newPassword }`.
  - Revalidasi path `/dashboard/admin`.
- **`getSystemSettings()`**:
  - Membaca konfigurasi dari `data/system-settings.json` dengan fallback ke `DEFAULT_SYSTEM_SETTINGS`.
- **`updateSystemSettings(settings: SystemSettings)`**:
  - Menyimpan payload ke `data/system-settings.json`.
  - Revalidasi path `/dashboard/admin` dan `/donasi`.

---

### C. Pembaruan Tab Dasbor Admin
#### [MODIFY] [components/dashboard/AdminDashboardTabs.tsx](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx)
- Perluas tipe `activeTab` mencakup `'pengguna' | 'pengaturan'`.
- Terima props baru: `dkmUsers: DKMUserItem[]` dan `initialSettings: SystemSettings`.
- Tambahkan tombol navigasi Tab 4 ("Pengurus DKM") dan Tab 5 ("Pengaturan Sistem").
- **Konten Tab 4 (Pengurus DKM)**:
  - Pencarian dinamis (nama pengurus, email, username, nama masjid).
  - Tabel dan kartu daftar DKM dengan badge masjid binaan beraksen emas `#C5A059`.
  - Aksi "Hubungi WA" (tautan langsung ke `wa.me`) dan "Reset Password".
  - Modal Reset Password interaktif dengan fitur generator kata sandi acak dan penanganan loading state.
- **Konten Tab 5 (Pengaturan Sistem)**:
  - Formulir Kartu 1: Kontak Resmi & Dukungan.
  - Formulir Kartu 2: Rekening Donasi Resmi Portal.
  - Kartu 3: Indikator Status Koneksi API (WordPress, Mailketing, EQuran, IndexNow).

---

### D. Pembaruan Server Halaman Dasbor Admin
#### [MODIFY] [app/dashboard/admin/page.tsx](file:///C:/website-islam/app/dashboard/admin/page.tsx)
- Panggil `getDKMUsersList()` dan `getSystemSettings()` secara paralel dengan query lainnya.
- Teruskan `dkmUsers` dan `initialSettings` ke komponen `<AdminDashboardTabs />`.

---

### E. Pembaruan Sidebar Navigasi Desktop
#### [MODIFY] [components/dashboard/DashboardSidebar.tsx](file:///C:/website-islam/components/dashboard/DashboardSidebar.tsx)
- Ubah menu `Kelola Pengguna` dari placeholder menjadi tautan aktif ke `/dashboard/admin?tab=pengguna`.
- Ubah menu `Pengaturan Sistem` dari placeholder menjadi tautan aktif ke `/dashboard/admin?tab=pengaturan`.
- Hilangkan badge "Segera" pada kedua item tersebut.

---

## 3. Rencana Verifikasi & Pengujian
1. **Type Checking**:
   - Jalankan `npx tsc --noEmit` untuk memastikan tidak ada kesalahan tipe data TypeScript.
2. **Kompilasi Produksi**:
   - Jalankan `npm run build` untuk memverifikasi Turbopack build berhasil 100%.
3. **Pengujian Fungsional**:
   - Verifikasi pengambilan daftar DKM dan pencocokan masjid binaan.
   - Verifikasi alur Reset Password via modal ke REST API WordPress.
   - Verifikasi pembaruan dan penyimpanan pengaturan sistem ke file JSON.
   - Verifikasi tautan navigasi sidebar membuka tab yang tepat.

---

## 4. Alur Git & Dokumentasi (Melibatkan Backend)
1. Commit seluruh perubahan di branch `staging-website-islam`:
   `git commit -m "feat(admin): modul kelola dkm masjid dan pengaturan sistem di dasbor admin"`
2. Merge `staging-website-islam` ke `main`:
   ```bash
   git checkout main
   git merge staging-website-islam
   git push origin main
   git checkout staging-website-islam
   ```
3. Susun laporan akhir pada berkas `walkthrough.md`.
