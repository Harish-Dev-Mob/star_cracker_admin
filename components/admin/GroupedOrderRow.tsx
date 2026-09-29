"use client";

import { useState, Fragment } from "react";
import { AdminLinkBtn } from "./AdminActions";

const STATUS_META: Record<string, { badge: string; dot: string }> = {
  PLACED:    { badge: "bg-gray-100 text-gray-700 border-gray-200",     dot: "bg-gray-400" },
  PAYMENT_PENDING: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  PAYMENT_COMPLETED: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CONFIRMED: { badge: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  PACKED:    { badge: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  SHIPPED:   { badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  DELIVERED: { badge: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500" },
  CANCELLED: { badge: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-400" },
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

export function GroupedOrderRow({ group }: { group: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Fragment>
      {/* ── Summary Row (One per customer) ── */}
      <tr className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-5">
          <p className="font-mono text-xs font-black text-gray-500 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
            <span className={`transition-transform ${expanded ? "rotate-90" : ""}`}>▶</span>
            {group.orders.length} Order{group.orders.length > 1 ? "s" : ""}
          </p>
        </td>
        <td className="px-6 py-5">
          <p className="font-bold text-gray-900">{group.user.name}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {group.user.phone ?? group.user.email ?? "—"}
          </p>
        </td>
        <td className="px-6 py-5 text-gray-500 font-medium whitespace-nowrap">
          {new Date(group.latestOrderDate).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </td>
        <td className="px-6 py-5">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
            {group.totalItems} item{group.totalItems > 1 ? "s" : ""}
          </span>
        </td>
        <td className="px-6 py-5">
          {/* Show the status of the most recent order */}
          {(() => {
            const m = STATUS_META[group.orders[0].status] ?? STATUS_META.PLACED;
            return (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${m.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
                {group.orders[0].status}
              </span>
            );
          })()}
        </td>
        <td className="px-6 py-5 text-right font-black text-gray-900 text-base">
          {formatPrice(group.totalSpent)}
        </td>
        <td className="px-6 py-5 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            {expanded ? "Hide" : "View"}
          </button>
        </td>
      </tr>

      {/* ── Expanded Nested Orders ── */}
      {expanded && (
        <tr>
          <td colSpan={7} className="p-0 bg-gray-50/50">
            <div className="px-10 py-4 border-b border-gray-100">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-3 font-bold">Order ID</th>
                    <th className="py-3 font-bold">Date</th>
                    <th className="py-3 font-bold">Items</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold text-right">Total</th>
                    <th className="py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {group.orders.map((order: any) => {
                    const m = STATUS_META[order.status] ?? STATUS_META.PLACED;
                    const itemCount = order.orderItems.reduce((s: number, i: any) => s + i.quantity, 0);
                    return (
                      <tr key={order.id} className="hover:bg-white transition-colors">
                        <td className="py-3 font-mono text-xs font-bold text-gray-500">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold">
                            {itemCount} item{itemCount > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${m.badge}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-3 text-right">
                          <AdminLinkBtn href={`/admin/orders/${order.id}`} id={`btn-view-${order.id}`} variant="view">
                            Open
                          </AdminLinkBtn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}
