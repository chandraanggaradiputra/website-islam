/**
 * Remote MCP Server Endpoint — Banten Mengaji
 * Protokol: JSON-RPC 2.0 over Streamable HTTP (RFC 9728 & RFC 8414)
 * Keamanan: Otentikasi timingSafeEqual, pembatasan ukuran payload, validasi path-guard
 * Tools Dakwah: get_upcoming_kajian, get_masjid_directory
 * Tools DevOps GitHub: dispatch_agent_task, create_github_issue, list_github_issues, read_repo_file
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getKajianList, getMasjidList } from "@/lib/wordpress";
import { isKajianExpired } from "@/lib/kajian";
import { decodeHtmlEntities } from "@/lib/utils/text";
import { formatKategoriJamaah } from "@/types";
import type { WPKajian, WPMasjid } from "@/types";
import {
  dispatchAgentTask,
  createGithubIssue,
  listGithubIssues,
  readRepoFile,
} from "@/lib/mcp/github-relay";
import { McpToolError, RPC } from "@/lib/mcp/errors";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB

// ─── Types ────────────────────────────────────────────────────────────────────

interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id: string | number | null;
}

interface McpToolInputSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: McpToolInputSchema;
}

interface JsonRpcSuccessResponse {
  jsonrpc: "2.0";
  result: unknown;
  id: string | number | null;
}

interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  error: { code: number; message: string };
  id: string | number | null;
}

type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

// ─── Constants ────────────────────────────────────────────────────────────────

const MCP_SERVER_INFO = {
  name: "banten-mengaji-mcp",
  version: "1.3.0",
} as const;

const SENSITIVE_TOOLS = new Set([
  "dispatch_agent_task",
  "create_github_issue",
  "list_github_issues",
  "read_repo_file",
]);

const MCP_TOOLS: McpTool[] = [
  // ─── Tools Dakwah ───────────────────────────────────────────────────────────
  {
    name: "get_upcoming_kajian",
    description:
      "Ambil daftar jadwal kajian sunnah aktif yang akan datang di wilayah Banten (judul materi, ustadz/pemateri, kitab rujukan, masjid/lokasi, waktu pelaksanaan, kategori jamaah, dan tautan live streaming)",
    inputSchema: {
      type: "object",
      properties: {
        district: {
          type: "string",
          description:
            "Filter nama kecamatan di Banten (contoh: Serang, Cipocok Jaya, Kasemen, Cibodas, Pamulang, Ciputat, dsb.)",
        },
        city: {
          type: "string",
          description:
            "Filter kota/kabupaten di Banten (contoh: Kota Serang, Kota Cilegon, Kota Tangerang, Kota Tangerang Selatan, Kabupaten Serang, Kabupaten Pandeglang, Kabupaten Lebak, Kabupaten Tangerang)",
        },
        ustadz: {
          type: "string",
          description: "Kata kunci pencarian nama ustadz / pemateri kajian",
        },
        jamaah: {
          type: "string",
          enum: ["umum", "khusus_ikhwan", "khusus_akhwat"],
          description:
            "Filter kategori jamaah kajian ('umum', 'khusus_ikhwan', atau 'khusus_akhwat')",
        },
        limit: {
          type: "number",
          description:
            "Jumlah maksimal kajian yang dikembalikan (default: 10, max: 50)",
        },
      },
    },
  },
  {
    name: "get_masjid_directory",
    description:
      "Ambil direktori masjid sunnah di seluruh wilayah Banten (nama masjid, alamat lengkap, kecamatan, kota/kabupaten, kontak WhatsApp DKM, peta lokasi Google Maps, dan fasilitas)",
    inputSchema: {
      type: "object",
      properties: {
        district: {
          type: "string",
          description:
            "Filter nama kecamatan di Banten (contoh: Serang, Cibeber, Ciputat, dsb.)",
        },
        city: {
          type: "string",
          description:
            "Filter kota/kabupaten di Banten (contoh: Kota Serang, Kota Cilegon, Kabupaten Pandeglang, dsb.)",
        },
        search: {
          type: "string",
          description: "Kata kunci pencarian nama masjid atau alamat",
        },
        limit: {
          type: "number",
          description:
            "Jumlah maksimal masjid yang dikembalikan (default: 10, max: 50)",
        },
      },
    },
  },

  // ─── Tools DevOps GitHub Relay ──────────────────────────────────────────────
  {
    name: "dispatch_agent_task",
    description:
      "Dispatch tugas teknis baru ke branch staging repositori GitHub Banten Mengaji via Contents API (hanya menulis ke .agent/tasks/*.md pada branch staging-website-islam)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description:
            "Kode unik tugas teknis berformat TASK-BM-XXX, contoh: 'TASK-BM-002'",
        },
        title: {
          type: "string",
          description: "Judul instruksi tugas yang jelas dan spesifik",
        },
        instructions: {
          type: "string",
          description:
            "Konten lengkap instruksi tugas teknis dalam format Markdown",
        },
        branch: {
          type: "string",
          description:
            "Nama branch target di repositori (hanya diizinkan: 'staging-website-islam')",
        },
        target_path: {
          type: "string",
          description:
            "Path berkas target di repositori (hanya diizinkan di .agent/tasks/*.md, default: '.agent/tasks/current_task.md')",
        },
      },
      required: ["task_id", "title", "instructions"],
    },
  },
  {
    name: "create_github_issue",
    description:
      "Buat issue tiket baru di repositori GitHub Banten Mengaji (chandraanggaradiputra/website-islam)",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Judul issue GitHub yang akan dibuat",
        },
        body: {
          type: "string",
          description: "Deskripsi lengkap rincian issue dalam format Markdown",
        },
      },
      required: ["title", "body"],
    },
  },
  {
    name: "list_github_issues",
    description:
      "Ambil daftar issue di repositori GitHub Banten Mengaji (hanya issue murni, pull request disaring keluar)",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          enum: ["open", "closed", "all"],
          description:
            "Filter status issue: 'open', 'closed', atau 'all' (default: 'open')",
        },
        limit: {
          type: "number",
          description:
            "Jumlah maksimal issue yang dikembalikan (default: 10, max: 100)",
        },
      },
    },
  },
  {
    name: "read_repo_file",
    description:
      "Membaca isi berkas repositori chandraanggaradiputra/website-islam secara aman dengan perlindungan path-guard (allowlist root dirs/files, tolak file sensitif & URL bypass)",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Path berkas di repositori (contoh: 'package.json' atau '.agent/tasks/walkthrough.md')",
        },
        branch: {
          type: "string",
          description:
            "Nama branch target di repositori ('staging-website-islam' atau 'main', default: 'staging-website-islam')",
        },
      },
      required: ["path"],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nocacheHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, x-agent-secret",
  };
}

function rpcSuccess(
  id: string | number | null,
  result: unknown
): JsonRpcSuccessResponse {
  return { jsonrpc: "2.0", result, id };
}

function rpcError(
  id: string | number | null,
  code: number,
  message: string
): JsonRpcErrorResponse {
  return { jsonrpc: "2.0", error: { code, message }, id };
}

function isErrorResponse(r: JsonRpcResponse): r is JsonRpcErrorResponse {
  return "error" in r;
}

/**
 * Perbandingan timingSafeEqual berbasis SHA-256 untuk mencegah timing attack
 */
