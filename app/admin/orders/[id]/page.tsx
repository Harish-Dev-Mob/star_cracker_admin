"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string;
    price: number;
    discountPrice: number | null;
  };
}

interface Order {
  id: string;
  status: string;
  paymentMode: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  ageConsent: boolean;
  termsAcceptedAt: string | null;
  returnEligible: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    createdAt: string;
  };
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  } | null;
  orderItems: OrderItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);
}

function getProductImg(images: string): string {
  try {
    const arr = JSON.parse(images) as string[];
    return arr[0] || "/images/products/placeholder.jpg";
  } catch {
    return "/images/products/placeholder.jpg";
  }
}

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_STEPS = [
  {
    id: "PLACED",
    label: "Placed",
    icon: "📝",
    desc: "Order received",
    color: "gray",
  },
  {
    id: "CONFIRMED",
    label: "Confirmed",
    icon: "✅",
    desc: "Order verified",
    color: "blue",
  },
  {
    id: "PACKED",
    label: "Packed",
    icon: "📦",
    desc: "Ready for pickup",
    color: "indigo",
  },
  {
    id: "SHIPPED",
    label: "Shipped",
    icon: "🚚",
    desc: "Out for delivery",
    color: "purple",
  },
  {
    id: "DELIVERED",
    label: "Delivered",
    icon: "🎉",
    desc: "Order delivered",
    color: "green",
  },
];

const STATUS_META: Record<
  string,
  { bg: string; text: string; border: string; badge: string }
