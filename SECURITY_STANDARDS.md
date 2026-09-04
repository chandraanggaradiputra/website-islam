# Standar Keamanan Proyek "Website Islam" (Mas Chan Digital)

> Dokumen ini pelengkap `ANTIGRAVITY_RULES.md`. Kalau `ANTIGRAVITY_RULES.md` mengatur
> *kualitas rekayasa kode*, dokumen ini mengatur *keamanan*. Berlaku untuk semua AI Agent
> (Gemini Spark, Antigravity, atau agent lain) yang mengerjakan proyek ini — sekarang dan
> ke depannya, tidak hanya untuk temuan yang sudah tercatat di `SECURITY_AUDIT_TASKS.md`.

## Prinsip Keamanan Baku

**Prinsip 1 (Zero Default Secret)**
Dilarang keras memberi nilai fallback/default untuk apa pun yang berkaitan dengan secret —
JWT secret, API key, database credential, dsb. Kalau environment variable wajib tidak ada,
aplikasi harus **gagal secara eksplisit** (`throw Error` saat startup/build), bukan diam-diam
memakai nilai default. Nilai default yang pernah ter-commit ke git harus dianggap bocor
permanen — rotasi ke nilai baru, jangan pernah dipakai ulang.

**Prinsip 2 (Data Sensitif Wajib di Database, Bukan File)**
Data pribadi (nama, email, nomor telepon) dan data finansial (nomor rekening, dsb) tidak
boleh disimpan sebagai file JSON/flat file di filesystem aplikasi — terutama di
Vercel/serverless yang filesystem-nya tidak persisten antar invocation. Gunakan penyimpanan
sungguhan (custom post type WordPress via REST, atau database terkelola). Sebelum menulis
kode yang menyentuh data seperti ini, pastikan dulu lokasi penyimpanannya sudah masuk
`.gitignore` kalau memang harus melalui file lokal untuk keperluan development.

**Prinsip 3 (Defense in Depth pada Otorisasi)**
Pengecekan role/session tidak boleh hanya dilakukan di satu lapisan (misalnya cuma di
`middleware.ts`, atau cuma di komponen halaman). Setiap fungsi yang membaca/mengubah data
sensitif — server action, route handler, helper apa pun — wajib melakukan pengecekan
sesi & role miliknya sendiri, walaupun pemanggilnya (caller) sudah mengecek juga.

**Prinsip 4 (Jangan Bikin Alur Palsu untuk Fitur Keamanan Akun)**
Dilarang membuat UI yang berpura-pura melakukan sesuatu (mis. `setTimeout` yang
mensimulasikan sukses) untuk fitur yang berkaitan dengan keamanan akun — reset password,
verifikasi email, OTP, dsb. Kalau backend-nya belum siap, tampilkan status "fitur belum
tersedia" secara jujur ke pengguna, jangan simulasikan hasil sukses palsu.

**Prinsip 5 (Rate Limit di Semua Endpoint Auth)**
Setiap endpoint yang menerima kredensial (login, reset password, OTP, dsb) wajib punya
pembatasan percobaan — baik di backend WordPress (plugin) maupun idealnya lapisan kedua di
Next.js. Jangan berasumsi backend sudah otomatis aman tanpa verifikasi.

**Prinsip 6 (Sanitasi Semua Konten Dinamis)**
Setiap penggunaan `dangerouslySetInnerHTML` wajib melalui sanitizer
(`isomorphic-dompurify` atau setara), termasuk untuk konten yang berasal dari sumber
"tepercaya" seperti WordPress — sumber tepercaya pun bisa disusupi.

**Prinsip 7 (Audit Environment Variable)**
Setiap kali menambahkan `process.env.SESUATU_BARU` di kode, wajib ditambahkan juga entri-nya
ke `.env.example` (tanpa nilai asli, cukup nama variabel + komentar singkat) supaya
kebutuhan konfigurasi selalu terdokumentasi dan tidak ada yang lupa di-set saat deploy.

**Prinsip 8 (Least Privilege pada Token Pihak Ketiga)**
Token dari sistem lain (mis. JWT WordPress dari `jwt-auth`) yang disimpan di dalam session
aplikasi hanya boleh dipakai untuk operasi yang benar-benar butuh privilege itu. Jangan
perluas scope/role yang diminta lebih dari yang diperlukan oleh halaman/fitur yang
memanggilnya.

**Prinsip 9 (Cek Ulang Sebelum Commit Data Uji Coba)**
Saat testing lokal fitur yang melibatkan data pribadi (form pendaftaran, dsb), jangan
gunakan data asli/nyata. Kalau terpaksa memakai data yang menyerupai data asli, pastikan
file hasil testing tersebut tidak ikut ter-*stage* sebelum `git commit`.

## Checklist Sebelum Commit / Deploy
Jalankan bersamaan dengan Protokol Git Push di `ANTIGRAVITY_RULES.md`:

- [ ] Tidak ada secret/API key/password hardcoded di kode (cek manual sebelum commit)
- [ ] `git status` dicek sebelum `git add .` — pastikan tidak ada file di `data/`, `.env`,
      atau sejenisnya yang ikut ter-stage tanpa sengaja
- [ ] Semua `process.env.*` baru sudah masuk `.env.example`
- [ ] Endpoint/server action baru yang menangani data pribadi atau finansial punya
      pengecekan role sendiri, bukan hanya mengandalkan middleware/halaman
- [ ] Tidak ada alur UI yang mensimulasikan hasil sukses tanpa backend sungguhan di
      baliknya, khususnya untuk fitur akun (login, reset password, registrasi)
- [ ] `dangerouslySetInnerHTML` yang baru ditambahkan sudah melalui sanitizer
