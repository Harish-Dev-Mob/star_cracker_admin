import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy (Next.js 16 replacement for middleware).
 *
 * IMPORTANT: We do NOT redirect logged-in users away from /login here.
 * That responsibility is handled server-side in the login page layout,
 * where `auth()` from lib/auth.ts properly verifies the JWT in Node.js runtime.
 *
 * Doing it here (Edge runtime) caused a redirect loop because:
 * - We can only check cookie *presence* (not validity) in Edge
 * - Stale/invalid cookies look "logged in" to proxy → redirect to /admin/dashboard
 * - Admin layout's server-side auth() fails → redirect to /login
 * - Proxy sees cookie again → redirect to /admin/dashboard → loop
 *
 * The only job of this proxy is: if there is NO session cookie at all,
 * redirect unauthenticated users away from protected routes.
 */

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export default function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isLoggedIn = !!sessionToken;

  // ── Redirect root ────────────────────────────────────────────────────────
  if (nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/admin/dashboard" : "/login", req.nextUrl.origin)
    );
  }

  // ── Require login for all protected routes ───────────────────────────────
  // (Do NOT redirect /login for logged-in users — server-side login page handles that)
  if (!isLoggedIn && !nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(
      new URL(
        `/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`,
        req.nextUrl.origin
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
