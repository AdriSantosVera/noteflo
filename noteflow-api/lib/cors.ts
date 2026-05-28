import { NextResponse } from "next/server";

function isAllowedOrigin(origin: string): boolean {
  return (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://192.168.")
  );
}

export function withCors(response: NextResponse, request: Request): NextResponse {
  const origin = request.headers.get("origin");

  if (!origin || !isAllowedOrigin(origin)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Vary", "Origin");

  return response;
}

export function corsPreflight(request: Request): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }), request);
}
