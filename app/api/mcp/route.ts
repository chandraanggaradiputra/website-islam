/**
 * Remote MCP Server Endpoint — Banten Mengaji
 * Protokol: JSON-RPC 2.0 over Streamable HTTP (RFC 9728 & RFC 8414)
 * Tools Dakwah: get_upcoming_kajian, get_masjid_directory
 * Tools DevOps GitHub: dispatch_agent_task, create_github_issue, list_github_issues, read_repo_file
 */

import { NextRequest, NextResponse } from "next/server";
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

export const dynamic = "force-dynamic";

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
  version: "1.1.0",
} as const;

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
      "Dispatch tugas teknis baru ke branch staging repositori GitHub Banten Mengaji via Contents API (menulis atau memperbarui .agent/tasks/current_task.md)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "Kode unik tugas teknis, contoh: 'TASK-BM-001'",
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
            "Nama branch target di repositori (default: 'staging-website-islam')",
        },
        target_path: {
          type: "string",
          description:
            "Path berkas target di repositori (default: '.agent/tasks/current_task.md')",
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
      "Ambil daftar issue di repositori GitHub Banten Mengaji (chandraanggaradiputra/website-islam)",
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
      "Membaca isi berkas repositori chandraanggaradiputra/website-islam secara aman (decode Base64 ke UTF-8) untuk kebutuhan audit otomatis dan pembacaan berkas laporan",
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
            "Nama branch target di repositori (default: 'staging-website-islam')",
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
    "Access-Control-Allow-Headers": "Authorization, Content-Type, x-agent-secret",
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

const ACTIVE_OAUTH_TOKEN = "bm_oauth_token_active_2026";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization") ?? "";

  // 1. Dukung OAuth Bearer Token
  if (authHeader === `Bearer ${ACTIVE_OAUTH_TOKEN}`) return true;

  // 2. Dukung AGENT_SECRET_KEY via Bearer Token
  const agentSecret = process.env.AGENT_SECRET_KEY;
  if (agentSecret && authHeader === `Bearer ${agentSecret}`) return true;

  // 3. Dukung x-agent-secret header
  const secretHeader = request.headers.get("x-agent-secret") ?? "";
  if (agentSecret && secretHeader === agentSecret) return true;

  return false;
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
    // Saring kajian yang telah selesai secara eksplisit
    if (k.acf?.status_kajian === "selesai") return false;

    // Saring kajian tematik yang telah lewat waktu pelaksanaannya (WIB)
    if (isKajianExpired(k.acf?.tanggal_kajian, k.acf?.jam_selesai, k.acf?.jam_mulai)) {
      return false;
    }

    return true;
  });

  // 2. Filter: Kota / Kabupaten
  if (city && city !== "Semua") {
    const cleanCity = city.toLowerCase().replace(/^(kota|kabupaten|kab\.)\s+/i, "").trim();
    filtered = filtered.filter((k: WPKajian) => {
      const kCity = (
        k.acf?.kota_kabupaten ||
        k.acf?.kota__kabupaten ||
        k.masjid_detail?.acf?.kota_kabupaten ||
        ""
      ).toLowerCase();
      return kCity.includes(cleanCity) || cleanCity.includes(kCity);
    });
  }

  // 3. Filter: Kecamatan
  if (district && district !== "Semua") {
    const cleanDist = district.toLowerCase().replace(/^kec(\.|\s+)?/i, "").trim();
    filtered = filtered.filter((k: WPKajian) => {
      const kDist = String(k.masjid_detail?.acf?.kecamatan || "").toLowerCase();
      const kAddr = (k.masjid_detail?.acf?.alamat_lengkap || "").toLowerCase();
      return kDist.includes(cleanDist) || kAddr.includes(cleanDist);
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
      message: "Tidak ada jadwal kajian sunnah aktif yang cocok dengan kriteria pencarian.",
      kajian: [],
    };
  }

  // Format respons ramah AI/Gemini
  const formatted = filtered.slice(0, limit).map((k: WPKajian) => {
    const judul = decodeHtmlEntities(k.title?.rendered || "");
    const namaUstadz = decodeHtmlEntities(k.acf?.nama_ustadz || "Asatidz Pembina");
    const kitab = decodeHtmlEntities(k.acf?.kitab_bahasan || "-");
    const namaMasjid = decodeHtmlEntities(
      k.masjid_name || k.acf?.nama_masjid_manual || "Masjid Terkait"
    );
    const alamat = decodeHtmlEntities(k.masjid_detail?.acf?.alamat_lengkap || "-");
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
    const waktu = jamMulai ? `${jamMulai} - ${jamSelesai} WIB` : (k.acf?.waktu_keterangan || "-");

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

  // 1. Filter: Kota / Kabupaten
  if (city && city !== "Semua") {
    const cleanCity = city.toLowerCase().replace(/^(kota|kabupaten|kab\.)\s+/i, "").trim();
    filtered = filtered.filter((m: WPMasjid) => {
      const mCity = (m.acf?.kota_kabupaten || "").toLowerCase();
      return mCity.includes(cleanCity) || cleanCity.includes(mCity);
    });
  }

  // 2. Filter: Kecamatan
  if (district && district !== "Semua") {
    const cleanDist = district.toLowerCase().replace(/^kec(\.|\s+)?/i, "").trim();
    filtered = filtered.filter((m: WPMasjid) => {
      const mDist = String(m.acf?.kecamatan || "").toLowerCase();
      const mAddr = (m.acf?.alamat_lengkap || "").toLowerCase();
      return mDist.includes(cleanDist) || mAddr.includes(cleanDist);
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

  // Format respons
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
  id: string | number | null
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
          return rpcError(id, -32601, `Tool tidak ditemukan: ${toolName}`);
        }

        return rpcSuccess(id, {
          content: [{ type: "text", text: JSON.stringify(result) }],
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal error";
        return rpcError(id, -32603, message);
      }
    }

    default:
      return rpcError(id, -32601, `Method tidak ditemukan: ${method}`);
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
  // Auth guard
  if (!isAuthorized(request)) {
    return NextResponse.json(
      rpcError(null, -32000, "Unauthorized"),
      {
        status: 401,
        headers: {
          ...nocacheHeaders(),
          "WWW-Authenticate":
            'Bearer resource_metadata="https://banten-mengaji.vercel.app/.well-known/oauth-protected-resource"',
        },
      }
    );
  }

  // Parse JSON body
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return NextResponse.json(
      rpcError(null, -32700, "Parse error: request body bukan JSON valid"),
      { status: 400, headers: nocacheHeaders() }
    );
  }

  // Validate JSON-RPC 2.0 structure
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return NextResponse.json(
      rpcError(body.id ?? null, -32600, "Invalid Request"),
      { status: 400, headers: nocacheHeaders() }
    );
  }

  const params = body.params ?? {};
  const response = await handleMethod(body.method, params, body.id ?? null);

  const httpStatus = isErrorResponse(response)
    ? response.error.code === -32000
      ? 401
      : response.error.code === -32601
        ? 404
        : 400
    : 200;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: nocacheHeaders(),
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: nocacheHeaders(),
  });
}
