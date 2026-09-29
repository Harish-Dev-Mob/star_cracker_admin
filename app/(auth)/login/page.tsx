import { Suspense } from "react";
import LoginForm from "./LoginForm";

/**
 * Login page — kept intentionally simple.
 *
 * Redirect logic lives in proxy.ts (Edge, fast):
 *   - Verified ADMIN + no error param → sent straight to /admin/dashboard
 *   - Not logged in → allowed to see this page
 *   - admin/layout.tsx sends ?error=session_expired here when the session
 *     is stale, which the LoginForm shows as a banner.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

