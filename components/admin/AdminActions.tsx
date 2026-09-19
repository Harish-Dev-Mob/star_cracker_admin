/**
 * AdminActionBtns — shared pill-style action buttons for admin tables.
 * Variants: view (indigo), edit (amber), delete (red).
 */

import Link from "next/link";

type Variant = "view" | "edit" | "delete";

const STYLES: Record<Variant, string> = {
  view:   "bg-indigo-50  text-indigo-600  border-indigo-100  hover:bg-indigo-100  hover:text-indigo-700",
  edit:   "bg-amber-50   text-amber-600   border-amber-100   hover:bg-amber-100   hover:text-amber-700",
  delete: "bg-red-50     text-red-600     border-red-100     hover:bg-red-100     hover:text-red-700",
};

const BASE = "inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer";

interface LinkBtnProps {
  href: string;
  variant: Variant;
  children: React.ReactNode;
  id?: string;
}

interface ButtonBtnProps {
  onClick: () => void;
  variant: Variant;
  children: React.ReactNode;
  id?: string;
  disabled?: boolean;
}

export function AdminLinkBtn({ href, variant, children, id }: LinkBtnProps) {
  return (
    <Link href={href} id={id} className={`${BASE} ${STYLES[variant]}`}>
      {children}
    </Link>
  );
}

export function AdminBtn({ onClick, variant, children, id, disabled }: ButtonBtnProps) {
  return (
    <button
      onClick={onClick}
      id={id}
      disabled={disabled}
      className={`${BASE} ${STYLES[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

/**
 * PaginationBar — shared server-side pagination bar (URL-based, for server components).
 * Supports pageSize threading so the per-page setting is preserved across navigations.
 */
import { PageSizePicker } from "@/components/admin/PageSizePicker";

export function PaginationBar({
  currentPage,
  totalPages,
  pageSize = 20,
  baseUrl = "",
  extraParams = "",
}: {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  baseUrl?: string;
  extraParams?: string;
}) {
  if (totalPages <= 1 && pageSize === 20) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const sizePart = `pageSize=${pageSize}`;
  const href = (p: number) =>
    `${baseUrl}?page=${p}&${sizePart}${extraParams ? `&${extraParams}` : ""}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      {/* ── Left: Per-page picker ── */}
      <PageSizePicker pageSize={pageSize} />

      {/* ── Centre: Page numbers ── */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Link
            href={href(currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold border transition-all mr-1 ${
              currentPage === 1
                ? "opacity-40 pointer-events-none border-gray-200 text-gray-400 bg-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            ← Prev
          </Link>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`e-${i}`} className="px-2 py-2 text-gray-400 text-sm font-medium select-none">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={href(p)}
                className={`min-w-[36px] h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                  p === currentPage
                    ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.35)]"
                    : "text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 bg-white"
                }`}
              >
                {p}
              </Link>
            )
          )}

          <Link
            href={href(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold border transition-all ml-1 ${
              currentPage === totalPages
                ? "opacity-40 pointer-events-none border-gray-200 text-gray-400 bg-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            Next →
          </Link>
        </div>
      )}

      {/* ── Right: spacer (keeps centre centred on wide screens) ── */}
      <div className="hidden sm:block w-[120px]" />
    </div>
  );
}
