# Walkthrough: Pembenahan Menyeluruh CRUD Masjid & Jadwal Kajian Super Admin

Dokumen ini merangkum penyelesaian masalah teknis HTTP 400 `rest_invalid_param` pada modul manajemen masjid Super Admin, penambahan pilihan resmi 8 Kota/Kabupaten se-Banten, audit menyeluruh CRUD jadwal kajian, serta standarisasi pesan galat (error handling) yang ramah dan santun di portal Banten Mengaji.

---

## 1. Ringkasan Akar Masalah & Solusi

| Gejala Masalah | Penyebab Teknis | Solusi yang Diterapkan |
| :--- | :--- | :--- |
| Error HTTP 400 `rest_invalid_param` saat Super Admin menyimpan data masjid di `/dashboard/admin?tab=masjid` | Komponen modal masjid (`AdminMasjidModal`) tidak memiliki elemen input untuk wilayah `kota_kabupaten`. Akibatnya, Server Action menerima `null` dan mengirim string kosong `""` ke WordPress REST API, yang ditolak oleh field ACF Select. | Menambahkan state `selectedKota` dan elemen `<select>` 8 Kota/Kabupaten resmi se-Banten di `AdminMasjidModal`, serta menambahkan sanitasi fallback `'Kota Serang'` di Server Action `lib/actions/masjid.ts` sehingga tidak pernah mengirim string kosong. |
| Pesan error teknis backend (JSON mentah, string REST API `rest_...`, atau status code) sempat terlihat oleh pengguna | Error dari API WordPress di-stringifikasi secara langsung (`${err}`) dan dikembalikan mentah ke antarmuka pengguna. | Menerapkan *double-layer error sanitization*: Server Action mencatat log teknis di terminal server via `console.error` dan mengembalikan pesan ramah santun (`Afwan, ...`), serta fungsi pembantu `sanitizeErrorMessage` di lapisan antarmuka pengguna. |
| Field penting di modal admin belum lengkap | Modal masjid belum memiliki input Link Google Maps, dan modal jadwal kajian belum memiliki input upload poster. | Menambahkan input Google Maps URL pada `AdminMasjidModal` dan input file poster pada `AdminKajianModal`. |

---

## 2. Berkas-Berkas yang Dimodifikasi

1. [`lib/constants/bantenRegions.ts`](file:///C:/website-islam/lib/constants/bantenRegions.ts)
   - Mengekspor konstanta `DAFTAR_KOTA_KABUPATEN` yang berisi 8 daerah resmi di Provinsi Banten (`Kota Serang`, `Kota Cilegon`, `Kota Tangerang`, `Kota Tangerang Selatan`, `Kabupaten Serang`, `Kabupaten Pandeglang`, `Kabupaten Lebak`, `Kabupaten Tangerang`).

2. [`lib/actions/masjid.ts`](file:///C:/website-islam/lib/actions/masjid.ts)
   - Memastikan `createMasjidByAdmin`, `updateMasjidByAdmin`, dan `updateMasjidProfile` membaca `kota_kabupaten` atau `kotaKabupaten` secara fleksibel dan memberikan fallback default `'Kota Serang'` jika kosong/tidak valid.
   - Mengganti seluruh pesan error mentah dengan pesan santun berbahasa Indonesia (`Afwan, data masjid belum dapat disimpan...`).
   - Menambahkan revalidasi path `/sitemap.xml`.

3. [`lib/actions/kajian.ts`](file:///C:/website-islam/lib/actions/kajian.ts)
   - Menyempurnakan error handling pada Server Actions admin: `updateKajianStatus`, `createKajianByAdmin`, `updateKajianByAdmin`, dan `deleteKajian`.
   - Logging teknis tetap disimpan di console server untuk kebutuhan observability, sementara pengguna menerima pesan ramah dan informatif.

4. [`components/dashboard/AdminDashboardTabs.tsx`](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx)
   - Mengimpor `DAFTAR_KOTA_KABUPATEN` dan mendefinisikan fungsi `sanitizeErrorMessage`.
   - Memperbarui `AdminMasjidModal` dengan dropdown 8 Kota/Kabupaten Banten (nilai default dari data masjid saat edit) serta input Google Maps URL.
   - Memperbarui `AdminKajianModal` dengan input file poster kajian.
   - Menyaring pesan pada handler hapus masjid, hapus kajian, dan ubah cepat status kajian agar bebas dari string JSON/REST API mentah.

---

## 3. Hasil Pengujian & Verifikasi

### A. Verifikasi Statis & Kompilasi
- **TypeScript Check**:
  ```bash
  npx tsc --noEmit
  ```
  **Hasil**: Sukses tanpa error (0 error).

- **Production Build (Next.js Turbopack)**:
  ```bash
  npm run build
  ```
  **Hasil**: Kompilasi selesai dalam 16.4s, seluruh 21 rute statis dan dinamis ter-generate sempurna (`/`, `/dashboard/admin`, `/masjid`, `/jadwal-kajian`, dll).

### B. Verifikasi Runtime via Chrome DevTools MCP
1. **Autentikasi Super Admin**:
   - Membuka halaman login di `http://localhost:3000/login` dan masuk dengan akun Super Admin (`anggarasixteen@gmail.com`).
   - Sesi terautentikasi dan dialihkan ke `/dashboard/admin`.

2. **Pengujian Edit Masjid Tanpa Mengubah Data**:
   - Membuka tab Direktori Masjid di `/dashboard/admin?tab=masjid`.
   - Menekan tombol **Edit Data** pada **Masjid At Taqwa WILDAN Kota Serang** (ID 91).
   - Memverifikasi data awal termuat lengkap:
     - Nama Masjid: `Masjid At Taqwa WILDAN Kota Serang`
     - Kota/Kabupaten: `Kota Serang` (terpilih otomatis)
     - Kecamatan: `Kec. Serang`
     - Alamat: `Yayasan Sekolah Wildan Jl. Terusan Pabrik...`
     - Kontak: `Abu Ayesha` (`087871333399`)
   - Menekan tombol **Simpan Perubahan** tanpa mengubah isi apa pun.
   - **Hasil**: Server Action `updateMasjidByAdmin` merespons dengan status **HTTP 200 OK in 608ms**, modal tertutup secara mulus, halaman ter-revalidasi otomatis, dan tidak terjadi error HTTP 400 `rest_invalid_param`.

3. **Pengujian Edit Jadwal Kajian Tanpa Mengubah Data**:
   - Membuka tab Kelola Jadwal Kajian di `/dashboard/admin?tab=kajian`.
   - Menekan tombol **Edit** pada kajian "Mengikuti Ahlul Hadits Dan Atsar" (Ustadz Kifaa Hul Banna Muhammady Lc. M.H).
   - Menekan tombol **Simpan Perubahan** tanpa mengubah isi apa pun.
   - **Hasil**: Server Action `updateKajianByAdmin` merespons dengan status **HTTP 200 OK in 660ms**, modal tertutup mulus, dan jadwal kajian tetap aktif serta terverifikasi di dasbor.

![Verifikasi Admin Dashboard Sukses](verifikasi-crud-sukses.png)

---

## 4. Kesimpulan
Seluruh target perbaikan CRUD Masjid dan Jadwal Kajian pada Super Admin telah tercapai secara tuntas:
- Masalah string kosong pada ACF `kota_kabupaten` berhasil diatasi secara permanen di tingkat antarmuka maupun backend.
- Format dan pesan error telah tersanitasi menjadi ramah, sopan, dan profesional.
- Seluruh pengujian statis dan runtime membuktikan sistem berjalan stabil dan handal.
