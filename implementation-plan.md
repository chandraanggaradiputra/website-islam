# Rencana Implementasi: Route Handler Cross-Posting Artikel Dakwah ke Media Sosial (TASK-2026-ISLAM-002)

Proyek: **Banten Mengaji (`website-islam`)**  
Direktori: `C:/website-islam`  
Branch Target: `staging-website-islam` (lalu merge ke `main`)  
Dokumentasi Alur:
1. Sebelum eksekusi: Buat `implementation-plan.md` untuk peninjauan
2. Setelah eksekusi: Verifikasi via terminal & buat `walkthrough.md` sebagai laporan resmi

---

## 1. Konteks & Tujuan Fitur

Membangun route handler otomatisasi native di Next.js App Router (`app/api/webhooks/social-share/route.ts`) yang menerima sinyal webhook saat artikel dakwah atau faedah baru diterbitkan di WordPress backend `https://salaf.maschandigital.id`.

Endpoint ini bertugas:
1. Memvalidasi token otorisasi webhook (`WEBHOOK_SECRET` dari header `x-webhook-secret` atau query param `?secret=`).
2. Menghubungkan teks artikel ke Gemini API (`gemini-1.5-flash`) untuk menghasilkan 3 variasi copywriting dakwah yang beradab dan berlandaskan manhaj Salaf:
   - **Facebook**: Tulisan faedah ilmiah mendalam, menyertakan dalil shahih, santun, dan menyematkan tautan baca artikel di `https://banten-mengaji.vercel.app/artikel/[slug]`.
   - **Instagram**: Caption visual padat hikmah mutiara Salaf, tidak bertele-tele, dilengkapi tagar dakwah lokal (`#BantenMengaji #KajianSunnahBanten #SerangMengaji #CilegonMengaji`).
   - **Threads**: Gaya percakapan nasihat ringkas yang mengalir (*thread-friendly*).
3. Mendistribusikan postingan ke Meta Graph API (Facebook Page & Instagram) serta Threads API resmi, lengkap dengan mode **dry-run** (simulasi defensif) saat token produksi belum disetel tanpa melempar crash.

---

## 2. User Review Required

> [!IMPORTANT]
> - **Zero Silent Fallback**: Jika `x-webhook-secret` / `secret` tidak valid atau kosong, server wajib mengembalikan HTTP 401 Unauthorized secara eksplisit.
> - **Defensive Mode / Dry-Run**: Jika `process.env.META_ACCESS_TOKEN` atau `process.env.THREADS_ACCESS_TOKEN` belum tersedia di environment, endpoint tetap sukses mengembalikan HTTP 200 dengan status `dry_run: true` dan menyajikan 3 hasil copywriting AI tanpa crash.
> - **Standar Syariat Islam**: Prompting Gemini diarahkan secara tegas mematuhi adab dakwah Islam, terminologi syar'i baku, dan manhaj Salafus Shalih tanpa kata-kata bombastis/clickbait.

---

## 3. Arsitektur & Berkas yang Dimodifikasi

```
C:/website-islam/
├── lib/
│   └── socialShare.ts                         # [NEW] Logika Gemini AI Captioning & Meta/Threads Publishing
├── app/
│   └── api/
│       └── webhooks/
│           └── social-share/
│               └── route.ts                   # [NEW] Webhook Route Handler (POST, GET, OPTIONS)
├── .env.example                               # [MODIFY] Menambahkan variabel env webhook & sosial media
├── implementation-plan.md                     # [MODIFY] Rencana kerja sebelum eksekusi
└── walkthrough.md                             # [MODIFY] Laporan resmi pasca eksekusi
```

---

## 4. Proposed Changes

### A. Helper Logika Sosial Media (`lib/socialShare.ts`)

#### [NEW] [socialShare.ts](file:///C:/website-islam/lib/socialShare.ts)
- **Fungsi `generateSocialCaptions({ title, excerpt, content, url, imageUrl })`**:
  - Membersihkan HTML tag dan meng-decode entitas HTML dari artikel menggunakan `decodeHtmlEntities`.
  - Memanggil endpoint REST Gemini API (`gemini-1.5-flash`):
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  - Mengirimkan system instruction terarah untuk menghasilkan format JSON terstruktur:
    ```json
    {
      "facebook": "...",
      "instagram": "...",
      "threads": "..."
    }
    ```
  - Menyediakan fallback template yang bersih dan elegan jika `GEMINI_API_KEY` tidak tersedia atau API mengalami kendala jaringan.
