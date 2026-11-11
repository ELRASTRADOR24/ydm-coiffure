import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  buildAdminLoginRedirectUrl,
  verifySessionToken,
} from "./lib/sessionToken";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminPageRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginRoute =
    pathname === "/admin/login" || pathname === "/admin/login/";

  if (isAdminPageRoute && !isLoginRoute) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
      return NextResponse.redirect(buildAdminLoginRedirectUrl(request));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set(
    "x-preview-maintenance",
    request.nextUrl.searchParams.get("preview_maintenance") || ""
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
