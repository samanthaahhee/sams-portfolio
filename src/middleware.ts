import { NextResponse, type NextRequest } from "next/server";

/**
 * Protect /admin/* (except /admin/login) with a simple session cookie.
 * The cookie is set by /api/admin/login after a successful password check.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/api/admin/login")) return NextResponse.next();

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
