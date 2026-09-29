import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy (Next.js 16 replacement for middleware).
 *
 * Uses NextAuth's auth() wrapper (Edge-safe, no bcrypt) so the JWT is
 * properly verified — not just "cookie name present" — before making
 * redirect decisions. This prevents the false "not logged in" detection
 * that caused the infinite redirect loop.
 *
 * Role enforcement (ADMIN only) is still done in:
 *   - lib/auth.ts  → blocks non-ADMIN at JWT creation
 *   - admin/layout.tsx → server-side guard per page
 *   - login/page.tsx   → auto-redirect for already-authed admins
 */

const { auth } = NextAuth(authConfig);

export default auth(
  (req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
    const { nextUrl } = req;
    const session = req.auth;
    const isLoggedIn = !!session?.user;
    const isAdmin = session?.user?.role === "ADMIN";

    // ── Allow NextAuth API routes through unconditionally ─────────────────
    if (nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // ── Root "/" ──────────────────────────────────────────────────────────
    if (nextUrl.pathname === "/") {
      return NextResponse.redirect(
        new URL(isAdmin ? "/admin/dashboard" : "/login", req.nextUrl.origin)
      );
    }

    // ── Login page ────────────────────────────────────────────────────────
    if (nextUrl.pathname.startsWith("/login")) {
      // Already a verified admin with no error flag → send to dashboard
      // (error flag is handled by the server component to break loops)
      const hasError = nextUrl.searchParams.has("error");
      if (isAdmin && !hasError) {
        const callbackUrl = nextUrl.searchParams.get("callbackUrl") ?? "/admin/dashboard";
        return NextResponse.redirect(new URL(callbackUrl, req.nextUrl.origin));
      }
      return NextResponse.next();
    }

    // ── Protected /admin/* routes ─────────────────────────────────────────
    if (nextUrl.pathname.startsWith("/admin")) {
      if (!isLoggedIn) {
        return NextResponse.redirect(
          new URL(
            `/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`,
            req.nextUrl.origin
          )
        );
      }
      if (!isAdmin) {
        // Logged in as a customer → reject
        return NextResponse.redirect(
          new URL("/login?error=not_admin", req.nextUrl.origin)
        );
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};

