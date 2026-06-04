import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function resolveOrigin(request: Request): string {
  const requestOrigin = request.headers.get("Origin") ?? "";
  if (ALLOWED_ORIGINS.length === 0) return requestOrigin;
  return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
}

export function withCors(response: NextResponse, request: Request): NextResponse {
  const wantsPrivateNetwork = request.headers.get("Access-Control-Request-Private-Network");

  response.headers.set("Access-Control-Allow-Origin", resolveOrigin(request));
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("Access-Control-Request-Headers") ?? "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  if (wantsPrivateNetwork === "true") {
    response.headers.set("Access-Control-Allow-Private-Network", "true");
  }
  response.headers.set("Vary", "Access-Control-Request-Headers, Access-Control-Request-Private-Network");

  return response;
}

export function corsPreflight(request: Request): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return withCors(response, request);
}
