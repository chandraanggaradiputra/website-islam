/**
 * Helper GitHub API Relay untuk Remote MCP Server Banten Mengaji
 * Berinteraksi dengan REST API GitHub untuk operasi DevOps otonom
 * Dilengkapi pengamanan jalur path-guard dan pembatasan timeout
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
import {
  validateReadPath,
  validateWritePath,
  validateReadBranch,
  validateWriteBranch,
  validateTaskId,
  buildContentsUrl,
} from "@/lib/mcp/path-guard";
import { McpToolError, RPC } from "@/lib/mcp/errors";

const DEFAULT_REPO = "chandraanggaradiputra/website-islam";
const GITHUB_API_BASE = "https://api.github.com";
const FETCH_TIMEOUT_MS = 10_000;

function getGithubToken(): string {
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GITHUB_ACCESS_TOKEN ||
    process.env.MCP_GITHUB_TOKEN;

  if (!token) {
    throw new McpToolError(
      "GitHub token tidak dikonfigurasi pada environment server",
      RPC.INTERNAL
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
 * Menulis / memperbarui instruksi tugas otonom di .agent/tasks/*.md
 */
export async function dispatchAgentTask(
  args: McpDispatchTaskArgs
): Promise<McpDispatchTaskResult> {
  const token = getGithubToken();
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;

  const taskId = validateTaskId(args.task_id);
  const title = args.title?.trim();
  const instructions = args.instructions;

  if (!title || !instructions) {
    throw new McpToolError(
      "Parameter 'title' dan 'instructions' wajib diisi",
      RPC.INVALID_PARAMS
    );
  }

  const safePath = validateWritePath(
    args.target_path || ".agent/tasks/current_task.md"
  );
  const safeBranch = validateWriteBranch(args.branch);

  // 1. Ambil SHA berkas jika sudah ada di branch target
  let existingSha: string | undefined;
  const getUrl = buildContentsUrl(repo, safePath, safeBranch);

  const getRes = await fetch(getUrl, {
    method: "GET",
    headers: getGithubHeaders(token),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (getRes.ok) {
    const fileData = (await getRes.json()) as { sha?: string };
    existingSha = fileData.sha;
  } else if (getRes.status === 404) {
    existingSha = undefined;
  } else {
    const errorText = await getRes.text();
    throw new McpToolError(
      `Gagal memeriksa keberadaan berkas ${safePath} di branch ${safeBranch} (HTTP ${getRes.status}): ${errorText}`,
      RPC.INTERNAL
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
    branch: safeBranch,
  };

  if (existingSha) {
    commitPayload.sha = existingSha;
  }

  // 3. Simpan berkas via GitHub Contents API
  const putUrl = buildContentsUrl(repo, safePath);
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: {
      ...getGithubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commitPayload),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new McpToolError(
      `GitHub API error saat dispatch tugas ${taskId} (HTTP ${putRes.status}): ${errorText}`,
      RPC.INTERNAL
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
    branch: safeBranch,
    target_path: safePath,
    commit_sha: resultData.commit?.sha || "",
    commit_url: resultData.commit?.html_url || "",
    content_sha: resultData.content?.sha || "",
    message: `Tugas [${taskId}] berhasil di-dispatch ke branch ${safeBranch}`,
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
    throw new McpToolError(
      "Parameter 'title' dan 'body' wajib diisi",
      RPC.INVALID_PARAMS
    );
  }

  const issueUrl = `${GITHUB_API_BASE}/repos/${repo}/issues`;

  const response = await fetch(issueUrl, {
    method: "POST",
    headers: {
      ...getGithubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new McpToolError(
      `GitHub API error saat membuat issue (HTTP ${response.status}): ${errorText}`,
      RPC.INTERNAL
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
 * Mengambil daftar issue di repositori GitHub (pull request disaring keluar)
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
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new McpToolError(
      `GitHub API error saat membaca issues (HTTP ${response.status}): ${errorText}`,
      RPC.INTERNAL
    );
  }

  const rawItems = (await response.json()) as Array<{
    number: number;
    title: string;
    html_url: string;
    state: string;
    created_at: string;
    user?: { login: string };
    pull_request?: unknown;
  }>;

  // Saring pull request agar murni hanya issue yang dikembalikan
  const issuesOnly = rawItems.filter((item) => !item.pull_request);

  const formatted: McpIssueItem[] = issuesOnly.map((item) => ({
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

  const safePath = validateReadPath(args.path);
  const safeBranch = validateReadBranch(args.branch);

  const url = buildContentsUrl(repo, safePath, safeBranch);

  const response = await fetch(url, {
    method: "GET",
    headers: getGithubHeaders(token),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (response.status === 404) {
    throw new McpToolError(
      `Berkas '${safePath}' tidak ditemukan pada branch '${safeBranch}' di repositori ${repo}`,
      RPC.METHOD_NOT_FOUND
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new McpToolError(
      `GitHub API error saat membaca berkas '${safePath}' (HTTP ${response.status}): ${errorText}`,
      RPC.INTERNAL
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
    throw new McpToolError(
      `Path '${safePath}' adalah direktori atau bukan berkas teks biasa`,
      RPC.INVALID_PARAMS
    );
  }

  // Bersihkan whitespace dari base64 string dan decode ke UTF-8
  const base64Clean = data.content.replace(/\s+/g, "");
  const decodedContent = Buffer.from(base64Clean, "base64").toString("utf-8");

  return {
    success: true,
    path: data.path || safePath,
    branch: safeBranch,
    size: data.size || 0,
    sha: data.sha || "",
    content: decodedContent,
  };
}
