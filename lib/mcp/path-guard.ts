import { McpToolError, RPC } from "@/lib/mcp/errors";

export const DEFAULT_BRANCH = "staging-website-islam";
const MAX_PATH_LENGTH = 200;
const TASK_ID_RE = /^TASK-BM-\d{3,4}$/;

const DENIED_DIR_SEGMENTS = new Set([
  ".git",
  ".ssh",
  ".aws",
  ".gnupg",
  "docker",
  ".kube",
  ".vercel",
  "node_modules",
]);

const DENIED_SEGMENT_PATTERNS: readonly RegExp[] = [
  /^\.env/i,
  /\.(pem|key|pkcs12|pfx|kdbx|secret|tfstate|tfvars)$/i,
  /id_rsa|id_ed25519/i,
];

const READ_ROOT_DIRS = new Set([
  "app",
  "components",
  "lib",
  "types",
  "public",
  "docs",
  ".agent",
]);

const READ_ROOT_FILES = new Set([
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "README.md",
]);

const READ_BRANCHES = new Set([DEFAULT_BRANCH, "main"]);
const WRITE_BRANCHES = new Set([DEFAULT_BRANCH]);

function throwInvalid(msg: string): never {
  throw new McpToolError(msg, RPC.INVALID_PARAMS);
}

function throwForbidden(msg: string): never {
  throw new McpToolError(msg, RPC.FORBIDDEN);
}

/**
 * Parsing dan sanitasi segmen path dengan perlindungan terhadap:
 * - URL encoding bypass (%2e%2e, %2Eenv, %00, dsb.)
 * - Path traversal (.. dan .)
 * - Karakter terlarang (null-byte, query, hash, whitespace, backslash)
 * - Denylist direktori dan pola berkas rahasia
 */
export function parseSegments(input: unknown): string[] {
  if (typeof input !== "string") throwInvalid("Path wajib string");
  if (input.length === 0 || input.length > MAX_PATH_LENGTH) {
    throwInvalid("Panjang path tidak valid");
  }

  // Tangani variasi URL encoding bypass (%2e%2e, %2Eenv, dsb.)
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    throwInvalid("Encoding path tidak valid");
  }

  // Larang karakter kontrol, null-byte, query, hash, whitespace, dan backslash
  if (/[\0?#\s\\]/.test(decoded)) {
    throwInvalid("Path mengandung karakter terlarang");
  }

  const segments = decoded.split("/");
  for (const seg of segments) {
    if (!seg || seg === "." || seg === "..") {
      throwInvalid("Format path tidak valid");
    }
    const lower = seg.toLowerCase();
    if (DENIED_DIR_SEGMENTS.has(lower)) {
      throwForbidden(`Akses ditolak: ${seg}`);
    }
    for (const re of DENIED_SEGMENT_PATTERNS) {
      if (re.test(lower)) {
        throwForbidden(`Akses ditolak: berkas sensitif ${seg}`);
      }
    }
  }

  return segments;
}

/**
 * Validasi path untuk operasi baca (read_repo_file)
 * Menerapkan allowlist root file dan root direktori
 */
export function validateReadPath(input: unknown): string {
  const segments = parseSegments(input);
  const root = segments[0];

  if (segments.length === 1) {
    if (!READ_ROOT_FILES.has(root) && !READ_ROOT_DIRS.has(root)) {
      throwForbidden("Akses berkas root di luar daftar izin");
    }
  } else {
    if (!READ_ROOT_DIRS.has(root)) {
      throwForbidden("Akses direktori di luar daftar izin");
    }
  }

  return segments.join("/");
}

/**
 * Validasi path untuk operasi tulis (dispatch_agent_task)
 * Mengunci target penulisan HANYA pada direktori .agent/tasks/*.md
 */
export function validateWritePath(input: unknown): string {
  const segments = parseSegments(input);

  if (
    segments.length !== 3 ||
    segments[0] !== ".agent" ||
    segments[1] !== "tasks" ||
    !segments[2].endsWith(".md")
  ) {
    throwForbidden("Akses tulis hanya diizinkan di .agent/tasks/*.md");
  }

  return segments.join("/");
}

/**
 * Validasi branch untuk operasi baca
 */
export function validateReadBranch(branch: unknown): string {
  const target = branch === undefined ? DEFAULT_BRANCH : branch;
  if (typeof target !== "string" || !READ_BRANCHES.has(target)) {
    throwForbidden(
      `Branch baca tidak valid atau tidak diizinkan: ${String(target)}`
    );
  }
  return target;
}

/**
 * Validasi branch untuk operasi tulis (hanya staging-website-islam)
 */
export function validateWriteBranch(branch: unknown): string {
  const target = branch === undefined ? DEFAULT_BRANCH : branch;
  if (typeof target !== "string" || !WRITE_BRANCHES.has(target)) {
    throwForbidden(`Branch tulis hanya diizinkan di ${DEFAULT_BRANCH}`);
  }
  return target;
}

/**
 * Validasi kode tugas (format: TASK-BM-XXX atau TASK-BM-XXXX)
 */
export function validateTaskId(taskId: unknown): string {
  if (typeof taskId !== "string" || !TASK_ID_RE.test(taskId.trim())) {
    throwInvalid("Format task_id wajib TASK-BM-XXX (contoh: TASK-BM-002)");
  }
  return taskId.trim();
}

/**
 * Membangun URL GitHub Contents API yang terenkodasi secara aman
 */
export function buildContentsUrl(
  repo: string,
  path: string,
  branch?: string
): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  let url = `https://api.github.com/repos/${repo}/contents/${encodedPath}`;
  if (branch) {
    url += `?ref=${encodeURIComponent(branch)}`;
  }
  return url;
}
