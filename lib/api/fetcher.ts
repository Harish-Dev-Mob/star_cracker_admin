/**
 * API client helper for server-side fetching.
 * Wraps fetch with error handling and JSON parsing.
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "An error occurred");
  }

  return res.json() as Promise<T>;
}
