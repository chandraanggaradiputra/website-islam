# Walkthrough: [TASK-BM-001] Endpoint MCP Server DevOps & GitHub Relay Banten Mengaji

Dokumen ini merupakan laporan resmi implementasi 4 MCP Tools DevOps GitHub pada endpoint terpadu `/api/mcp` portal dakwah Banten Mengaji berbasis protokol JSON-RPC 2.0.

---

## 1. Ringkasan Perubahan

### A. Tipe Data Strict (`types/mcp-devops.ts`)
Mendefinisikan antarmuka TypeScript 7 Strict (tanpa tipe `any`):
- `McpDispatchTaskArgs` & `McpDispatchTaskResult`
- `McpCreateIssueArgs` & `McpCreateIssueResult`
- `McpListIssuesArgs` & `McpListIssuesResult`
- `McpReadRepoFileArgs` & `McpReadRepoFileResult`

### B. Helper GitHub REST API (`lib/mcp/github-relay.ts`)
Implementasi fungsi pembantu relay dengan GitHub REST API (`chandraanggaradiputra/website-islam`):
- `dispatchAgentTask`: Mengambil SHA target branch (`staging-website-islam`), mengenkripsi instruksi Markdown ke Base64 (UTF-8), dan menyimpan berkas tugas via GitHub Contents API dengan commit message terstruktur `agent: dispatch [task_id] title`.
- `createGithubIssue`: Membuat issue baru di repositori GitHub dengan validasi input.
- `listGithubIssues`: Mengambil daftar issue GitHub (open, closed, atau all) dengan batas limit aman.
- `readRepoFile`: Membaca isi berkas repositori secara aman dengan mendekode konten Base64 ke string UTF-8.
  - **Sistem Proteksi Keamanan**: Memblokir pembacaan berkas rahasia (`.env*`, `.git/*`, kunci privat `*.pem`, `*.key`, `id_rsa*`, `credentials.json`) dan traversal path (`..`).

### C. Handler Utama MCP Server (`app/api/mcp/route.ts`)
- Memperluas skema `MCP_TOOLS` menjadi 6 tools terpadu:
  1. `get_upcoming_kajian` (Dakwah)
  2. `get_masjid_directory` (Dakwah)
  3. `dispatch_agent_task` (DevOps GitHub)
  4. `create_github_issue` (DevOps GitHub)
  5. `list_github_issues` (DevOps GitHub)
  6. `read_repo_file` (DevOps GitHub)
- Menangani pemanggilan method `tools/call` untuk 4 tools baru tersebut secara asinkron dengan format respon MCP standar (`content: [{ type: "text", text: JSON.stringify(...) }]`).

---

## 2. Hasil Verifikasi Integrasi Endpoint & Keamanan

Pengujian dijalankan pada server lokal (`http://localhost:3000`) dengan Bearer token aktif `bm_oauth_token_active_2026`:

| No | Method / Tool | Parameter Uji | Status | Hasil / Verifikasi |
|:---|:---|:---|:---:|:---|
| 1 | `tools/list` | - | `200 OK` | Mengembalikan 6 tools terdaftar lengkap dengan schema valid |
| 2 | `tools/call` -> `read_repo_file` | `path: "package.json"`, `branch: "staging-website-islam"` | `200 OK` | `success: true`, berhasil decode Base64 ke UTF-8 dan membaca konfigurasi `banten-mengaji` |
| 3 | `tools/call` -> `read_repo_file` | `path: ".env.local"` | `400 / -32603` | **Proteksi Keamanan Aktif**: Ditolak dengan pesan `'Akses ditolak: berkas lingkungan (.env) dilarang dibaca demi keamanan'` |
| 4 | `tools/call` -> `list_github_issues` | `limit: 5` | `200 OK` | `success: true`, membaca status issue dari repositori GitHub |

---

## 3. Kompatibilitas Sistem
- TypeScript Typecheck: `npx tsc --noEmit` lolos **0 error**.
- Production Build: `npm run build` lolos 100% mengompilasi seluruh rute statis & dinamis.
- Deployment: Siap digunakan oleh Admin Chan (Gemini Spark) dan AI Assistant untuk otomasi DevOps repositori.
