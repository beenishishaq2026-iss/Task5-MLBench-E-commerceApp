import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

const PROTECTED_PATHS = ["/profile", "/cart", "/wishlist", "/checkout", "/orders", "/admin"];

const RATE_LIMITED_ROUTES: { path: string; method: string; limiter: "auth" | "checkout" }[] = [
  { path: "/api/auth/login", method: "POST", limiter: "auth" },
  { path: "/api/auth/signup", method: "POST", limiter: "auth" },
  { path: "/api/auth/forgot-password", method: "POST", limiter: "auth" },
  { path: "/api/auth/reset-password", method: "POST", limiter: "auth" },
  { path: "/api/auth/verify-otp", method: "POST", limiter: "auth" },
  { path: "/api/auth/resend-otp", method: "POST", limiter: "auth" },
  { path: "/api/orders", method: "POST", limiter: "checkout" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rateLimited = RATE_LIMITED_ROUTES.find(
    (route) => pathname === route.path && request.method === route.method
  );

  if (rateLimited) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = await checkRateLimit(`${rateLimited.limiter}:${ip}`, rateLimited.limiter);
    if (!success) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token");
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    const meRes = await fetch(new URL("/api/auth/me", request.url), {
      headers: { cookie: `token=${token.value}` },
    });

    if (!meRes.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const data = await meRes.json();
    if (data.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
    "/api/orders",
  ],
};