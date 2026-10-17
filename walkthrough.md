# Walkthrough - [AUDIT-COMPATIBILITY] Sinkronisasi & Audit Kompatibilitas Dashboard Super Admin & DKM

Repositori: `website-islam` (Banten Mengaji)  
Branch: `fix/audit-dashboard-admin-dkm-compatibility`  
Terkait Issue: #9 (Closes #9)  
Tanggal: 18 Oktober 2026  
Status Quality Gates: **PASSED (0 TypeScript Error, 0 Lint Error, Build Sukses)**

---

## 📌 Ringkasan Perubahan

Telah dilakukan audit menyeluruh dan sinkronisasi kompatibilitas antara **Dashboard Super Admin (`/dashboard/admin`)** dan **Dashboard Pengurus DKM (`/dashboard/dkm`)** untuk menutup celah kebocoran data lintas masjid (*cross-mosque data leakage*), menormalisasi relasi `acf.masjid_terkait`, menyinkronkan alur moderasi jadwal kajian (`status: 'pending'` -> `status: 'publish'`), serta memastikan UI state di `AdminDashboardTabs` dan `DKMKajianList` bebas dari *stale data* tanpa melanggar aturan linter React Hooks (`react-hooks/set-state-in-effect`).

---

## 🛠️ Rincian Modifikasi per Berkas

### 1. `types/index.ts`
- Menyematkan properti `masjid_id?: number | null;` pada interface `WPKajian` agar ID relasi masjid hasil ekstraksi dapat diakses secara type-safe di seluruh antarmuka komponen.

### 2. `lib/wordpress.ts`
- Membuat dan mengekspor fungsi helper terpusat `resolveMasjidIdFromAcf(raw: unknown): number | null`:
  - Menangani variasi format `number`, `string`, `WP_Post object` (`ID` atau `id`), maupun `Array<number | string | object>`.
- Memperbarui `enrichKajianWithMasjid()`:
  - Menggunakan `resolveMasjidIdFromAcf(raw)` untuk mendapatkan `targetId`.
  - Mengisi `masjid_id: targetId` pada setiap objek `WPKajian`.
  - Mempertahankan resolusi nama masjid asli dan Zero Silent Fallback (`null` jika tidak ditemukan, dilarang menyuntikkan nama default palsu).

### 3. `app/dashboard/dkm/layout.tsx`
- Mengubah fungsi layout menjadi `async function DKMDashboardLayout`.
- Menambahkan proteksi RBAC server-side:
  - Jika sesi tidak ada atau tidak valid: redirect ke `/login`.
  - Jika `session.role === 'admin'`: redirect ke `/dashboard/admin`.

### 4. `app/dashboard/admin/page.tsx`
- Mengganti balikan teks statis menjadi redirect tegas:
  - Jika sesi tidak ada: redirect ke `/login`.
  - Jika `session.role !== 'admin'`: redirect ke `/dashboard/dkm`.

### 5. `app/dashboard/dkm/page.tsx`
- Menambahkan verifikasi sesi dan guard redirect jika bukan role `dkm`.
- Mengimplementasikan **Zero Silent Fallback** pada `getDKMKajian(token, masjidId)`:
  - Jika `!masjidId || Number.isNaN(Number(masjidId)) || Number(masjidId) <= 0`, mengembalikan array kosong `[]` (tidak lagi mengembalikan seluruh kajian semua masjid).
  - Menggunakan URL endpoint dinamis `WP_BASE_URL` dengan parameter `status=publish,pending,draft&per_page=100&_embed`.
  - Menggunakan fallback otorisasi `authHeader = (token ? Bearer ... : null) || getWPAdminAuthHeader()`.
  - Memfilter daftar kajian secara presisi menggunakan `resolveMasjidIdFromAcf(k.acf?.masjid_terkait)`.

### 6. `app/dashboard/dkm/tambah-kajian/page.tsx`
- Menambahkan validasi sesi dan proteksi jika `session.role !== 'dkm'` (redirect ke `/dashboard/admin`).
- Menambahkan penanganan jika `!session.masjidId` dengan menampilkan kartu peringatan ramah yang mengarahkan pengurus DKM ke `/daftar-dkm`.

### 7. `lib/actions/kajian.ts`
- Pada `submitKajian()`:
  - Menetapkan status postingan berdasarkan role pengguna: `const postStatus = userRole === 'admin' ? 'publish' : 'pending'`.
  - Menyesuaikan pesan balikan untuk status pending ('Alhamdulillah, jadwal kajian berhasil diajukan dan sedang menunggu persetujuan Super Admin').
  - Menambahkan revalidasi rute lengkap: `/jadwal-kajian`, `/`, `/masjid`, `/sitemap.xml`, `/dashboard/dkm`, `/dashboard/admin`.
- Pada `approveKajian()`, `rejectKajian()`, `updateKajianStatus()`, `createKajianByAdmin()`, `updateKajianByAdmin()`, dan `deleteKajian()`:
  - Menggunakan fallback otorisasi `getWPAdminAuthHeader() || (session.token ? Bearer ... : null)`.
  - Memastikan bila disetujui atau dipublikasikan (`publish`), `acf.status_kajian` diset ke `'aktif'` dan memicu ping IndexNow.
  - Memastikan seluruh mutasi memanggil `revalidatePath('/dashboard/admin')` dan `revalidatePath('/dashboard/dkm')`.

### 8. `components/dashboard/AdminDashboardTabs.tsx`
- Mengimpor `resolveMasjidIdFromAcf` dari `@/lib/wordpress` untuk mengisi `currentMasjidId` di `AdminKajianModal`.
- Menambahkan pelacak penghapusan `deletedKajianIds` dan optimistik update `updatedKajianMap`.
- Menambahkan tombol aksi cepat status (Setujui / Publish untuk status `pending`, dan Kembalikan ke Pending untuk status `publish`) yang memperbarui UI secara optimis dan memanggil `router.refresh()`.
- Menghapus item dari tampilan secara optimis pada `handleDeleteKajian`.

### 9. `components/dashboard/DKMKajianList.tsx`
- Menghapus anti-pattern stale state `useState<WPKajian[]>(initialKajian)`.
- Menggunakan pola derived state:
  ```tsx
  const [updatedKajianMap, setUpdatedKajianMap] = useState<Record<number, WPKajian>>({});
  const kajianList = initialKajian.map((k) => updatedKajianMap[k.id] || k);
  ```
- Memperbarui `updatedKajianMap` pada `handleSubmitEdit` dan callback `CatatanFaedahModal` (`onSuccess`), lalu memanggil `router.refresh()` di dalam `startTransition`.

---

## 🧪 Hasil Verifikasi Quality Gates

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error** (Lolos).
2. **ESLint (`npm run lint`)**:
   - Status: **0 Error, 0 Warning** pada berkas yang dimodifikasi. (Hanya warning pra-eksisting pada hook `watch` react-hook-form di `DaftarDKMForm` & `TambahKajianForm`).
3. **Next.js Production Build (`npm run build`)**:
   - Status: **Compiled successfully** untuk seluruh 19 rute tanpa ada kegagalan kompilasi.

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
