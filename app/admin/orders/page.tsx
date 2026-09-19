import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminLinkBtn, PaginationBar } from "@/components/admin/AdminActions";

const PAGE_SIZE = 15;

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

const STATUS_META: Record<string, { badge: string; dot: string }> = {
  PLACED:    { badge: "bg-gray-100 text-gray-700 border-gray-200",     dot: "bg-gray-400" },
  CONFIRMED: { badge: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  PACKED:    { badge: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  SHIPPED:   { badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  DELIVERED: { badge: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500" },
  CANCELLED: { badge: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-400" },
};

const STATUS_ICON: Record<string, string> = {
  PLACED: "📝", CONFIRMED: "✅", PACKED: "📦",
  SHIPPED: "🚚", DELIVERED: "🎉", CANCELLED: "❌",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [totalCount, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: { select: { quantity: true } },
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
              Orders Management
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Click any order to view full details and update its status.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-3">
            <span className="text-2xl font-black text-indigo-700">{totalCount}</span>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Total Orders</span>
          </div>
        </div>
      </div>

      {/* ── Status Summary Chips ─────────────────────────────────────────────── */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => {
            const m = STATUS_META[s];
            return (
              <div
                key={s}
                className={`rounded-2xl border px-4 py-3 text-center ${m.badge}`}
              >
                <p className="text-xl mb-1">{STATUS_ICON[s]}</p>
                <p className="text-xl font-black">{statusCounts[s] ?? 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-70">
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Orders Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <span className="text-sm font-black text-gray-700">All Orders</span>
          <span className="text-xs text-gray-400 font-medium">— newest first</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Order</th>
                <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Items</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Total</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <span className="text-4xl block mb-3">📦</span>
                    <p className="text-gray-400 font-medium">No orders yet.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const m = STATUS_META[order.status] ?? STATUS_META.PLACED;
                  const itemCount = order.orderItems.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="px-6 py-5">
                        <p className="font-mono text-xs font-black text-gray-500 group-hover:text-gray-900 transition-colors">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{order.user.name}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {order.user.phone ?? order.user.email ?? "—"}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-gray-500 font-medium whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Items count */}
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                          {itemCount} item{itemCount > 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${m.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
                          {order.status}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-5 text-right font-black text-gray-900 text-base">
                        {formatPrice(order.total)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-center">
                        <AdminLinkBtn
                          href={`/admin/orders/${order.id}`}
                          id={`btn-view-order-${order.id}`}
                          variant="view"
                        >
                          View
                        </AdminLinkBtn>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar currentPage={safePage} totalPages={totalPages} />
      </div>

      {totalPages > 1 && (
        <p className="text-center text-xs text-gray-400 font-medium -mt-4">
          Showing{" "}
          <span className="text-gray-600 font-bold">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalCount)}
          </span>{" "}
          of <span className="text-gray-600 font-bold">{totalCount.toLocaleString()}</span> orders
          &nbsp;·&nbsp; Page {safePage} of {totalPages}
        </p>
      )}
    </div>
  );
}
