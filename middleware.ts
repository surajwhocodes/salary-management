import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient, AUTH_COOKIE_NAME } from "@/lib/supabase";

const protectedRoutes = ["/employees", "/analytics"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = createSupabaseServerClient(request.headers.get("cookie")).getSession();

  if (protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employees/:path*", "/analytics/:path*"],
};
