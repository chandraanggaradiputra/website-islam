/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728)
 * Endpoint Discovery untuk Google Gemini Connected Apps & Remote MCP Server
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
    resource: "https://banten-mengaji.vercel.app/api/mcp",
    authorization_servers: ["https://banten-mengaji.vercel.app"],
    scopes_supported: ["mcp"],
    bearer_methods_supported: ["header"],
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
