# Rencana Implementasi: Penyempurnaan Email Akun DKM, UX Pendaftaran Masjid, & Pembersihan Istilah Backend

Branch Target: `staging-website-islam`

## 1. Ringkasan & Ruang Lingkup Perubahan
Pekerjaan ini mencakup peningkatan pengalaman pengguna (UX) dan keandalan data pada alur pendaftaran serta persetujuan akun DKM di portal Banten Mengaji:
1. **Email Kredensial Persetujuan DKM**: Pengurus DKM yang disetujui akan menerima email resmi yang memuat rincian kredensial akun (Email/Username dan Password pendaftaran) dalam box HTML berdesain elegan beserta tombol langsung ke halaman login dashboard.
2. **UX Pemilihan Masjid & Pencegahan Duplikasi**:
   - Menata ulang dropdown pemilihan masjid di formulir pendaftaran DKM publik:
     - Opsi teratas: `+ Daftarkan Masjid Baru`.
     - Masjid belum ber-DKM (`!author || author <= 1`): Status aktif, label format `[Nama] (Kec. [Kecamatan]) - Belum Ada DKM`.
     - Masjid sudah ber-DKM (`author > 1`): Status dinonaktifkan (`disabled={true}`), label format `[Nama] (Kec. [Kecamatan]) - [Sudah Dikelola oleh DKM Masjid]`.
     - Jika pada kota terpilih belum ada masjid sama sekali: Otomatis membuka formulir pendaftaran masjid baru (`isNewMasjid = true`).
   - Mencegah pendaftaran masjid baru yang duplikat (nama masjid sama di kecamatan yang sama dalam kota/kabupaten tersebut) di server action `submitDaftarDKM`.
3. **Pembersihan Istilah Programmer/Backend di Sisi Pengguna**: Mengganti teks mentah seperti "WordPress", "REST API", dan pesan galat teknis di antarmuka publik dan pesan error menjadi bahasa Indonesia yang sopan, profesional, dan ramah pengguna.
4. **Validasi & Workflow Git**: Menjalankan kompilasi ketat (`npx tsc --noEmit` dan `npm run build`), melakukan commit, penggabungan branch `staging-website-islam` ke `main`, push ke GitHub `origin`, dan menyusun `walkthrough.md`.

---

## 2. Rincian Perubahan Berkas

### A. Integrasi Password pada Email Persetujuan DKM
#### [MODIFY] [lib/mailketing.ts](file:///C:/website-islam/lib/mailketing.ts)
- Perbarui tanda tangan fungsi `sendDKMApprovalEmail(data: { email: string; namaMasjid: string; password?: string })`.
- Tambahkan box kredensial HTML yang rapi dengan latar belakang lembut (`#f8fafc`), border rounded, teks kontras, dan penanda jelas:
  - **Email / Username**: `{email}`
  - **Password**: `{password}` (atau teks petunjuk default jika password tidak tersedia)
  - Penjelasan bahwa sandi ini adalah sandi yang dibuat saat pendaftaran.
  - Tombol aksi menuju halaman login dashboard (`${SITE_URL}/login`).

#### [MODIFY] [lib/actions/dkm.ts](file:///C:/website-islam/lib/actions/dkm.ts)
- Pada fungsi `approveDKMRegistration`:
  - Teruskan `password: appData.password || undefined` ke pemanggilan `sendDKMApprovalEmail`.
  - Ubah pesan balasan sukses dari `"Akun DKM & profil masjid berhasil disetujui! Akun pengguna WordPress telah dibuat dan siap digunakan login."` menjadi `"Akun DKM & profil masjid berhasil disetujui! Akun pengurus DKM telah aktif dan siap digunakan untuk masuk ke sistem."`.

---

### B. Penyempurnaan UX Pemilihan Masjid & Pencegahan Duplikasi
#### [MODIFY] [components/dashboard/DaftarDKMForm.tsx](file:///C:/website-islam/components/dashboard/DaftarDKMForm.tsx)
- Pada `filteredMasjidList`:
  - Sertakan seluruh masjid di kota/kabupaten terpilih (baik yang belum diklaim maupun yang sudah dikelola DKM).
