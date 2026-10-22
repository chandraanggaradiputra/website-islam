import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Validasi Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (
    contentType &&
    !contentType.toLowerCase().includes("application/json") &&
    !contentType.toLowerCase().includes("application/x-www-form-urlencoded")
  ) {
    return NextResponse.json(
      { error: "unsupported_media_type", message: "Content-Type tidak didukung" },
      {
        status: 415,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }

  // 2. Batasi ukuran body maksimal 64KB
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

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // fallback jika request body kosong atau bukan JSON
  }

  // Sanitasi client_name jika disediakan
  const rawClientName = typeof body.client_name === "string" ? body.client_name.slice(0, 100) : "Google Gemini Client";
  const clientName = rawClientName.replace(/[^\w\s.-]/g, "");

  const clientId = "gemini-spark-" + Date.now();
  const secret = process.env.AGENT_SECRET_KEY || "bm_agent_sec_2026_banten";

  return NextResponse.json(
    {
      client_id: clientId,
      client_secret: secret,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_secret_expires_at: 0,
      redirect_uris: body.redirect_uris || [
        "https://gemini.google.com/spark/apps",
      ],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      client_name: clientName,
      token_endpoint_auth_method: "client_secret_post",
    },
    {
      status: 201,
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
