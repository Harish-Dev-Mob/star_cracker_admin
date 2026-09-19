"use client";

import { useSession } from "next-auth/react";

export interface CurrentUser {
  id: string;
  name: string;
  email?: string | null;
  role: "CUSTOMER" | "ADMIN";
}

/**
 * Client-side hook that returns the current authenticated user.
 * Returns null when not logged in or session is loading.
 *
 * @example
 * const { user, isLoading } = useCurrentUser();
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  const user = session?.user
    ? ({
        id: (session.user as { id?: string }).id ?? "",
        name: session.user.name ?? "",
        email: session.user.email,
        role: ((session.user as { role?: string }).role ?? "CUSTOMER") as CurrentUser["role"],
      } satisfies CurrentUser)
    : null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "ADMIN",
  };
}
