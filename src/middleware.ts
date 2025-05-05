import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const protectedRoutes = [
  "/appointment_ongoing",
  "/appointment_history",
  "/wallet",
  "/reward_history",
  "/profile",
];
const publicRoutes = ["/login", "/register", "/otp_verification", "/login_otp"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split("/")[1];
  const basePath = pathname.replace(`/${locale}`, "") || "/";
  const accessToken = request.cookies.get("accessToken")?.value;

  // Xử lý các route
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/vi", request.url));
  }

  if (publicRoutes.includes(basePath)) {
    if (
      accessToken &&
      (basePath === "/login" ||
        basePath === "/login_otp" ||
        basePath === "/register" ||
        basePath === "/otp_verification")
    ) {
      return NextResponse.redirect(new URL(`/${locale || "vi"}/`, request.url));
    }
    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => basePath.startsWith(route))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL(`/${locale || "vi"}/`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/:locale/login",
    "/:locale/register",
    "/:locale/otp_verification",
    "/:locale/login_otp",
    "/:locale/appointment_ongoing",
    "/:locale/appointment_history",
    "/:locale/appointment_history/:path*",
    "/:locale/appointment_ongoing/:path*",
    "/:locale/wallet/:path*",
    "/:locale/profile/:path*",
    "/:locale/reward_history/:path*",
  ],
};
