import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname === "/login" || pathname.startsWith("/api/")) return NextResponse.next();
  const token = request.cookies.get("hotel_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) throw new Error("Invalid auth configuration");
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("hotel_session");
    return response;
  }
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };