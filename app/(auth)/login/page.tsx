"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { loginSchema } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const raw = {
      identifier: fd.get("identifier") as string,
      password: fd.get("password") as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Login failed", "Invalid email/phone or password");
      setLoading(false);
      return;
    }

    toast.success("Welcome back!", "You've been signed in successfully");
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-gradient-to-br from-[#FFF0F0] via-[#FFE5D9] to-[#FFD6BA]">
      {/* Decorative colorful blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-primary-light)]/20 blur-[100px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-accent-light)]/40 blur-[100px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 inline-block animate-float drop-shadow-md">🎆</span>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-accent-dark)]">
            Admin Portal
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-muted)] mt-2">
            Secure login for administrators
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(185,28,28,0.15)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(185,28,28,0.2)]"
        >
          <div className="flex flex-col gap-5">
            <Input
              name="identifier"
              label="Email or Phone"
              placeholder="admin@firecrackers.in or 9876543210"
              error={errors.identifier}
              className="bg-transparent text-black"
              required
              autoFocus
            />
            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password}
              className="bg-transparent text-black"
              required
            />
            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Demo credentials notice */}
        <div className="mt-6 p-4 rounded-[var(--radius-md)] bg-blue-50 border border-blue-200 text-xs text-blue-800">
          <p className="font-semibold mb-1">🔑 Admin Demo Credentials:</p>
          <p>admin@firecrackers.in / Admin@123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
