import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
  }

  // ── Require login for all other routes ──────────────────────────────────────
  if (!isLoggedIn && !nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, req.nextUrl.origin)
    );
  }

  // ── Redirect root to dashboard ─────────────────────────────────────────────
  if (nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
  }

  // ── At this point, the user is logged in (and therefore ADMIN) ───────────
  return NextResponse.next();
});

export const config = {
  // Skip Next.js internals and static files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
