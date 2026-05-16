import { NextResponse, type NextRequest } from "next/server";

/**
 * Protect /admin/* (except /admin/login) with a simple session cookie.
 *
 * IMPORTANT: /api/admin/upload is exempt — Vercel Blob's `handleUpload`
 * makes a server-to-server callback to that route to confirm uploads,
 * and that callback has no session cookie. The route handler itself
 * authenticates the *token-issuing* leg via cookie inside
 * `onBeforeGenerateToken`. The completion-callback leg is signed by
 * Blob, so it doesn't need cookie auth.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/api/admin/login")) return NextResponse.next();
  if (pathname.startsWith("/api/admin/upload")) return NextResponse.next();

  const session = req.cookies.get("admin-session")?.value;
  if (session === "ok") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
