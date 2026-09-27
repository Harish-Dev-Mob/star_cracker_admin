import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

// Server component: verifies JWT in Node.js runtime (not Edge).
// If the user already has a valid session, redirect them to the dashboard.
// This prevents the redirect loop caused by stale cookies in the Edge proxy.
export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

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
