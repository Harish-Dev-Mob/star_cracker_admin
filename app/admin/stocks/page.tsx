import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StocksClient from "./StocksClient";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default async function AdminStocksPage() {
  // Fetch all products with their order items grouped by order status
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      stock: true,
      lowStockThreshold: true,
      price: true,
      category: { select: { name: true } },
      orderItems: {
        select: {
          quantity: true,
          order: { select: { status: true } },
        },
      },
    },
  });

  // Derive stock movement numbers per product
  const stockData = products.map((p) => {
    const IN_FLIGHT = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"];

    let reserved  = 0; // in-flight (not yet delivered/cancelled)
    let delivered = 0; // successfully delivered
    let cancelled = 0; // cancelled qty
    let soldTotal = 0; // all non-cancelled qty

    for (const item of p.orderItems) {
      const status = item.order.status;
      if (status === "CANCELLED") {
        cancelled += item.quantity;
        continue;
      }
      soldTotal += item.quantity;
      if (IN_FLIGHT.includes(status)) {
        reserved += item.quantity;
      }
      if (status === "DELIVERED") {
        delivered += item.quantity;
      }
    }

    return {
      id:               p.id,
      name:             p.name,
      slug:             p.slug,
      stock:            p.stock,
      lowStockThreshold:p.lowStockThreshold,
      category:         p.category,
      soldTotal,
      reserved,
      delivered,
      cancelled,
    };
  });

  // Summary numbers for the header
  const outCount     = stockData.filter((p) => p.stock === 0).length;
  const lowCount     = stockData.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: "DELIVERED" },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-red-100 via-orange-50 to-amber-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl shadow-md">
                📊
              </span>
              <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
                Stock Tracking
              </h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Live inventory health — driven by checkout &amp; delivery data.
            </p>
          </div>

          {/* Quick alerts */}
          <div className="flex flex-wrap gap-3">
            {outCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-black text-red-700">{outCount} Out of Stock</span>
              </div>
            )}
            {lowCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-black text-amber-700">{lowCount} Low Stock</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-sm font-black text-emerald-700">
                💰 {formatPrice(totalRevenue._sum.total ?? 0)} Delivered Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="relative z-10 flex items-center gap-2 mt-6 text-xs text-gray-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-700">Stocks</span>
        </nav>
      </div>

      {/* ── Client interactive table ─────────────────────────────────────── */}
      <StocksClient products={stockData} />
    </div>
  );
}
