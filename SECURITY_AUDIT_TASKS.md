# Temuan Audit Keamanan — Project Website Islam (Banten Mengaji)

> **Untuk**: AI Agent (Gemini Spark / Antigravity) yang mengerjakan repo ini.
> **Konteks**: Hasil audit keamanan atas repo `chandraanggaradiputra/website-islam`
> (situs live: kajian-sunnah-serang.vercel.app), berdasarkan review langsung ke source code.
> **Cara pakai**: Setiap bagian di bawah adalah 1 task independen. Kerjakan urut dari
> 🔴 Kritis dulu. Setelah tiap task selesai, jalankan **Protokol Git Push** dari
> `ANTIGRAVITY_RULES.md` (`npx tsc --noEmit && git add . && git commit -m "..." && git push origin main`).
> Baca juga `SECURITY_STANDARDS.md` sebelum mulai — itu prinsip jangka panjang yang
> berlaku di luar daftar temuan spesifik ini.

## Ringkasan
| Severity | Jumlah |
|---|---|
| 🔴 Kritis | 2 |
| 🟠 Tinggi | 2 |
| 🟡 Sedang | 1 |

---

## 🔴 KRITIS-1 — JWT_SECRET fallback ke default hardcoded

**File**: `lib/auth.ts` baris 8, `middleware.ts` baris 5

**Masalah**
```ts
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-development-only-12345');
```
String default ini sudah ada di histori commit repo **publik**. Kalau env var `JWT_SECRET`
belum di-set di Vercel, siapa pun yang baca kode ini bisa membuat cookie session palsu
dengan `role: "admin"`, menandatanganinya pakai secret yang sudah bocor ini, lalu masuk
`/dashboard/admin` tanpa login sungguhan sama sekali.

**Perbaikan yang diharapkan**
1. Hapus fallback string. Ganti dengan pola *fail-fast*:
   ```ts
   if (!process.env.JWT_SECRET) {
     throw new Error('JWT_SECRET environment variable is required and must not use a default value.');
   }
   const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
   ```
2. Idealnya pindahkan logic ini ke satu helper bersama (mis. `lib/env.ts`) supaya
   `lib/auth.ts` dan `middleware.ts` tidak duplikat (selaras dengan Prinsip 3 di
   `ANTIGRAVITY_RULES.md`: Single Source of Truth).
3. Tambahkan baris `JWT_SECRET=` ke `.env.example` dengan komentar cara generate
   (`openssl rand -base64 32`).
4. **Catatan untuk pemilik project (bukan tugas AI agent)**: set `JWT_SECRET` baru yang
   acak & panjang (≥32 byte) di Vercel → Project Settings → Environment Variables, untuk
   Production, Preview, dan Development.

**Acceptance criteria**: `npx tsc --noEmit` tetap 0 error; aplikasi melempar error jelas
saat build/start kalau `JWT_SECRET` tidak ada; tidak ada string default tersisa di kode.

---

## 🔴 KRITIS-2 — Data pendaftaran DKM (termasuk nomor rekening bank) disimpan sebagai flat file

**File**: `lib/actions/dkm.ts` (`REGISTRATIONS_FILE`, `getStoredRegistrations`, `saveRegistrations`)

**Masalah**
- Data pendaftar — nama, email, WA, dan untuk usulan masjid baru: `namaBank`,
  `nomorRekening`, `atasNamaRekening` — ditulis lewat `fs.writeFileSync()` ke
  `data/dkm-registrations.json`.
- File ini **tidak ada di `.gitignore`** → risiko data pribadi/finansial asli ter-commit
  permanen ke repo publik kalau pernah dijalankan dengan data nyata secara lokal.
- Vercel serverless function filesystem-nya read-only di luar `/tmp` (yang ephemeral per
  invocation) → penulisan file ini kemungkinan besar **tidak persisten di production**;
  data pendaftaran bisa hilang tanpa disadari.
- `getStoredRegistrations()` tidak melakukan pengecekan role/session sendiri — sepenuhnya
  mengandalkan pemanggilnya.

**Perbaikan yang diharapkan**
1. Migrasikan penyimpanan dari flat file ke penyimpanan persisten sungguhan. Karena
   arsitektur sudah headless WordPress, opsi termudah: buat custom post type/REST endpoint
   `dkm_registration` di `salaf.maschandigital.id`, mengikuti pola `masjid` & `kajian` yang
   sudah ada. Alternatif: database terkelola (Postgres/Supabase/Vercel Postgres).
