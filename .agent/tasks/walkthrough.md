# Walkthrough: [TASK-BM-002] Penguatan Keamanan & Stabilitas MCP Relay Banten Mengaji

Dokumen ini merupakan laporan resmi implementasi penguatan keamanan level aplikasi (AppSec) dan stabilitas runtime pada modul Remote MCP Server Banten Mengaji (`/api/mcp`).

---

## 1. Ringkasan Perbaikan & Arsitektur Keamanan

### A. Eliminasi Token Hardcoded & Otentikasi `timingSafeEqual`
- Menghapus string token statis `bm_oauth_token_active_2026` dari codebase.
- Otentikasi kini dipusatkan murni pada `process.env.AGENT_SECRET_KEY`.
- Membandingkan token masuk (`Bearer <token>` atau `x-agent-secret`) terhadap `AGENT_SECRET_KEY` menggunakan algoritma hashing SHA-256 dan `crypto.timingSafeEqual` dari `node:crypto` untuk mencegah serangan timing attack.
- Membatasi ukuran payload body maksimum hingga 64 KB (`MAX_BODY_BYTES = 64 * 1024`).

### B. Modul Kode Error Standar (`lib/mcp/errors.ts`)
- Standarisasi kode error JSON-RPC 2.0 (`RPC.PARSE`, `RPC.INVALID_REQUEST`, `RPC.METHOD_NOT_FOUND`, `RPC.INVALID_PARAMS`, `RPC.INTERNAL`, `RPC.UNAUTHORIZED`, `RPC.FORBIDDEN`, `RPC.RATE_LIMIT`).
- Kelas kustom `McpToolError extends Error` untuk propagasi kode error terstruktur.
- Pemetaan presisi ke status HTTP:
  * `-32000` (UNAUTHORIZED) -> `401 Unauthorized`
  * `-32001` (FORBIDDEN) -> `403 Forbidden`
  * `-32600` / `-32602` -> `400 Bad Request`
  * `-32601` -> `404 Not Found`
  * `-32603` -> `500 Internal Server Error`

### C. Pertahanan Jalur Berkas (`lib/mcp/path-guard.ts`)
- **Pencegahan Bypass URL-Encoding**: Menguraikan `decodeURIComponent` sebelum analisis segmen, mendeteksi `%2e%2e`, `%2Eenv`, dan null-byte `%00`.
- **Denylist Direktori & Ekstensi Sensitif**: Memblokir `.git`, `.ssh`, `.aws`, `.gnupg`, `docker`, `.kube`, `.vercel`, `node_modules`, serta pola file `.env*`, `*.pem`, `*.key`, `id_rsa*`, `credentials.json`, dll.
- **Allowlist Root Directory & Root Files**: Hanya mengizinkan pembacaan berkas pada direktori `app`, `components`, `lib`, `types`, `public`, `docs`, `.agent` atau file root `package.json`, `tsconfig.json`, `next.config.ts`, `README.md`.
- **Penguncian Tulis**: Menolak segala operasi tulis `dispatch_agent_task` di luar direktori `.agent/tasks/*.md` dan di luar branch `staging-website-islam`.
- **Validasi Format Task ID**: Wajib mematuhi pola regex `^TASK-BM-\d{3,4}$`.

### D. Ketahanan Jaringan & Penyaringan Isu (`lib/mcp/github-relay.ts`)
- Menetapkan timeout `AbortSignal.timeout(10_000)` (10 detik) pada setiap panggilan GitHub REST API untuk mencegah masalah koneksi hanging.
- Menyaring pull request pada fungsi `listGithubIssues` (`!issue.pull_request`) sehingga data yang dikembalikan murni tiket issue.
- Menerapkan helper `matchesRegion` untuk pencarian jadwal kajian dan masjid yang lebih akurat.

---

## 2. Hasil Suite Pengujian Keamanan (8 Skenario Uji)

Pengujian dijalankan pada lingkungan lokal (`http://localhost:3000`) dengan hasil:

| No | Skenario Uji | Parameter Uji | Ekspektasi | Status HTTP | Hasil Pengujian | Status |
|:---|:---|:---|:---:|:---:|:---|:---:|
| 1 | Request tanpa token | Header otentikasi kosong | `401 Unauthorized` | `401` | Code `-32000` (Unauthorized) | **PASS** |
| 2 | Request token lama | `Bearer bm_oauth_token_active_2026` | `401 Unauthorized` | `401` | Ditolak, token statis terbukti musnah | **PASS** |
| 3 | Request secret valid | `Bearer bm_agent_sec_2026_banten` | `200 OK` | `200` | 6 tools terdaftar lengkap | **PASS** |
| 4 | Akses berkas sensitif | `path: ".env.local"` | `403 Forbidden` | `403` | Code `-32001` (Akses ditolak: berkas sensitif) | **PASS** |
| 5 | URL encoding bypass | `path: "%2e%2e%2f.env"` | `400 Bad Request` | `400` | Code `-32602` (Format path tidak valid) | **PASS** |
| 6 | Penulisan di luar izin | `target_path: "app/page.tsx"` | `403 Forbidden` | `403` | Code `-32001` (Hanya diizinkan di .agent/tasks/*.md) | **PASS** |
| 7 | Format Task ID salah | `task_id: "INVALID_123"` | `400 Bad Request` | `400` | Code `-32602` (Wajib TASK-BM-XXX) | **PASS** |
| 8 | Pembacaan berkas legal | `path: "package.json"` | `200 OK` | `200` | Konten berhasil dibaca dan didecode UTF-8 | **PASS** |

**Status Kelulusan Keseluruhan: 100% Lolos (8/8 PASS)**

---

## 3. Hasil Build Produksi & Kompatibilitas
- **Type Checking**: `npx tsc --noEmit` lolos **0 error**.
- **Linting**: `npx eslint lib/mcp app/api/mcp types/mcp-devops.ts` lolos **0 error, 0 warning**.
- **Production Build**: `npm run build` sukses 100% mengompilasi seluruh rute Next.js 16 App Router.
