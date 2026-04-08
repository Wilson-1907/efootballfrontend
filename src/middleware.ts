import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  computeAdminSessionToken,
} from "@/lib/admin-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const secret = process.env.SESSION_SECRET ?? "dev-change-me";
  const expected = await computeAdminSessionToken(secret);
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
