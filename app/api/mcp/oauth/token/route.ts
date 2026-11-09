import { NextRequest, NextResponse } from "next/server";
import { getAgentSecretKey } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Batasi ukuran body maksimal 64KB
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64 * 1024) {
    return NextResponse.json(
      { error: "payload_too_large", message: "Payload melebihi batas 64KB" },
      {
        status: 413,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }

  let secret = "";
  try {
    secret = getAgentSecretKey();
  } catch {
    return NextResponse.json(
      { error: "server_error", error_description: "AGENT_SECRET_KEY belum dikonfigurasi." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      access_token: secret,
      token_type: "Bearer",
      expires_in: 315360000,
      refresh_token: "bm_refresh_token_2026",
      scope: "mcp:tools",
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    }
  );
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
