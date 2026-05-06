import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function internalError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function rateLimited(message = "Too many requests. Please try again later.", retryAfter?: number) {
  const headers: Record<string, string> = {};
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return NextResponse.json({ error: message }, { status: 429, headers });
}
