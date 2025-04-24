import { NextResponse } from "next/server";

// Các route cần bảo vệ
const protectedRoutes = [
  "/chess_appointment",
  "/appointment_ongoing",
  "/appointment_history",
  "/wallet",
  "/profile",
];
// Các route công khai
const publicRoutes = ["/login", "/register", "/otp_verification", "/login_otp"];

import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split("/")[1];
  const basePath = pathname.replace(`/${locale}`, "") || "/";
  const accessToken = request.cookies.get("accessToken")?.value;

  // Handle root URL (/)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/vi", request.url));
  }

  // Nếu là route công khai
  if (publicRoutes.includes(basePath)) {
    if (
      accessToken &&
      (basePath === "/login" ||
        basePath === "/login_otp" ||
        basePath === "/register" || // Allow register only if not logged in
        basePath === "/otp_verification")
    ) {
      return NextResponse.redirect(new URL(`/${locale || "vi"}/`, request.url));
    }
    return NextResponse.next();
  }

  // Nếu là route cần bảo vệ
  if (protectedRoutes.some((route) => basePath.startsWith(route))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL(`/${locale || "vi"}/`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // Add root path to matcher
    "/:locale/login",
    "/:locale/register",
    "/:locale/otp_verification",
    "/:locale/login_otp",
    "/:locale/chess_appointment/:path*",
    "/:locale/appointment_ongoing",
    "/:locale/appointment_history",
    "/:locale/appointment_history/:path*",
    "/:locale/appointment_ongoing/:path*",
    "/:locale/wallet/:path*",
    "/:locale/profile/:path*",
  ],
};