> = {
  PLACED:    { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-200",   badge: "bg-gray-50 text-gray-700 border-gray-200" },
  CONFIRMED: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  PACKED:    { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  SHIPPED:   { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED: { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  badge: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200",    badge: "bg-red-50 text-red-700 border-red-200" },
};

const NEXT_STATUS: Record<string, string | null> = {
  PLACED:    "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED:    "SHIPPED",
  SHIPPED:   "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

const ALL_STATUSES = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

// ─── Status Stepper ──────────────────────────────────────────────────────────

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const isCancelled = currentStatus === "CANCELLED";
  const currentIdx = STATUS_STEPS.findIndex((s) => s.id === currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-50 border border-red-200">
        <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-red-300 flex items-center justify-center text-2xl shrink-0">
          ❌
        </div>
        <div>
          <p className="font-black text-red-700 text-base">Order Cancelled</p>
          <p className="text-sm text-red-500 mt-0.5">
            This order was cancelled and will not be fulfilled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Steps row */}
      <div className="flex items-start justify-between">
        {STATUS_STEPS.map((step, i) => {
          const isComplete = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isPending = i > currentIdx;
          const isLast = i === STATUS_STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-start flex-1 last:flex-none relative">
              {/* Step */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black border-2 transition-all ${
                    isComplete
                      ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200"
                      : isCurrent
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-red-200 ring-4 ring-red-100"
                      : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  {isComplete ? "✓" : step.icon}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-black whitespace-nowrap ${
                      isComplete || isCurrent ? "text-gray-900" : "text-gray-300"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                      isCurrent
                        ? "text-[var(--color-primary)]"
                        : isComplete
                        ? "text-green-600"
                        : "text-gray-300"
                    }`}
                  >
                    {isCurrent ? "● Current" : isComplete ? "Done" : step.desc}
                  </p>
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex-1 mt-6 mx-2">
                  <div className="h-0.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        i < currentIdx ? "bg-green-400 w-full" : "w-0"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Info Card ───────────────────────────────────────────────────────────────

function InfoCard({
  title,
  icon,
  children,
  accent,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className={`px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 ${accent ?? ""}`}
      >
        <span className="text-base">{icon}</span>
        <span className="text-sm font-black text-gray-800">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error();
      setOrder(await res.json());
    } catch {
      setError("Could not load order details. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    setShowStatusPicker(false);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error || "Could not update status.");
        return;
      }
      setOrder(data);
      setUpdateSuccess(`Status updated to ${status}`);
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleReturnEligible = async () => {
    if (!order) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnEligible: !order.returnEligible }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error || "Could not update return eligibility.");
        return;
      }
      setOrder(data);
      setUpdateSuccess(`Return eligibility updated`);
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <span className="text-5xl block mb-4">⚠️</span>
        <p className="text-gray-500 font-medium">{error || "Order not found."}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.PLACED;
  const nextStatus = NEXT_STATUS[order.status];
  const deliveryFee = order.total + order.discount - order.subtotal;
  const itemCount = order.orderItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <Link href="/admin/orders" className="hover:text-gray-700 transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-black font-mono">#{order.id.slice(-10).toUpperCase()}</span>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm relative p-7 z-20">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-50" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-gray-900 font-display">
                Order Details
              </h1>
              <span
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${meta.badge}`}
              >
                {order.status}
              </span>
            </div>
            <p className="font-mono text-sm text-gray-400 font-bold mb-1">
              # {order.id}
            </p>
            <p className="text-sm text-gray-500">
              Placed{" "}
              <strong className="text-gray-700">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>{" "}
              at{" "}
              <strong className="text-gray-700">
                {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                🛒 {itemCount} item{itemCount > 1 ? "s" : ""}
              </span>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                💰 {order.paymentMode === "COD" ? "Cash on Delivery" : "Online"}
              </span>
              {order.couponCode && (
                <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  🎟️ {order.couponCode}
                </span>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex flex-col gap-2 shrink-0 relative">
            {/* Quick advance */}
            {nextStatus && (
              <button
                id={`btn-advance-status-${nextStatus}`}
                onClick={() => updateStatus(nextStatus)}
                disabled={updating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none flex items-center gap-2 whitespace-nowrap"
              >
                {updating ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>→</span>
                )}
                Mark as {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
              </button>
            )}

            {/* Custom status picker */}
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <div className="relative">
                <button
                  id="btn-change-status"
                  onClick={() => setShowStatusPicker((v) => !v)}
                  className="w-full px-5 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  ⚙️ Change Status
                </button>
                {showStatusPicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 min-w-[180px]">
                    {ALL_STATUSES.map((s) => {
                      const m = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(s)}
                          disabled={s === order.status}
                          className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors flex items-center gap-2 ${
                            s === order.status
                              ? "opacity-40 cursor-not-allowed bg-gray-50"
                              : "hover:bg-gray-50"
                          } ${m.text}`}
                        >
                          <span className="text-base">
                            {STATUS_STEPS.find((x) => x.id === s)?.icon ?? "❌"}
                          </span>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                          {s === order.status && (
                            <span className="ml-auto text-[10px] font-black">Current</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Cancel button (if not already terminal) */}
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <button
                id="btn-cancel-order"
                onClick={() => setShowCancelModal(true)}
                disabled={updating}
                className="px-5 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                🚫 Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {(updateError || updateSuccess) && (
          <div
            className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium ${
              updateError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {updateError || `✅ ${updateSuccess}`}
          </div>
        )}
      </div>

      {/* ── Status Stepper ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
          Order Progress
        </p>
        <StatusStepper currentStatus={order.status} />

        {/* Status description card */}
        {order.status !== "CANCELLED" && (
          <div
            className={`mt-6 p-4 rounded-2xl border flex items-center gap-4 ${meta.bg} ${meta.border}`}
          >
            <span className="text-2xl">
              {STATUS_STEPS.find((s) => s.id === order.status)?.icon ?? "📝"}
            </span>
            <div>
              <p className={`font-black text-sm ${meta.text}`}>
                {
                  {
                    PLACED:    "Order has been placed successfully and is awaiting confirmation.",
                    CONFIRMED: "Order has been confirmed. Getting items ready for packing.",
                    PACKED:    "All items are packed and ready for handover to delivery.",
                    SHIPPED:   "Order is out for delivery with the courier partner.",
                    DELIVERED: "Order was delivered successfully. 🎉",
                  }[order.status]
                }
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Last updated:{" "}
                {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <InfoCard title="Order Items" icon="🛒">
            <div className="space-y-4">
              {order.orderItems.map((item) => {
                const img = getProductImg(item.product.images);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50/30 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect fill='%23f3f4f6' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-size='20' text-anchor='middle' dominant-baseline='middle'%3E🎆%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm leading-tight truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {fmt(item.priceAtOrder)} × {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Product ID:{" "}
                        <span className="font-mono">{item.product.id.slice(-8)}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-gray-900 text-sm">
                        {fmt(item.priceAtOrder * item.quantity)}
                      </p>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </InfoCard>

          {/* Notes */}
          {order.notes && (
            <InfoCard title="Order Notes" icon="📝">
              <p className="text-sm text-gray-600 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-4">
                &ldquo;{order.notes}&rdquo;
              </p>
            </InfoCard>
          )}

          {/* Customer Info */}
          <InfoCard title="Customer Details" icon="👤">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-black text-sm shrink-0">
                  {order.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{order.user.name}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    Customer since{" "}
                    {new Date(order.user.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {order.user.email && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {order.user.email}
                    </p>
                  </div>
                )}
                {order.user.phone && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <p className="text-sm font-bold text-gray-800">{order.user.phone}</p>
                  </div>
                )}
              </div>
              <Link
                href={`/admin/customers`}
                className="block text-xs font-bold text-indigo-600 hover:underline mt-1"
              >
                View all customer orders →
              </Link>
            </div>
          </InfoCard>
        </div>

        {/* Right: Summary + Address */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <InfoCard title="Payment Summary" icon="💳" accent="bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">{fmt(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-medium flex items-center gap-1">
                    <span>🎟️</span>
                    {order.couponCode ? `Coupon (${order.couponCode})` : "Discount"}
                  </span>
                  <span className="font-bold">−{fmt(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Delivery</span>
                <span
                  className={`font-bold ${deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}
                >
                  {deliveryFee === 0 ? "Free 🎉" : fmt(deliveryFee)}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-lg text-[var(--color-primary)]">
                  {fmt(order.total)}
                </span>
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <span className="text-base">💰</span>
                  <div>
                    <p className="text-xs font-black text-amber-800">Cash on Delivery</p>
                    <p className="text-[10px] text-amber-600 font-medium">
                      Collect at time of delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Delivery Address */}
          <InfoCard title="Delivery Address" icon="📍">
            {order.address ? (
              <div className="space-y-2 text-sm">
                <p className="font-black text-gray-900">{order.address.name}</p>
                <p className="text-gray-600">{order.address.street}</p>
                <p className="text-gray-600">
                  {order.address.city}, {order.address.state} — {order.address.pincode}
                </p>
                <p className="text-gray-500">{order.address.country}</p>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex items-center gap-2 text-gray-500">
                  <span>📞</span>
                  <span className="font-bold text-gray-800">{order.address.phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-medium">No address on file.</p>
            )}
          </InfoCard>

          {/* Order Meta */}
          <InfoCard title="Order Info" icon="ℹ️">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Order ID</span>
                <span className="font-mono font-black text-gray-700 text-right break-all max-w-[140px]">
                  {order.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Placed</span>
                <span className="font-bold text-gray-700">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Updated</span>
                <span className="font-bold text-gray-700">
                  {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Age Consent</span>
                <span
                  className={`font-black px-2 py-0.5 rounded-lg ${
                    order.ageConsent
                      ? "text-green-700 bg-green-50"
                      : "text-red-700 bg-red-50"
                  }`}
                >
                  {order.ageConsent ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Terms Accepted</span>
                <span className="font-bold text-gray-700 text-right">
                  {order.termsAcceptedAt ? (
                    new Date(order.termsAcceptedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  ) : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Return Eligible</span>
                <button
                  onClick={toggleReturnEligible}
                  disabled={updating}
                  className={`font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                    order.returnEligible
                      ? "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      : "text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                  } disabled:opacity-50`}
                >
                  {order.returnEligible ? "Yes" : "No"}
                </button>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 sm:p-8">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-3xl mb-6 mx-auto border border-red-100">
                ⚠️
              </div>
              <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Cancel Order?</h2>
              <p className="text-center text-gray-500 mb-8 font-medium">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    updateStatus("CANCELLED");
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
