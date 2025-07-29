import { auth } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export default auth(async function middleware(req, token) {
  const { pathname } = req.nextUrl;

  // Allow public auth routes and API auth routes without restriction
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // Allow publicly accessible routes here
  if (pathname === "/" || pathname.startsWith("/api/videos")) {
    return NextResponse.next();
  }

  // For any other route, require authentication
  if (!token) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Authenticated user, proceed
  return NextResponse.next();
});

// Define which paths this middleware runs on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
