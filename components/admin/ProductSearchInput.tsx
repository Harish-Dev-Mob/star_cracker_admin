"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

export function ProductSearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // reset to first page on new search
    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(inputRef.current?.value ?? "");
      }}
      className="relative flex items-center w-full max-w-sm"
    >
      {/* Search icon */}
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </span>

      <input
        ref={inputRef}
        id="product-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search by name or slug…"
        className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 transition-all"
        onChange={(e) => {
          // Clear search immediately when input is emptied
          if (e.target.value === "") submit("");
        }}
      />

      <button
        type="submit"
        disabled={isPending}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wide shadow hover:shadow-md hover:-translate-y-px transition-all disabled:opacity-60"
      >
        {isPending ? "…" : "Go"}
      </button>
    </form>
  );
}
