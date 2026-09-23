/**
 * OAuth 2.0 Token Endpoint
 * Menangani penukaran authorization code / client credentials menjadi Bearer Access Token
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ACTIVE_ACCESS_TOKEN = "bm_oauth_token_active_2026";
const TOKEN_EXPIRES_IN = 86400; // 24 jam

function nocacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

interface ParsedCredentials {
  clientId: string;
  clientSecret: string;
}

function parseBasicAuth(header: string): ParsedCredentials | null {
  if (!header.startsWith("Basic ")) return null;
  try {
    const base64Part = header.slice(6).trim();
    const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
    const colonIndex = decoded.indexOf(":");
    if (colonIndex === -1) return null;
    return {
      clientId: decoded.slice(0, colonIndex),
      clientSecret: decoded.slice(colonIndex + 1),
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const expectedClientId =
    process.env.MCP_CLIENT_ID || "banten-mengaji-client";
  const expectedClientSecret =
    process.env.MCP_CLIENT_SECRET || "salaf_sec_oauth_2026";

  let clientId = "";
  let clientSecret = "";

  // 1. Coba ekstraksi dari HTTP Basic Auth header
  const authHeader = request.headers.get("authorization") ?? "";
  const basicCreds = parseBasicAuth(authHeader);
  if (basicCreds) {
    clientId = basicCreds.clientId;
    clientSecret = basicCreds.clientSecret;
  }

  // 2. Jika tidak ada di header, periksa request body (form-urlencoded atau JSON)
  const contentType = request.headers.get("content-type") ?? "";

  if (!clientId || !clientSecret) {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const formData = await request.formData();
        clientId = (formData.get("client_id") as string) ?? clientId;
        clientSecret = (formData.get("client_secret") as string) ?? clientSecret;
      } catch {
        // Abaikan parse error, validasi akan gagal di bawah
      }
    } else if (contentType.includes("application/json")) {
      try {
        const jsonBody = (await request.json()) as Record<string, unknown>;
        if (typeof jsonBody.client_id === "string") clientId = jsonBody.client_id;
        if (typeof jsonBody.client_secret === "string") clientSecret = jsonBody.client_secret;
      } catch {
        // Abaikan parse error, validasi akan gagal di bawah
      }
    }
  }

  // Validasi konfigurasi server
  if (!expectedClientId || !expectedClientSecret) {
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Konfigurasi kredensial OAuth server belum lengkap",
      },
      { status: 500, headers: nocacheHeaders() }
    );
  }

  // Validasi kredensial client
  if (clientId !== expectedClientId || clientSecret !== expectedClientSecret) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Client authentication failed",
      },
      {
        status: 401,
        headers: {
          ...nocacheHeaders(),
          "WWW-Authenticate": 'Basic realm="BantenMengaji"',
        },
      }
    );
  }

  // Sukses: kembalikan Access Token aktif
  return NextResponse.json(
    {
      access_token: ACTIVE_ACCESS_TOKEN,
      token_type: "Bearer",
      expires_in: TOKEN_EXPIRES_IN,
    },
    {
      status: 200,
      headers: nocacheHeaders(),
    }
  );
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: nocacheHeaders(),
  });
}
