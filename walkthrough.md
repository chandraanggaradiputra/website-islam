# Walkthrough Resmi: Route Handler Cross-Posting Artikel Dakwah ke Media Sosial (TASK-2026-ISLAM-002)

Platform: **Banten Mengaji (`banten-mengaji.vercel.app`)**  
Repositori: `https://github.com/chandraanggaradiputra/website-islam`  
Branch: `staging-website-islam` -> `main`  
Status: **SELESAI (100% Lulus Uji)**  

---

## 1. Ringkasan Perubahan

Telah diimplementasikan fitur otomatisasi cross-posting artikel dakwah dari WordPress backend `https://salaf.maschandigital.id` ke media sosial (Facebook, Instagram, Threads) menggunakan integrasi Gemini API (`gemini-1.5-flash`), Meta Graph API, dan Threads API dengan mode **Defensive Dry-Run**.

### Struktur Berkas Baru & Modifikasi
```
C:/website-islam/
├── lib/
│   └── socialShare.ts                         # [NEW] Logika Gemini AI Captioning & Meta/Threads Publishing
├── app/
│   └── api/
│       └── webhooks/
│           └── social-share/
│               └── route.ts                   # [NEW] Webhook Route Handler (POST, GET, OPTIONS)
├── .env.example                               # [MODIFY] Variabel env webhook & token sosial media
├── .env.local                                 # [MODIFY] Konfigurasi lokal & kunci API Gemini
├── implementation-plan.md                     # [MODIFY] Rencana kerja sebelum eksekusi
└── walkthrough.md                             # [NEW/MODIFY] Laporan resmi pengujian pasca eksekusi
```

---

## 2. Rincian Implementasi Fitur

### A. Helper Logika Media Sosial (`lib/socialShare.ts`)
- **`generateSocialCaptions({ title, excerpt, content, url, imageUrl })`**:
  - Membersihkan HTML tag dan meng-decode entitas HTML menggunakan `decodeHtmlEntities`.
  - Memanggil endpoint REST Gemini 1.5 Flash (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`) dengan API key yang dikonfigurasikan.
  - Memberikan instruksi sistem syar'i untuk menghasilkan 3 variasi copywriting dakwah:
    1. **Facebook**: Tulisan faedah ilmiah mendalam, kutipan dalil shahih, santun, dan tautan baca artikel di `https://banten-mengaji.vercel.app/artikel/[slug]`.
    2. **Instagram**: Caption visual padat hikmah mutiara Salaf, jeda baris rapi, dilengkapi tagar dakwah resmi: `#BantenMengaji #KajianSunnahBanten #SerangMengaji #CilegonMengaji #FaedahSalaf`.
    3. **Threads**: Gaya percakapan nasihat ringkas yang mengalir (*thread-friendly*).
  - Dilengkapi *defensive fallback caption generator* jika API key tidak tersedia atau API mengalami kendala jaringan.
- **`publishToSocialPlatforms({ captions, url, imageUrl })`**:
  - Mengirim postingan ke Meta Graph API (Facebook Page feed & Instagram media container) serta Threads API (thread container & publish).
  - **Defensive Mode / Dry-Run**: Jika `META_PAGE_ID`, `META_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID`, `THREADS_USER_ID`, atau `THREADS_ACCESS_TOKEN` belum disetel di environment produksi, fungsi menandai status platform sebagai `simulated` dengan pesan informatif dan menetapkan `dry_run: true` tanpa melempar crash.

### B. Webhook Route Handler (`app/api/webhooks/social-share/route.ts`)
- **Autentikasi Aman (*Zero Silent Fallback*)**:
  - Memvalidasi token `WEBHOOK_SECRET` dari header `x-webhook-secret` atau query param `?secret=`.
  - Menolak request tanpa secret valid dengan respons **HTTP 401 Unauthorized**:
    `{ "success": false, "error": "Unauthorized: Webhook secret tidak valid atau tidak disertakan." }`
- **Ekstraksi Payload WordPress**:
  - Menerima payload standar WordPress REST API maupun format kustom (`id`, `title`, `slug`, `content`, `excerpt`, `featured_media_url`).
  - Membangun URL publik: `https://banten-mengaji.vercel.app/artikel/${slug}`.
- **Respons HTTP 200 Terstruktur**:
  ```json
  {
    "success": true,
    "article_id": 101,
    "article_url": "https://banten-mengaji.vercel.app/artikel/adab-menuntut-ilmu-menurut-salaf-bagian-1",
    "captions": {
      "facebook": "...",
      "instagram": "...",
      "threads": "..."
    },
    "status": "dry_run",
    "details": {
      "dry_run": true,
      "platforms": {
        "facebook": { "status": "simulated", "message": "..." },
        "instagram": { "status": "simulated", "message": "..." },
        "threads": { "status": "simulated", "message": "..." }
      }
    }
  }
  ```

---

## 3. Hasil Verifikasi & Uji Integrasi (100% Lulus)

### A. TypeScript Type Check
```bash
npm exec tsc -- --noEmit
# Output: Exit code 0 (0 error)
```

### B. Next.js 16 Production Build (Turbopack)
```bash
npm run build
# Output: Compiled successfully in 115s
# Route ƒ /api/webhooks/social-share terdaftar sebagai dynamic route
```

### C. Automated Test Suite (19 Skenario Uji Lulus)
```
--- TEST 1: GET Health Check ---
[PASS] GET /api/webhooks/social-share returns 200
[PASS] Service status is online

--- TEST 2: Security & Secret Authorization (Zero Silent Fallback) ---
[PASS] POST without secret returns 401 Unauthorized
[PASS] POST with wrong secret returns 401 Unauthorized

--- TEST 3: Webhook Execution via Header Auth (Dry-Run Mode) ---
[PASS] POST with valid header secret returns 200 OK
[PASS] Response success is true
[PASS] Article ID matches payload
[PASS] Status is dry_run when platform tokens are unconfigured
[PASS] Facebook caption is generated
[PASS] Instagram caption is generated
[PASS] Threads caption is generated
[PASS] Instagram caption contains #BantenMengaji hashtag
[PASS] Facebook caption includes clean article URL
[PASS] Facebook distribution is simulated cleanly
[PASS] Instagram distribution is simulated cleanly
[PASS] Threads distribution is simulated cleanly

--- TEST 4: Webhook Execution via Query Param Auth ---
[PASS] POST with query param ?secret= returns 200 OK
[PASS] Query param auth success is true
[PASS] Article ID matches second payload

========================================
TOTAL PASSED: 19, FAILED: 0
========================================
```
