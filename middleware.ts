/**
 * @file middleware.ts
 * @description Screens every API request before it reaches a route: other websites, oversized bodies, and floods.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Middleware, CORS, Rate Limiting, API Security
 *
 * What each check does, and doesn't do:
 * - Origin: a browser on another website sends its own Origin header, so those requests are refused and no CORS access
 *   is granted. A script can leave Origin out or fake it, so this does not stop scripts. Requests with no Origin are
 *   allowed, because the app's own routes call each other server-to-server without one.
 * - Body size: refuses bodies over 200 KB, which no letter or instruction needs.
 * - Rate limit: at most API_RATE_LIMIT_PER_MINUTE requests (default 240) per address per minute. A classroom shares one
 *   address, so the default is generous; raise it with the environment variable if a class hits it. Counts are kept per
 *   running instance (see src/lib/rate-limit.ts).
 * Which models a request may use, and how long an instruction may be, is checked in each route (src/lib/request-guards.ts).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 200_000;
const DEFAULT_REQUESTS_PER_MINUTE = 240;

const limiter = createRateLimiter({
  limit: Number(process.env.API_RATE_LIMIT_PER_MINUTE) || DEFAULT_REQUESTS_PER_MINUTE,
  windowMs: 60_000,
});

/** The address a request came from, as reported by the hosting proxy. */
function clientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

export default function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed" }, { status: 403 });
  }

  // A same-origin page never needs a preflight, so answer one without granting any cross-origin access.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
  }

  const verdict = limiter.check(clientAddress(request));
  if (!verdict.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfterSeconds) } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
