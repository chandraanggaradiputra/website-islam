# Walkthrough: [TASK-BM-005] Standarisasi Respon MCP JSON-RPC 2.0 (HTTP 200) pada app/api/mcp/route.ts

Dokumen ini merupakan laporan resmi implementasi dan verifikasi teknis standarisasi respon JSON-RPC 2.0 (HTTP 200) dan penanganan method discovery bawaan MCP untuk klien Google Gemini pada portal dakwah Banten Mengaji (`/api/mcp`).

---

## 1. Konteks Masalah
Sebelumnya, endpoint `/api/mcp` memetakan kode error protokol JSON-RPC ke status HTTP transport seperti `401 Unauthorized` (disertai header `WWW-Authenticate`) dan `404 Method Not Found`.
Hal ini menimbulkan dua kendala pada integrasi klien Google Gemini Connected Apps:
1. **Trigger Salah Deteksi OAuth (HTTP 401)**: Status 401 dan header `WWW-Authenticate` membuat layer HTTP klien Gemini menduga bahwa server mewajibkan otentikasi akun pengguna (OAuth 2.0) sehingga memicu pesan peringatan *"Penautan akun diperlukan"* dan memutus sambungan.
2. **Ketiadaan Method Discovery MCP Bawaan (HTTP 404)**: Klien modern seperti Gemini melakukan probing otomatis terhadap metode MCP standar `resources/list`, `resources/templates/list`, dan `prompts/list`. Tanpa handler, server mengembalikan error yang dianggap klien sebagai endpoint tidak valid.

---

## 2. Modifikasi yang Diterapkan

### A. Perizinan CORS Penuh (`nocacheHeaders`)
- Menambahkan method `HEAD` pada `Access-Control-Allow-Methods`: `"GET, POST, OPTIONS, HEAD"`.
- Mengizinkan wildcard header: `"Access-Control-Allow-Headers": "*"`.

### B. Branding Nama Server (`MCP_SERVER_INFO`)
- Mengubah nama server menjadi `"Banten Mengaji MCP"` agar tampil rapi dan elegan pada antarmuka Gemini.

### C. Penambahan Handler Discovery MCP Bawaan (`handleMethod`)
Menambahkan respon discovery kosong berformat JSON-RPC 2.0:
- `resources/list` $\rightarrow$ `{ resources: [] }`
- `resources/templates/list` $\rightarrow$ `{ resourceTemplates: [] }`
- `prompts/list` $\rightarrow$ `{ prompts: [] }`

### D. Standarisasi Respon JSON-RPC HTTP 200 (`POST`)
- Menghapus seluruh pemetaan status HTTP transport (401, 403, 404, 500) dan menghapus injeksi header `WWW-Authenticate`.
- Seluruh respon JSON-RPC (baik pesan sukses maupun payload error protokol seperti code `-32000` atau `-32601`) selalu dikembalikan dengan status `HTTP 200 OK` dan `nocacheHeaders()`. Informasi kesalahan disampaikan seutuhnya melalui payload JSON-RPC `{ error: { code, message } }`.
- Menghapus helper `isErrorResponse` yang tidak lagi digunakan untuk menjaga kebersihan codebase.

---

## 3. Hasil Pengujian Verifikasi Runtime (12 Skenario Uji)

Pengujian otomatis dijalankan melalui skrip `scripts/test-mcp-handshake.mjs` terhadap server Next.js lokal:

| No | Skenario Pengujian | Metode / Tool | Otorisasi | Ekspektasi | Status HTTP | Hasil | Status |
|:---|:---|:---|:---:|:---:|:---:|:---|:---:|
| 1 | Handshake `initialize` | `initialize` | Tanpa Auth | Status 200, nama server "Banten Mengaji MCP" | 200 | Server info & protocolVersion valid | **PASS** |
| 2 | Handshake notifikasi | `notifications/initialized` | Tanpa Auth | Status 200, JSON-RPC 2.0 | 200 | Notifikasi sukses diterima | **PASS** |
| 3 | Handshake ping | `ping` | Tanpa Auth | Status 200 | 200 | Respons ping berhasil | **PASS** |
| 4 | Katalog tools discovery | `tools/list` | Tanpa Auth | Status 200, 6 tools terdaftar | 200 | Array tools lengkap | **PASS** |
| 5 | Resources discovery | `resources/list` | Tanpa Auth | Status 200, `resources: []` | 200 | Array resources kosong dikembalikan | **PASS** |
| 6 | Resource templates | `resources/templates/list` | Tanpa Auth | Status 200, `resourceTemplates: []` | 200 | Array resourceTemplates kosong | **PASS** |
| 7 | Prompts discovery | `prompts/list` | Tanpa Auth | Status 200, `prompts: []` | 200 | Array prompts kosong dikembalikan | **PASS** |
| 8 | Tool dakwah kajian | `get_upcoming_kajian` | Tanpa Auth | Status 200, data jadwal kajian | 200 | Data jadwal kajian berhasil diambil | **PASS** |
| 9 | Tool dakwah masjid | `get_masjid_directory` | Tanpa Auth | Status 200, direktori masjid | 200 | Direktori masjid berhasil diambil | **PASS** |
| 10 | Tool sensitif repo file | `read_repo_file` | Tanpa Auth | Status 200, JSON-RPC error code -32000 | 200 | Ditolak aman via JSON-RPC UNAUTHORIZED | **PASS** |
| 11 | Tool sensitif dispatch task | `dispatch_agent_task` | Tanpa Auth | Status 200, JSON-RPC error code -32000 | 200 | Ditolak aman via JSON-RPC UNAUTHORIZED | **PASS** |
| 12 | Tool sensitif repo file | `read_repo_file` | Valid Secret | Status 200, berkas `package.json` | 200 | Berkas legal berhasil dibaca | **PASS** |

**Tingkat Kelulusan: 100% (12 dari 12 pengujian lulus sempurna)**.

---

## 4. Hasil Kompilasi & Build Produksi

- **TypeScript Checking**: `npx tsc --noEmit` lolos **0 error**.
- **ESLint Code Quality**: `npx eslint app/api/mcp/route.ts` lolos **0 error, 0 warning**.
- **Production Build**: `npm run build` sukses 100% mengompilasi dan mengoptimasi seluruh 23 halaman aplikasi Next.js 16 App Router.
