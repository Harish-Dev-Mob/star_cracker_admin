"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import StockAdjustButton from "./StockAdjustButton";

const PAGE_SIZE = 10;

// ── Types ────────────────────────────────────────────────────────────────────
interface StockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  lowStockThreshold: number;
  category: { name: string } | null;
  soldTotal: number;       // all non-cancelled order qty
  reserved: number;        // in-flight (placed→shipped)
  delivered: number;       // delivered qty
  cancelled: number;       // cancelled qty
}

type Filter = "all" | "healthy" | "low" | "out";

// ── Helpers ──────────────────────────────────────────────────────────────────
function stockStatus(p: StockProduct): "out" | "low" | "healthy" {
  if (p.stock === 0) return "out";
  if (p.stock <= p.lowStockThreshold) return "low";
  return "healthy";
}

const STATUS_META = {
  healthy: { label: "Healthy",     bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  low:     { label: "Low Stock",   bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400",  bar: "bg-amber-400"  },
  out:     { label: "Out of Stock",bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500",    bar: "bg-red-400"    },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function StocksClient({ products }: { products: StockProduct[] }) {
  const [filter, setFilter]   = useState<Filter>("all");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);

  const counts = useMemo(() => ({
    total:   products.length,
    healthy: products.filter((p) => stockStatus(p) === "healthy").length,
    low:     products.filter((p) => stockStatus(p) === "low").length,
    out:     products.filter((p) => stockStatus(p) === "out").length,
  }), [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (filter === "healthy") return stockStatus(p) === "healthy";
        if (filter === "low")     return stockStatus(p) === "low";
        if (filter === "out")     return stockStatus(p) === "out";
        return true;
      })
      .filter((p) =>
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name ?? "").toLowerCase().includes(search.toLowerCase())
      );
  }, [products, filter, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const visible     = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filter/search changes
  const handleFilter = (f: Filter) => { setFilter(f); setPage(1); };
  const handleSearch = (s: string) => { setSearch(s); setPage(1); };

  // Build page numbers with ellipsis
  const pageNums: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (safePage > 3) pageNums.push("…");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pageNums.push(i);
    if (safePage < totalPages - 2) pageNums.push("…");
    pageNums.push(totalPages);
  }

  return (
    <div className="space-y-6">
      {/* ── Summary Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: counts.total,   icon: "🎆", color: "from-violet-500 to-indigo-500",  light: "bg-indigo-50  text-indigo-700"  },
          { label: "Healthy Stock",  value: counts.healthy, icon: "✅", color: "from-emerald-500 to-teal-500",   light: "bg-emerald-50 text-emerald-700" },
          { label: "Low Stock",      value: counts.low,     icon: "⚠️", color: "from-amber-400 to-orange-500",   light: "bg-amber-50   text-amber-700"   },
          { label: "Out of Stock",   value: counts.out,     icon: "🚫", color: "from-red-500 to-rose-600",       light: "bg-red-50     text-red-700"     },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-md shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black text-gray-900 leading-none mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter + Search bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: "all",     label: `All (${counts.total})` },
            { key: "healthy", label: `Healthy (${counts.healthy})` },
            { key: "low",     label: `Low (${counts.low})` },
            { key: "out",     label: `Out of Stock (${counts.out})` },
          ] as { key: Filter; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${filter === f.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search product…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm font-medium
              focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
          />
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
          <span className="text-sm font-black text-gray-700">Stock Inventory</span>
          <span className="text-xs text-gray-400 font-medium">— {filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/40 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-black">Product</th>
                <th className="px-6 py-3 font-black">Current Stock</th>
                <th className="px-6 py-3 font-black text-center">Reserved</th>
                <th className="px-6 py-3 font-black text-center">Delivered</th>
                <th className="px-6 py-3 font-black text-center">Total Sold</th>
                <th className="px-6 py-3 font-black text-center">Cancelled</th>
                <th className="px-6 py-3 font-black text-center">Status</th>
                <th className="px-6 py-3 font-black text-center">Adjust</th>
                <th className="px-6 py-3 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <span className="text-4xl block mb-3">📦</span>
                    <p className="text-gray-400 font-medium">No products match your filter.</p>
                  </td>
                </tr>
              ) : (
                visible.map((p) => {
                  const status = stockStatus(p);
                  const meta   = STATUS_META[status];
                  // Stock bar: percentage relative to a "full" of max(stock + soldTotal, lowStockThreshold * 2)
                  const maxRef = Math.max(p.stock + p.soldTotal, p.lowStockThreshold * 2, 1);
                  const pct    = Math.min(100, Math.round((p.stock / maxRef) * 100));

                  return (
                    <tr key={p.id} className="group hover:bg-orange-50/20 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-tight">
                          {p.name}
                        </p>
                        {p.category && (
                          <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                            {p.category.name}
                          </span>
                        )}
                      </td>

                      {/* Stock bar */}
                      <td className="px-6 py-4 min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-gray-700 tabular-nums w-8 text-right">
                            {p.stock}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                          threshold: {p.lowStockThreshold}
                        </p>
                      </td>

                      {/* Reserved (in-flight orders) */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black">
                          🔒 {p.reserved}
                        </span>
                      </td>

                      {/* Delivered */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black">
                          ✅ {p.delivered}
                        </span>
                      </td>

                      {/* Sold total */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-gray-800">{p.soldTotal}</span>
                      </td>

                      {/* Cancelled */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-400">{p.cancelled}</span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${meta.bg} ${meta.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>

                      {/* Quick adjust */}
                      <td className="px-6 py-4 text-center">
                        <StockAdjustButton productId={p.id} currentStock={p.stock} />
                      </td>

                      {/* Edit link */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg
                            bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold
                            hover:bg-red-50 hover:border-red-200 hover:text-red-700
                            transition-all opacity-0 group-hover:opacity-100"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
              safePage === 1
                ? "opacity-40 pointer-events-none border-gray-200 text-gray-400 bg-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            ← Prev
          </button>

          <div className="flex items-center gap-1">
            {pageNums.map((n, i) =>
              n === "…" ? (
                <span key={`e-${i}`} className="px-3 py-2 text-gray-400 text-sm font-medium select-none">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    n === safePage
                      ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.35)]"
                      : "text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 bg-white"
                  }`}
                >
                  {n}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
              safePage === totalPages
                ? "opacity-40 pointer-events-none border-gray-200 text-gray-400 bg-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            Next →
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <p className="text-center text-xs text-gray-400 font-medium">
          Showing{" "}
          <span className="text-gray-600 font-bold">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of <span className="text-gray-600 font-bold">{filtered.length}</span> products
          &nbsp;·&nbsp; Page {safePage} of {totalPages}
        </p>
      )}
    </div>
  );
}