function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * Validasi otentikasi murni menggunakan AGENT_SECRET_KEY
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.AGENT_SECRET_KEY;
  if (!secret) return false;

  // 1. Authorization: Bearer <secret>
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (safeEqual(token, secret)) return true;
  }

  // 2. x-agent-secret header
  const secretHeader = request.headers.get("x-agent-secret") ?? "";
  if (secretHeader && safeEqual(secretHeader, secret)) return true;

  return false;
}

/**
 * Helper pencocokan wilayah (kota/kabupaten atau kecamatan) yang tangguh
 */
function matchesRegion(value: string, query: string): boolean {
  const clean = query.trim().toLowerCase();
  if (!clean || clean === "semua" || clean === "semua kecamatan") return true;
  return value.toLowerCase().includes(clean);
}

// ─── Tool Executors Dakwah ────────────────────────────────────────────────────

async function executeGetUpcomingKajian(
  params: Record<string, unknown>
): Promise<unknown> {
  const district =
    typeof params.district === "string" ? params.district.trim() : undefined;
  const city =
    typeof params.city === "string" ? params.city.trim() : undefined;
  const ustadz =
    typeof params.ustadz === "string" ? params.ustadz.trim() : undefined;
  const jamaah =
    typeof params.jamaah === "string" ? params.jamaah.trim() : undefined;
  const rawLimit = typeof params.limit === "number" ? params.limit : 10;
  const limit = Math.max(1, Math.min(rawLimit, 50));

  const rawKajian = await getKajianList();

  if (!rawKajian || rawKajian.length === 0) {
    return {
      success: true,
      count: 0,
      total_found: 0,
      filter: {
        city: city || "Semua",
        district: district || "Semua",
        ustadz: ustadz || "Semua",
        jamaah: jamaah || "Semua",
      },
      message: "Tidak ada jadwal kajian aktif yang tersedia di sistem.",
      kajian: [],
    };
  }

  // 1. Filter: Hanya ambil kajian aktif dan belum kedaluwarsa
  let filtered = rawKajian.filter((k: WPKajian) => {
    if (k.acf?.status_kajian === "selesai") return false;
    if (
      isKajianExpired(
        k.acf?.tanggal_kajian,
        k.acf?.jam_selesai,
        k.acf?.jam_mulai
      )
    ) {
      return false;
    }
    return true;
  });

  // 2. Filter: Kota / Kabupaten (via matchesRegion)
  if (city && city !== "Semua") {
    filtered = filtered.filter((k: WPKajian) => {
      const kCity =
        k.acf?.kota_kabupaten ||
        k.acf?.kota__kabupaten ||
        k.masjid_detail?.acf?.kota_kabupaten ||
        "";
      return matchesRegion(kCity, city);
    });
  }

  // 3. Filter: Kecamatan (via matchesRegion)
  if (district && district !== "Semua") {
    filtered = filtered.filter((k: WPKajian) => {
      const kDist = String(k.masjid_detail?.acf?.kecamatan || "");
      const kAddr = k.masjid_detail?.acf?.alamat_lengkap || "";
      return matchesRegion(kDist, district) || matchesRegion(kAddr, district);
    });
  }

  // 4. Filter: Nama Ustadz / Pemateri
  if (ustadz && ustadz.trim()) {
    const cleanUstadz = ustadz.toLowerCase().trim();
    filtered = filtered.filter((k: WPKajian) => {
      const kUstadz = (k.acf?.nama_ustadz || "").toLowerCase();
      return kUstadz.includes(cleanUstadz);
    });
  }

  // 5. Filter: Kategori Jamaah
  if (jamaah && jamaah !== "Semua") {
    const norm = jamaah.toLowerCase().trim();
    filtered = filtered.filter((k: WPKajian) => {
      const kKat = (k.acf?.kategori_jamaah || "umum").toLowerCase();
      if (norm === "khusus_akhwat" || norm === "khusus_akhawat") {
        return kKat.includes("akhwat") || kKat.includes("akhawat");
      }
      if (norm === "khusus_ikhwan") {
        return kKat.includes("ikhwan");
      }
      return kKat === "umum" || !kKat.includes("khusus");
    });
  }

  // Zero Silent Fallback
  if (filtered.length === 0) {
    return {
      success: true,
      count: 0,
      total_found: 0,
      filter: {
        city: city || "Semua",
        district: district || "Semua",
        ustadz: ustadz || "Semua",
        jamaah: jamaah || "Semua",
      },
      message:
        "Tidak ada jadwal kajian sunnah aktif yang cocok dengan kriteria pencarian.",
      kajian: [],
    };
  }

  const formatted = filtered.slice(0, limit).map((k: WPKajian) => {
    const judul = decodeHtmlEntities(k.title?.rendered || "");
    const namaUstadz = decodeHtmlEntities(
      k.acf?.nama_ustadz || "Asatidz Pembina"
    );
    const kitab = decodeHtmlEntities(k.acf?.kitab_bahasan || "-");
    const namaMasjid = decodeHtmlEntities(
      k.masjid_name || k.acf?.nama_masjid_manual || "Masjid Terkait"
    );
    const alamat = decodeHtmlEntities(
      k.masjid_detail?.acf?.alamat_lengkap || "-"
    );
    const kotaKab =
      k.acf?.kota_kabupaten ||
      k.acf?.kota__kabupaten ||
      k.masjid_detail?.acf?.kota_kabupaten ||
      "Banten";
    const kecamatan = k.masjid_detail?.acf?.kecamatan
      ? String(k.masjid_detail.acf.kecamatan)
      : "-";

    const jamMulai = k.acf?.jam_mulai || "";
    const jamSelesai = k.acf?.jam_selesai || "Selesai";
    const waktu = jamMulai
      ? `${jamMulai} - ${jamSelesai} WIB`
      : k.acf?.waktu_keterangan || "-";

    return {
      id: k.id,
      judul,
      ustadz: namaUstadz,
      kitab_bahasan: kitab,
      jenis_kajian: k.acf?.jenis_kajian || "tematik",
      kategori_jamaah: formatKategoriJamaah(k.acf?.kategori_jamaah),
      masjid: namaMasjid,
      alamat_masjid: alamat,
      kota_kabupaten: kotaKab,
      kecamatan,
      tanggal_kajian: k.acf?.tanggal_kajian || "-",
      hari_kajian: k.acf?.hari_kajian || "-",
      waktu,
      keterangan_waktu: k.acf?.waktu_keterangan || "",
      link_streaming: k.acf?.link_streaming || null,
      url: `https://bantenmengaji.com/jadwal-kajian/${k.slug}`,
    };
  });

  return {
    success: true,
    count: formatted.length,
    total_found: filtered.length,
    filter: {
      city: city || "Semua",
      district: district || "Semua",
      ustadz: ustadz || "Semua",
      jamaah: jamaah || "Semua",
    },
    kajian: formatted,
  };
}

