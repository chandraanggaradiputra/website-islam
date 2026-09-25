# Walkthrough: [TASK-BM-004] Penyesuaian Handshake MCP Gemini pada app/api/mcp/route.ts

Dokumen ini merupakan laporan resmi implementasi dan verifikasi teknis penyesuaian handshake protokol Model Context Protocol (MCP) untuk integrasi Google Gemini Connected Apps pada portal dakwah Banten Mengaji (`/api/mcp`).

---

## 1. Konteks & Akar Masalah
Sebelumnya, fungsi `POST` pada `app/api/mcp/route.ts` memblokir setiap request yang masuk di baris pertama dengan `!isAuthorized(request)`, mengembalikan status `401 Unauthorized` dengan header `WWW-Authenticate: Bearer resource_metadata="..."`.

Ketika Google Gemini Connected Apps mencoba menginisialisasi sambungan MCP, klien Gemini mengirimkan metode handshake `initialize` dan `tools/list` tanpa header otorisasi pengguna. Respons 401 ini menyebabkan Google Gemini keliru menganggap bahwa server memerlukan penautan akun OAuth pengguna (*"Penautan akun diperlukan"*) dan membatalkan inisialisasi koneksi dakwah publik.

---

## 2. Solusi yang Diterapkan

### A. Metode MCP & Tools Dakwah Publik (Tanpa Otorisasi)
Mengizinkan panggilan tanpa header otorisasi untuk:
- `initialize`: Mengembalikan metadata versi protokol `2024-11-05`, kapabilitas, dan info server (`banten-mengaji-mcp` v1.3.0).
- `notifications/initialized`: Menerima konfirmasi inisialisasi dari klien.
- `ping`: Uji heartbeat konektivitas klien.
- `tools/list`: Menampilkan seluruh daftar perkakas (tools) yang didukung server.
- `get_upcoming_kajian`: Tool dakwah publik jadwal kajian sunnah se-Banten.
- `get_masjid_directory`: Tool dakwah publik direktori masjid sunnah se-Banten.

### B. Isolasi Otorisasi Tool Sensitif DevOps (Wajib `AGENT_SECRET_KEY`)
Pemeriksaan otorisasi via `timingSafeEqual` (`isAuthorized(request)`) dikunci khusus pada eksekusi 4 tool DevOps:
- `dispatch_agent_task`
- `create_github_issue`
- `list_github_issues`
- `read_repo_file`

Jika tool-tool di atas dipanggil tanpa header `Authorization: Bearer <AGENT_SECRET_KEY>` atau `x-agent-secret` yang valid, server mengembalikan error standar JSON-RPC 2.0:
- **Code**: `-32000` (`RPC.UNAUTHORIZED`)
- **HTTP Status**: `401 Unauthorized`
- **Header**: `WWW-Authenticate: Bearer error="unauthorized"`

---

## 3. Hasil Pengujian Verifikasi Runtime (9 Skenario Uji)

Pengujian otomatis dijalankan melalui skrip `scripts/test-mcp-handshake.mjs` terhadap server Next.js lokal:

| No | Skenario Pengujian | Metode / Tool | Otorisasi | Ekspektasi | Status HTTP | Hasil | Status |
|:---|:---|:---|:---:|:---:|:---:|:---|:---:|
| 1 | Handshake `initialize` | `initialize` | Tanpa Auth | Status 200, metadata serverInfo | 200 | Server info valid, protocolVersion 2024-11-05 | **PASS** |
| 2 | Handshake notifikasi | `notifications/initialized` | Tanpa Auth | Status 200, JSON-RPC 2.0 | 200 | Respons sukses diterima | **PASS** |
| 3 | Handshake ping | `ping` | Tanpa Auth | Status 200 | 200 | Respons ping berhasil | **PASS** |
| 4 | Katalog tools discovery | `tools/list` | Tanpa Auth | Status 200, daftar 6 tools | 200 | Array 6 tools lengkap dikembalikan | **PASS** |
| 5 | Tool dakwah kajian | `get_upcoming_kajian` | Tanpa Auth | Status 200, data jadwal kajian | 200 | Jadwal kajian berhasil diambil | **PASS** |
| 6 | Tool dakwah masjid | `get_masjid_directory` | Tanpa Auth | Status 200, direktori masjid | 200 | Direktori masjid berhasil diambil | **PASS** |
| 7 | Tool sensitif repo file | `read_repo_file` | Tanpa Auth | Ditolak 401, code -32000 | 401 | Akses ditolak (UNAUTHORIZED) | **PASS** |
| 8 | Tool sensitif dispatch task | `dispatch_agent_task` | Tanpa Auth | Ditolak 401, code -32000 | 401 | Akses ditolak (UNAUTHORIZED) | **PASS** |
| 9 | Tool sensitif repo file | `read_repo_file` | Valid Secret | Status 200, baca `package.json` | 200 | Berkas legal berhasil dibaca | **PASS** |

**Tingkat Kelulusan: 100% (9 dari 9 pengujian lulus sempurna)**.

---

## 4. Hasil Kompilasi & Build Produksi

- **TypeScript Checking**: `npx tsc --noEmit` lolos **0 error**.
- **ESLint Code Quality**: `npx eslint app/api/mcp/route.ts` lolos **0 error, 0 warning**.
- **Production Build**: `npm run build` sukses mengompilasi dan mengoptimasi seluruh 23 halaman aplikasi Next.js 16 App Router tanpa kendala.