- Pada dropdown pemilihan masjid:
  - Tempatkan opsi `+ Daftarkan Masjid Baru` (`value="NEW_MASJID"`) di posisi paling atas setelah placeholder netral.
  - Untuk setiap masjid, sertakan nama kecamatan dengan bantuan `resolveKecamatanName(m.kecamatan?.[0] || m.acf?.kecamatan, kecamatanTerms)`.
  - Masjid yang belum ber-DKM: `[Nama Masjid] (Kec. [Nama]) - Belum Ada DKM`.
  - Masjid yang sudah ber-DKM: Atribut `disabled={true}`, kelas visual nonaktif, dengan label `[Nama Masjid] (Kec. [Nama]) - [Sudah Dikelola oleh DKM Masjid]`.
- Deteksi Kota Tanpa Masjid:
  - Saat kota dipilih atau berubah, jika daftar masjid di kota tersebut kosong (`masjidsInKota.length === 0`), otomatis set nilai `masjidOption` ke `'NEW_MASJID'` dan tampilkan form pendaftaran masjid baru secara langsung.
- Pembersihan teks: Ubah pesan konfirmasi sukses di baris 285 dari `"akun pengurus WordPress Anda..."` menjadi `"akun pengurus DKM Anda..."`.

#### [MODIFY] [lib/actions/dkm.ts](file:///C:/website-islam/lib/actions/dkm.ts)
- Pada fungsi `submitDaftarDKM` saat `isNewMasjid === true`:
  - Lakukan pemeriksaan terhadap data masjid terdaftar (`getMasjidList()`).
  - Lakukan pencocokan nama (case-insensitive, mengabaikan spasi berlebih dan variasi prefiks "Masjid") serta kecamatan pada kota/kabupaten yang sama.
  - Jika ditemukan duplikasi:
    Batalkan pengiriman dan kembalikan galat:
    `"Masjid dengan nama '[Nama]' di Kecamatan [Kecamatan] sudah terdaftar. Silakan pilih masjid tersebut dari daftar atau hubungi admin jika ingin mengklaim kepengurusan."`

---

### C. Pembersihan Istilah Programmer / Backend
#### [MODIFY] [lib/actions/kajian.ts](file:///C:/website-islam/lib/actions/kajian.ts)
- Ubah pesan galat baris 118:
  - Dari: `return { success: false, error: 'WordPress Error [${kajianRes.status}]: ${errorBody}' };`
  - Menjadi: `return { success: false, error: 'Gagal menerbitkan jadwal kajian ke server portal Banten Mengaji. Silakan coba beberapa saat lagi.' };`

#### [MODIFY] [app/kebijakan-privasi/page.tsx](file:///C:/website-islam/app/kebijakan-privasi/page.tsx)
- Pada bagian keamanan data pengguna (baris 88):
  - Dari: `melalui sistem autentikasi WordPress REST API & JWT berstandar industri.`
  - Menjadi: `melalui sistem autentikasi server portal Banten Mengaji & standar keamanan industri.`

#### [MODIFY] [lib/auth.ts](file:///C:/website-islam/lib/auth.ts)
- Sanitasi pesan error autentikasi agar pesan sistem backend tidak menampilkan kata mentah "WordPress" kepada pengguna.

---

## 3. Rencana Verifikasi & Pengujian
1. **Pemeriksaan Tipe TypeScript**:
   - Jalankan `npx tsc --noEmit` untuk memastikan tidak ada kesalahan tipe data.
2. **Kompilasi Turbopack Build**:
   - Jalankan `npm run build` di direktori repositori fisik `C:\website-islam`.
3. **Pengujian Fungsional**:
   - Uji payload `sendDKMApprovalEmail` dengan menyertakan password dan memeriksa output HTML box kredensial.
   - Uji logika dropdown form pendaftaran DKM: opsi teratas Daftarkan Masjid Baru, pembedaan label masjid ber-DKM (disabled) vs belum ber-DKM (enabled), dan auto-open form masjid baru bila kota kosong.
   - Uji validasi server pencegahan duplikasi masjid baru dengan nama dan kecamatan yang sama.
   - Uji pesan-pesan error dan UI publik untuk menjamin seluruh istilah backend telah bersih.

---

## 4. Alur Git & Pelaporan
1. Pastikan seluruh berkas termodifikasi tersimpan pada branch `staging-website-islam`.
2. Commit dengan pesan standar:
   `git commit -m "feat(dkm): penyempurnaan email kredensial dkm, ux pendaftaran masjid & pembersihan istilah backend"`
3. Lakukan penggabungan (merge) `staging-website-islam` ke branch `main`.
4. Push kedua branch ke remote GitHub (`origin staging-website-islam` dan `origin main`).
5. Buat berkas laporan hasil pengerjaan `walkthrough.md`.