async function executeGetMasjidDirectory(
  params: Record<string, unknown>
): Promise<unknown> {
  const district =
    typeof params.district === "string" ? params.district.trim() : undefined;
  const city =
    typeof params.city === "string" ? params.city.trim() : undefined;
  const search =
    typeof params.search === "string" ? params.search.trim() : undefined;
  const rawLimit = typeof params.limit === "number" ? params.limit : 10;
  const limit = Math.max(1, Math.min(rawLimit, 50));

  const rawMasjid = await getMasjidList();

  if (!rawMasjid || rawMasjid.length === 0) {
    return {
      success: true,
      count: 0,
      total_found: 0,
      filter: {
        city: city || "Semua",
        district: district || "Semua",
        search: search || "",
      },
      message: "Tidak ada data direktori masjid yang tersedia di sistem.",
      masjid: [],
    };
  }

  let filtered = rawMasjid;

  // 1. Filter: Kota / Kabupaten (via matchesRegion)
  if (city && city !== "Semua") {
    filtered = filtered.filter((m: WPMasjid) => {
      const mCity = m.acf?.kota_kabupaten || "";
      return matchesRegion(mCity, city);
    });
  }

  // 2. Filter: Kecamatan (via matchesRegion)
  if (district && district !== "Semua") {
    filtered = filtered.filter((m: WPMasjid) => {
      const mDist = String(m.acf?.kecamatan || "");
      const mAddr = m.acf?.alamat_lengkap || "";
      return matchesRegion(mDist, district) || matchesRegion(mAddr, district);
    });
  }

  // 3. Filter: Search Query (Nama Masjid atau Alamat)
  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    filtered = filtered.filter((m: WPMasjid) => {
      const name = (m.title?.rendered || "").toLowerCase();
      const addr = (m.acf?.alamat_lengkap || "").toLowerCase();
      return name.includes(s) || addr.includes(s);
    });
  }

  // Zero Silent Fallback
  if (filtered.length === 0) {
    return {
      success: true,
      count: 0,
      total_found: 0,
      filter: {
        city: city || "Semua",
        district: district || "Semua",
        search: search || "",
      },
      message: "Tidak ada masjid yang cocok dengan kriteria pencarian.",
      masjid: [],
    };
  }

  const formatted = filtered.slice(0, limit).map((m: WPMasjid) => {
    const namaMasjid = decodeHtmlEntities(m.title?.rendered || "");
    const alamat = decodeHtmlEntities(m.acf?.alamat_lengkap || "");
    const kotaKab = m.acf?.kota_kabupaten || "Banten";
    const kecamatan = m.acf?.kecamatan ? String(m.acf.kecamatan) : "-";

    return {
      id: m.id,
      nama_masjid: namaMasjid,
      alamat,
      kota_kabupaten: kotaKab,
      kecamatan,
      google_maps_url: m.acf?.google_maps_url || "",
      no_wa_dkm: m.acf?.no_wa_dkm || "",
      fasilitas: m.acf?.fasilitas || [],
      foto_url: m.featured_media_url || null,
      url: `https://bantenmengaji.com/masjid/${m.slug}`,
    };
  });

  return {
    success: true,
    count: formatted.length,
    total_found: filtered.length,
    filter: {
      city: city || "Semua",
      district: district || "Semua",
      search: search || "",
    },
    masjid: formatted,
  };
}

