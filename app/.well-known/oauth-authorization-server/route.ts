/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414)
 * Endpoint Discovery untuk Remote MCP Server & Google Gemini Connected Apps
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function nocacheHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

export async function GET(): Promise<NextResponse> {
  const metadata = {
    issuer: "https://banten-mengaji.vercel.app",
    authorization_endpoint: "https://banten-mengaji.vercel.app/api/mcp/oauth/authorize",
    token_endpoint: "https://banten-mengaji.vercel.app/api/mcp/oauth/token",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "client_credentials"],
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],
  };

  return NextResponse.json(metadata, {
    status: 200,
    headers: nocacheHeaders(),
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: nocacheHeaders(),
  });
}