- **Fungsi `publishToSocialPlatforms({ captions, url, imageUrl })`**:
  - Mengecek ketersediaan `META_PAGE_ID`, `META_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID`, `THREADS_USER_ID`, dan `THREADS_ACCESS_TOKEN`.
  - Jika token belum lengkap: Menjalankan mode `dry_run: true` dan menandai status platform sebagai `simulated` dengan keterangan ramah.
  - Jika token lengkap:
    - **Facebook**: `POST https://graph.facebook.com/v21.0/${META_PAGE_ID}/feed` (atau photo).
    - **Instagram**: `POST https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media` lalu `media_publish`.
    - **Threads**: `POST https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads` lalu `threads_publish`.

---

### B. Webhook Route Handler (`app/api/webhooks/social-share/route.ts`)

#### [NEW] [route.ts](file:///C:/website-islam/app/api/webhooks/social-share/route.ts)
- **`POST` Handler**:
  1. Validasi secret:
     - Membaca header `x-webhook-secret` atau query param `?secret=`.
     - Validasi terhadap `process.env.WEBHOOK_SECRET || 'banten_mengaji_secret_2026'`.
     - Jika salah $\rightarrow$ return HTTP 401: `{ success: false, error: 'Unauthorized: Webhook secret tidak valid atau tidak disertakan.' }`.
  2. Ekstraksi payload artikel WordPress:
     - Mendukung format standar WordPress REST API maupun flat payload (`id`, `title`, `slug`, `content`, `excerpt`, `featured_media_url`).
     - Membangun URL publik: `https://banten-mengaji.vercel.app/artikel/${slug}`.
  3. Memanggil `generateSocialCaptions` dan `publishToSocialPlatforms`.
  4. Mengembalikan respons JSON HTTP 200:
     ```json
     {
       "success": true,
       "article_id": 123,
       "captions": {
         "facebook": "...",
         "instagram": "...",
         "threads": "..."
       },
       "status": "published" // atau "dry_run",
       "details": { ... }
     }
     ```
- **`GET` Handler**: Health check endpoint info.
- **`OPTIONS` Handler**: Preflight CORS.

---

### C. Pembaruan Variabel Lingkungan (`.env.example`)

#### [MODIFY] [.env.example](file:///C:/website-islam/.env.example)
- Menambahkan baris konfigurasi:
  ```env
  # Webhook Cross-Posting Dakwah ke Media Sosial
  WEBHOOK_SECRET=banten_mengaji_secret_2026
  GEMINI_API_KEY=
  META_PAGE_ID=
  META_ACCESS_TOKEN=
  INSTAGRAM_ACCOUNT_ID=
  THREADS_USER_ID=
  THREADS_ACCESS_TOKEN=
  ```

---

## 5. Verification Plan

### Automated Tests & Type Checking
1. **Pengecekan Tipe TypeScript**:
   ```powershell
   cd C:\website-islam
   npm exec tsc -- --noEmit
   ```
   (Wajib lulus 0 error pada seluruh berkas baru).
2. **Kompilasi Rute Next.js**:
   Memastikan route baru `ƒ /api/webhooks/social-share` terdaftar dalam manifes Next.js.

### Manual / Integration Verification via Terminal
1. **Uji Validasi Otorisasi Webhook (401 Unauthorized)**:
   - Kirim `POST /api/webhooks/social-share` tanpa secret $\rightarrow$ Verifikasi HTTP 401.
   - Kirim `POST /api/webhooks/social-share` dengan secret salah $\rightarrow$ Verifikasi HTTP 401.
2. **Uji Eksekusi Webhook dengan Secret Valid (Dry-Run Mode)**:
   - Kirim payload artikel uji coba (misal: faedah "Adab Menuntut Ilmu Menurut Salaf") dengan secret valid.
   - Verifikasi respons HTTP 200, return 3 variasi caption (Facebook, Instagram, Threads), dan status `dry_run: true`.
3. **Uji Parsing & Formatting Syar'i**:
   - Memastikan caption Facebook memiliki tautan baca lengkap.
   - Memastikan caption Instagram memuat tagar `#BantenMengaji #KajianSunnahBanten #SerangMengaji #CilegonMengaji`.
   - Memastikan caption Threads ringkas dan mengalir.

### Git & Deployment Flow
1. Bekerja di branch `staging-website-islam`.
2. Commit dengan pesan terstruktur: `feat(webhook): implementasi cross-posting artikel dakwah ke medsos [TASK-2026-ISLAM-002]`.
3. Fast-forward merge ke `main` dan push remote (`git push origin main staging-website-islam`).
4. Menyusun laporan resmi di `walkthrough.md`.