// ─── Method Handlers ──────────────────────────────────────────────────────────

async function handleMethod(
  method: string,
  params: Record<string, unknown>,
  id: string | number | null,
  isAuth: boolean
): Promise<JsonRpcResponse> {
  switch (method) {
    case "initialize":
      return rpcSuccess(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: MCP_SERVER_INFO,
      });

    case "notifications/initialized":
    case "ping":
      return rpcSuccess(id, {});

    case "tools/list":
      return rpcSuccess(id, { tools: MCP_TOOLS });

    case "tools/call": {
      const toolName = typeof params.name === "string" ? params.name : "";
      const toolArgs =
        params.arguments !== null &&
        typeof params.arguments === "object" &&
        !Array.isArray(params.arguments)
          ? (params.arguments as Record<string, unknown>)
          : {};

      // Proteksi tool sensitif DevOps: Hanya dapat dipanggil jika isAuth bernilai true
      if (SENSITIVE_TOOLS.has(toolName) && !isAuth) {
        return rpcError(
          id,
          RPC.UNAUTHORIZED,
          `Akses ditolak: Tool '${toolName}' memerlukan otorisasi AGENT_SECRET_KEY.`
        );
      }

      try {
        let result: unknown;

        if (toolName === "get_upcoming_kajian") {
          result = await executeGetUpcomingKajian(toolArgs);
        } else if (toolName === "get_masjid_directory") {
          result = await executeGetMasjidDirectory(toolArgs);
        } else if (toolName === "dispatch_agent_task") {
          result = await dispatchAgentTask(
            toolArgs as unknown as Parameters<typeof dispatchAgentTask>[0]
          );
        } else if (toolName === "create_github_issue") {
          result = await createGithubIssue(
            toolArgs as unknown as Parameters<typeof createGithubIssue>[0]
          );
        } else if (toolName === "list_github_issues") {
          result = await listGithubIssues(
            toolArgs as unknown as Parameters<typeof listGithubIssues>[0]
          );
        } else if (toolName === "read_repo_file") {
          result = await readRepoFile(
            toolArgs as unknown as Parameters<typeof readRepoFile>[0]
          );
        } else {
          return rpcError(id, RPC.METHOD_NOT_FOUND, `Tool tidak ditemukan: ${toolName}`);
        }

        return rpcSuccess(id, {
          content: [{ type: "text", text: JSON.stringify(result) }],
        });
      } catch (err: unknown) {
        if (err instanceof McpToolError) {
          return rpcError(id, err.code, err.message);
        }
        const message = err instanceof Error ? err.message : "Internal error";
        return rpcError(id, RPC.INTERNAL, message);
      }
    }

    default:
      return rpcError(id, RPC.METHOD_NOT_FOUND, `Method tidak ditemukan: ${method}`);
  }
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      server: MCP_SERVER_INFO.name,
      version: MCP_SERVER_INFO.version,
      protocol: "MCP JSON-RPC 2.0",
      status: "ok",
      tools: MCP_TOOLS.map((t) => t.name),
      timestamp: new Date().toISOString(),
    },
    { headers: nocacheHeaders() }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Batasi ukuran body maksimal 64KB
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      rpcError(null, RPC.INVALID_REQUEST, "Payload terlalu besar (maksimal 64KB)"),
      { status: 400, headers: nocacheHeaders() }
    );
  }

  // Parse JSON body
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return NextResponse.json(
      rpcError(null, RPC.PARSE, "Parse error: request body bukan JSON valid"),
      { status: 400, headers: nocacheHeaders() }
    );
  }

  // Validate JSON-RPC 2.0 structure
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return NextResponse.json(
      rpcError(body.id ?? null, RPC.INVALID_REQUEST, "Invalid Request"),
      { status: 400, headers: nocacheHeaders() }
    );
  }

  const isAuth = isAuthorized(request);
  const params = body.params ?? {};
  const response = await handleMethod(body.method, params, body.id ?? null, isAuth);

  // Mapping status HTTP yang presisi
  const httpStatus = isErrorResponse(response)
    ? response.error.code === RPC.UNAUTHORIZED
      ? 401
      : response.error.code === RPC.FORBIDDEN
        ? 403
        : response.error.code === RPC.INVALID_REQUEST ||
            response.error.code === RPC.INVALID_PARAMS ||
            response.error.code === RPC.PARSE
          ? 400
          : response.error.code === RPC.METHOD_NOT_FOUND
            ? 404
            : 500
    : 200;

  const headers: Record<string, string> = {
    ...(nocacheHeaders() as Record<string, string>),
  };
  if (httpStatus === 401) {
    headers["WWW-Authenticate"] = 'Bearer error="unauthorized"';
  }

  return NextResponse.json(response, {
    status: httpStatus,
    headers,
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: nocacheHeaders(),
  });
}
