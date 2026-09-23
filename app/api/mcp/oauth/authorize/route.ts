/**
 * OAuth 2.0 Authorize Endpoint
 * Menangani alur authorization code untuk Remote MCP Server & Google Gemini Connected Apps
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AUTH_CODE = "bm_auth_code_2026";

function nocacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state") ?? "";

  const expectedClientId =
    process.env.MCP_CLIENT_ID || "banten-mengaji-client";

  // Validasi keberadaan redirect_uri
  if (!redirectUri) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Parameter 'redirect_uri' wajib disertakan",
      },
      { status: 400, headers: nocacheHeaders() }
    );
  }

  // Validasi client_id
  if (!clientId || !expectedClientId || clientId !== expectedClientId) {
    try {
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set("error", "unauthorized_client");
      errorUrl.searchParams.set(
        "error_description",
        "Client ID tidak valid atau tidak terdaftar"
      );
      if (state) errorUrl.searchParams.set("state", state);

      return NextResponse.redirect(errorUrl.toString(), 302);
    } catch {
      return NextResponse.json(
        {
          error: "invalid_client",
          error_description: "Client ID tidak valid dan redirect_uri malformed",
        },
        { status: 400, headers: nocacheHeaders() }
      );
    }
  }

  // Validasi sukses: redirect dengan authorization code & state
  try {
    const targetUrl = new URL(redirectUri);
    targetUrl.searchParams.set("code", AUTH_CODE);
    if (state) targetUrl.searchParams.set("state", state);

    return NextResponse.redirect(targetUrl.toString(), 302);
  } catch {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Format redirect_uri tidak valid",
      },
      { status: 400, headers: nocacheHeaders() }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: nocacheHeaders(),
  });
}
