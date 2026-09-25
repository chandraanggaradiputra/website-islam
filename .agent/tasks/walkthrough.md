# Walkthrough: [TASK-BM-006] Implementasi Endpoint OAuth 2.0 & Dynamic Registration untuk Gemini MCP

Dokumen ini merupakan laporan resmi implementasi dan verifikasi teknis 5 endpoint OAuth 2.0 standar (RFC 6749, RFC 8414, RFC 7591, RFC 9728) untuk integrasi resmi Google Gemini Spark Connected Apps pada portal dakwah Banten Mengaji.

---

## 1. Konteks Masalah & Sasaran
Google Gemini Connected Apps mewajibkan alur OAuth 2.0 resmi agar integrasi MCP Server dapat didaftarkan dan diotorisasi tanpa hambatan ("Penautan akun diperlukan"). Klien Gemini dapat melakukan penemuan konfigurasi server via RFC 8414/RFC 9728, registrasi klien otomatis (Dynamic Client Registration RFC 7591), persetujuan otorisasi via redirect code, dan penukaran Access Token Bearer.

---

## 2. Rincian Pembuatan & Modifikasi Berkas

### A. Endpoint Discovery Server Metadata (`app/.well-known/oauth-authorization-server/route.ts`)
- **Protokol**: RFC 8414 OAuth 2.0 Authorization Server Metadata.
- **Method**: `GET` & `OPTIONS` dengan CORS wildcard (`*`).
- **Respon**: Mengembalikan URL endpoint `authorization_endpoint`, `token_endpoint`, `registration_endpoint`, serta kapabilitas `code`, `authorization_code`, `refresh_token`, dan scopes `["mcp:tools"]`.

### B. Endpoint Discovery Protected Resource (`app/.well-known/oauth-protected-resource/route.ts` & `api/mcp`)
- **Protokol**: RFC 9728 OAuth 2.0 Protected Resource Metadata.
- **Method**: `GET` & `OPTIONS` dengan CORS wildcard (`*`).
- **Respon**: Menghubungkan resource `/api/mcp` dengan authorization server `https://banten-mengaji.vercel.app` dan scope `["mcp:tools"]`.

### C. Endpoint Dynamic Client Registration (`app/api/oauth/register/route.ts`)
- **Protokol**: RFC 7591 OAuth 2.0 Dynamic Client Registration.
- **Method**: `POST` & `OPTIONS` dengan status `201 Created`.
- **Respon**: Menerima request dari Google Gemini dan secara otomatis mengembalikan `client_id` (format `gemini-spark-<timestamp>`), `client_secret` (dari `AGENT_SECRET_KEY`), grant types, dan redirect uris.

### D. Endpoint Otorisasi Auto-Redirect (`app/api/oauth/authorize/route.ts`)
- **Protokol**: RFC 6749 Authorization Endpoint.
- **Method**: `GET` & `OPTIONS`.
- **Respon**: Secara otomatis mengalihkan (HTTP 302) kembali ke `redirect_uri` dengan membawa parameter `code` (`bm_auth_<base64url>`) dan `state` persis seperti yang dikirimkan klien.

### E. Endpoint Token Exchange (`app/api/oauth/token/route.ts`)
- **Protokol**: RFC 6749 Token Endpoint.
- **Method**: `POST` & `OPTIONS` dengan status `200 OK`.
- **Respon**: Menukarkan kode otorisasi menjadi Bearer `access_token` yang nilainya identik dengan `AGENT_SECRET_KEY` portal dakwah Banten Mengaji, sehingga klien Google Gemini otomatis memiliki izin penuh untuk mengeksekusi tool sensitif DevOps maupun tool dakwah publik.

---

## 3. Hasil Pengujian Verifikasi Runtime (7 Skenario OAuth)

Pengujian otomatis dijalankan melalui skrip `scripts/test-oauth-endpoints.mjs` terhadap server Next.js lokal:

| No | Skenario Pengujian | Endpoint | Method | Ekspektasi | Hasil | Status |
|:---|:---|:---|:---:|:---|:---|:---:|
| 1 | Server Metadata RFC 8414 | `/.well-known/oauth-authorization-server` | `GET` | Status 200, issuer & endpoint URLs lengkap | Sesuai spesifikasi | **PASS** |
| 2 | Protected Resource RFC 9728 | `/.well-known/oauth-protected-resource` | `GET` | Status 200, resource & auth servers | Sesuai spesifikasi | **PASS** |
| 3 | Dynamic Registration RFC 7591 | `/api/oauth/register` | `POST` | Status 201, client_id & client_secret | Client terdaftar dinamis | **PASS** |
| 4 | Auto-Redirect Authorize | `/api/oauth/authorize` | `GET` | Status 302, redirect berisi `code` & `state` | Redirect target valid | **PASS** |
| 5 | Validasi Authorize (No URI) | `/api/oauth/authorize` | `GET` | Status 400 `missing_redirect_uri` | Ditolak aman | **PASS** |
| 6 | Token Exchange RFC 6749 | `/api/oauth/token` | `POST` | Status 200, Bearer token aktif | Token valid 10 tahun | **PASS** |
| 7 | CORS Preflight Wildcard | Seluruh 5 Endpoint | `OPTIONS` | Status 204, `Access-Control-Allow-Origin: *` | Preflight lolos | **PASS** |

**Tingkat Kelulusan: 100% (7 dari 7 pengujian OAuth lolos sempurna)**.

Pengujian regresi MCP handshake (`scripts/test-mcp-handshake.mjs`) juga dijalankan dan **100% lulus (12/12 PASS)**.

---

## 4. Hasil Kompilasi & Build Produksi

- **TypeScript Checking**: `npx tsc --noEmit` lolos **0 error**.
- **ESLint Code Quality**: `npx eslint app/.well-known/ app/api/oauth/ app/api/mcp/oauth/` lolos **0 error, 0 warning**.
- **Production Build**: `npm run build` sukses 100% mengompilasi dan mengoptimasi seluruh rute Next.js 16 App Router termasuk 5 rute OAuth baru.
