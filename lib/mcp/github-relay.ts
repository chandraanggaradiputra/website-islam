/**
 * Helper GitHub API Relay untuk Remote MCP Server Banten Mengaji
 * Berinteraksi dengan REST API GitHub untuk operasi DevOps otonom
 */

import type {
  McpDispatchTaskArgs,
  McpDispatchTaskResult,
  McpCreateIssueArgs,
  McpCreateIssueResult,
  McpListIssuesArgs,
  McpListIssuesResult,
  McpIssueItem,
  McpReadRepoFileArgs,
  McpReadRepoFileResult,
} from "@/types/mcp-devops";

const DEFAULT_REPO = "chandraanggaradiputra/website-islam";
const GITHUB_API_BASE = "https://api.github.com";

function getGithubToken(): string {
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GITHUB_ACCESS_TOKEN ||
    process.env.MCP_GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GitHub token tidak dikonfigurasi (GITHUB_TOKEN, GITHUB_PAT, GITHUB_ACCESS_TOKEN, atau MCP_GITHUB_TOKEN)"
    );
  }
  return token.trim();
}

function getGithubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "BantenMengaji-MCP-Relay",
  };
}

/**
 * Validasi dan proteksi keamanan untuk membaca berkas repositori
 */
function validateSafeFilePath(filePath: string): string {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Parameter 'path' wajib diisi");
  }

  const clean = filePath.trim().replace(/^[/\\]+/, "");

  // Deteksi path traversal
  if (clean.includes("..") || clean.includes("~")) {
    throw new Error(
      "Akses ditolak: format path tidak diizinkan demi keamanan (path traversal terdeteksi)"
    );
  }

  const lower = clean.toLowerCase();
  const segments = lower.split(/[/\\]/);

  // Periksa segmen terlarang
  for (const seg of segments) {
    if (seg.startsWith(".env")) {
      throw new Error(
        "Akses ditolak: berkas lingkungan (.env) dilarang dibaca demi keamanan"
      );
    }
    if (seg === ".git") {
      throw new Error(
        "Akses ditolak: direktori .git dilarang dibaca demi keamanan"
      );
    }
  }

  // Periksa ekstensi atau nama file rahasia
  const forbiddenPatterns = [
    /\.pem$/i,
    /\.key$/i,
    /\.pfx$/i,
    /\.p12$/i,
    /^id_rsa/i,
    /\.secret$/i,
    /credentials\.json$/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(lower)) {
      throw new Error(
        "Akses ditolak: berkas kunci atau kredensial rahasia dilarang dibaca"
      );
    }
  }

  return clean;
}

/**
 * Menulis / memperbarui instruksi tugas otonom di .agent/tasks/current_task.md
 */
export async function dispatchAgentTask(
  args: McpDispatchTaskArgs
): Promise<McpDispatchTaskResult> {
  const token = getGithubToken();
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;

  const taskId = args.task_id?.trim();
  const title = args.title?.trim();
  const instructions = args.instructions;
  const branch = args.branch?.trim() || "staging-website-islam";
  const targetPath = args.target_path?.trim() || ".agent/tasks/current_task.md";

  if (!taskId || !title || !instructions) {
    throw new Error(
      "Parameter 'task_id', 'title', dan 'instructions' wajib diisi"
    );
  }

  const fileUrl = `${GITHUB_API_BASE}/repos/${repo}/contents/${targetPath}`;

  // 1. Ambil SHA berkas jika sudah ada di branch target
  let existingSha: string | undefined;
  const getUrl = `${fileUrl}?ref=${encodeURIComponent(branch)}`;

  const getRes = await fetch(getUrl, {
    method: "GET",
    headers: getGithubHeaders(token),
  });

  if (getRes.ok) {
    const fileData = (await getRes.json()) as { sha?: string };
    existingSha = fileData.sha;
  } else if (getRes.status === 404) {
    existingSha = undefined;
  } else {
    const errorText = await getRes.text();
    throw new Error(
      `Gagal memeriksa keberadaan berkas ${targetPath} di branch ${branch} (HTTP ${getRes.status}): ${errorText}`
    );
  }

  // 2. Encode konten instruksi ke Base64 (UTF-8)
  const base64Content = Buffer.from(instructions, "utf-8").toString("base64");

  const commitPayload: {
    message: string;
    content: string;
    branch: string;
    sha?: string;
  } = {
    message: `agent: dispatch [${taskId}] ${title}`,
    content: base64Content,
    branch,
  };

  if (existingSha) {
    commitPayload.sha = existingSha;
  }

  // 3. Simpan berkas via GitHub Contents API
  const putRes = await fetch(fileUrl, {
    method: "PUT",
    headers: {
      ...getGithubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commitPayload),
  });

  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new Error(
      `GitHub API error saat dispatch tugas ${taskId} (HTTP ${putRes.status}): ${errorText}`
    );
  }

  const resultData = (await putRes.json()) as {
    content?: { sha?: string; path?: string; html_url?: string };
    commit?: { sha?: string; html_url?: string; message?: string };
  };

  return {
    success: true,
    task_id: taskId,
    title,
    branch,
    target_path: targetPath,
    commit_sha: resultData.commit?.sha || "",
    commit_url: resultData.commit?.html_url || "",
    content_sha: resultData.content?.sha || "",
    message: `Tugas [${taskId}] berhasil di-dispatch ke branch ${branch}`,
  };
}

