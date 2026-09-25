import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  const secret = process.env.AGENT_SECRET_KEY || "bm_agent_sec_2026_banten";

  return NextResponse.json(
    {
      access_token: secret,
      token_type: "Bearer",
      expires_in: 315360000, // 10 tahun (tidak kedaluwarsa)
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
