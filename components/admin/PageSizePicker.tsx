"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const OPTIONS = [10, 20, 50, 100] as const;

export function PageSizePicker({ pageSize }: { pageSize: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", e.target.value);
    params.set("page", "1"); // reset to first page
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
        Per page
      </span>
      <div className="relative">
        <select
          value={pageSize}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none pl-3 pr-8 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all disabled:opacity-50"
        >
          {OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {/* custom caret */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
          ▾
        </span>
      </div>
    </div>
  );
}