2. Field finansial jangan pernah disimpan/diteruskan tanpa kontrol akses eksplisit di
   server-side — pastikan hanya endpoint dengan pengecekan role admin yang bisa membacanya.
3. Mitigasi sementara sebelum migrasi selesai: tambahkan `data/*.json` ke `.gitignore`
   sekarang juga.
4. Tambahkan pengecekan session/role langsung di dalam `getStoredRegistrations()` itu
   sendiri (defense in depth), jangan hanya mengandalkan caller-nya.

**Acceptance criteria**: Tidak ada lagi `fs.writeFileSync`/`fs.readFileSync` untuk data
personal di kode. Jika `git log -p -- data/` menunjukkan data pribadi asli pernah
ter-commit, eskalasikan ke pemilik repo untuk pembersihan histori git — AI agent jangan
me-rewrite histori git sendiri tanpa persetujuan eksplisit.

---

## 🟠 TINGGI-1 — Form "Lupa Password" hanya simulasi, tidak benar-benar berfungsi

**File**: `app/lupa-password/page.tsx` baris 32-37

**Masalah**
```ts
const onSubmit = async (data: ForgotPasswordFormValues) => {
  // Simulasi pengiriman request pemulihan password
  await new Promise((resolve) => setTimeout(resolve, 1000));
  setSubmittedEmail(data.email);
  setIsSubmitted(true);
};
```
Tidak ada email yang benar-benar terkirim atau proses reset yang terjadi. Satu-satunya
jalur pemulihan akun yang nyata adalah tombol WhatsApp ke Super Admin, tanpa verifikasi
identitas otomatis di baliknya.

**Perbaikan yang diharapkan**
1. Implementasikan reset password sungguhan: server action yang memanggil endpoint reset
   password WordPress (endpoint plugin JWT Auth, atau WP REST dengan application password)
   yang mengirim email berisi link/token sekali-pakai & kedaluwarsa (contoh: 30 menit).
2. Jangan bocorkan apakah email terdaftar atau tidak — selalu tampilkan pesan sukses
   generik, untuk mencegah user enumeration.
3. Kalau jalur WhatsApp manual tetap dipertahankan sebagai fallback, tambahkan langkah
   verifikasi minimal (mis. admin wajib mencocokkan data pengurus/masjid terdaftar)
   sebelum benar-benar melakukan reset — jangan reset langsung dari isi chat.

---

## 🟠 TINGGI-2 — Tidak ada rate limiting terlihat pada endpoint login

**File**: `lib/auth.ts` baris 52 (pemanggilan `salaf.maschandigital.id/wp-json/jwt-auth/v1/token`)

**Perbaikan yang diharapkan**
1. Verifikasi plugin pembatas percobaan login aktif & terkonfigurasi di backend WordPress
   (`salaf.maschandigital.id`) — ini di luar kode repo ini, catat sebagai tugas verifikasi.
2. Tambahkan rate limiting sebagai lapisan kedua di sisi Next.js (mis. berbasis IP +
   cooldown sederhana, atau Vercel Edge Middleware / Upstash Redis untuk solusi yang lebih
   robust).

---

## 🟡 SEDANG-1 — `dangerouslySetInnerHTML` tanpa sanitasi tambahan

**File**: `app/dashboard/dkm/page.tsx` baris 125

**Perbaikan yang diharapkan**: Sanitasi `kajian.title.rendered` dengan library seperti
`isomorphic-dompurify` sebelum di-render, sebagai lapisan pertahanan tambahan kalau suatu
saat sanitasi bawaan WordPress dilonggarkan atau akun DKM disusupi.

---

## Catatan — Ini Sudah Benar, Jangan Diubah
- Pola session cookie (`httpOnly`, `secure` di production, `sameSite: lax`) di
  `lib/auth.ts` sudah benar — pertahankan.
- `next.config.ts` → `images.remotePatterns` sudah dikunci ke domain spesifik
  (`salaf.maschandigital.id`), bukan wildcard — pertahankan.
- Tidak ada file `.env` asli atau kredensial hardcoded lain yang ter-commit ke repo.