/**
 * Membuat issue tiket baru di repositori GitHub
 */
export async function createGithubIssue(
  args: McpCreateIssueArgs
): Promise<McpCreateIssueResult> {
  const token = getGithubToken();
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;

  const title = args.title?.trim();
  const body = args.body?.trim();

  if (!title || !body) {
    throw new Error("Parameter 'title' dan 'body' wajib diisi");
  }

  const issueUrl = `${GITHUB_API_BASE}/repos/${repo}/issues`;

  const response = await fetch(issueUrl, {
    method: "POST",
    headers: {
      ...getGithubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub API error saat membuat issue (HTTP ${response.status}): ${errorText}`
    );
  }

  const issue = (await response.json()) as {
    number: number;
    title: string;
    html_url: string;
    state: string;
  };

  return {
    success: true,
    issue_number: issue.number,
    title: issue.title,
    issue_url: issue.html_url,
    state: issue.state,
  };
}

/**
 * Mengambil daftar issue di repositori GitHub
 */
export async function listGithubIssues(
  args: McpListIssuesArgs
): Promise<McpListIssuesResult> {
  const token = getGithubToken();
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;

  const state =
    args.state === "closed" || args.state === "all" ? args.state : "open";
  const rawLimit = typeof args.limit === "number" ? args.limit : 10;
  const limit = Math.max(1, Math.min(rawLimit, 100));

  const url = `${GITHUB_API_BASE}/repos/${repo}/issues?state=${state}&per_page=${limit}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getGithubHeaders(token),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub API error saat membaca issues (HTTP ${response.status}): ${errorText}`
    );
  }

  const issues = (await response.json()) as Array<{
    number: number;
    title: string;
    html_url: string;
    state: string;
    created_at: string;
    user?: { login: string };
  }>;

  const formatted: McpIssueItem[] = issues.map((item) => ({
    number: item.number,
    title: item.title,
    url: item.html_url,
    state: item.state,
    created_at: item.created_at,
    author: item.user?.login || "unknown",
  }));

  return {
    success: true,
    count: formatted.length,
    issues: formatted,
  };
}

/**
 * Membaca isi berkas repositori GitHub secara aman (Base64 decode ke UTF-8)
 */
export async function readRepoFile(
  args: McpReadRepoFileArgs
): Promise<McpReadRepoFileResult> {
  const token = getGithubToken();
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;

  const cleanPath = validateSafeFilePath(args.path);
  const branch = args.branch?.trim() || "staging-website-islam";

  const url = `${GITHUB_API_BASE}/repos/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(
    branch
  )}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getGithubHeaders(token),
  });

  if (response.status === 404) {
    throw new Error(
      `Berkas '${cleanPath}' tidak ditemukan pada branch '${branch}' di repositori ${repo}`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub API error saat membaca berkas '${cleanPath}' (HTTP ${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    type?: string;
    encoding?: string;
    size?: number;
    path?: string;
    sha?: string;
    content?: string;
  };

  if (data.type !== "file" || !data.content) {
    throw new Error(
      `Path '${cleanPath}' adalah direktori atau bukan berkas teks biasa`
    );
  }

  // Bersihkan newline dari base64 string dan decode ke UTF-8
  const base64Clean = data.content.replace(/\s+/g, "");
  const decodedContent = Buffer.from(base64Clean, "base64").toString("utf-8");

  return {
    success: true,
    path: data.path || cleanPath,
    branch,
    size: data.size || 0,
    sha: data.sha || "",
    content: decodedContent,
  };
}
