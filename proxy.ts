import { NextResponse, type NextRequest } from "next/server";
import { updateAuthSession } from "@/lib/supabase";

const protectedRoutes = ["/", "/employees", "/analytics", "/account", "/api/employees", "/api/dashboard"];

export async function proxy(request: NextRequest) {
  const result = await updateAuthSession(request);
  if (result instanceof NextResponse) {
    return result;
  }

  const isProtected = protectedRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`),
  );
  if (isProtected && !result.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return result.response;
}

export const config = {
  matcher: ["/", "/employees/:path*", "/analytics/:path*", "/account/:path*", "/api/employees/:path*", "/api/dashboard/:path*"],
};
