"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderValue: number;
  expiresAt: string | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
}

const emptyForm = {
  code: "",
  type: "PERCENT" as "PERCENT" | "FLAT",
  value: "",
  minOrderValue: "0",
  expiresAt: "",
  isActive: true,
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Modal state ──────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null); // null = create mode
  const [form, setForm] = useState(emptyForm);

  // ── Delete confirm state ─────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────────────

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ── Open create modal ────────────────────────────────────────────────
  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingCoupon(null);
    setModalOpen(true);
  };

  // ── Open edit modal ──────────────────────────────────────────────────
  const openEditModal = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderValue: coupon.minOrderValue.toString(),
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : "",
    });
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
  };

  // ── Save (create or update) ──────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value),
        minOrderValue: parseFloat(form.minOrderValue),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
      };

      const isEditing = !!editingCoupon;
      const url = isEditing
        ? `/api/admin/coupons/${editingCoupon!.id}`
        : "/api/admin/coupons";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.success(
        "Success",
        isEditing ? "Coupon updated successfully" : "Coupon created successfully"
      );
      closeModal();
      fetchCoupons();
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");
      toast.success("Success", "Coupon deleted successfully");
      fetchCoupons();
    } catch {
      toast.error("Error", "Failed to delete coupon");
    }
  };

  const isEditing = !!editingCoupon;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
            Coupons Management
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Create and manage discount codes for your customers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="relative z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Coupon
        </button>
      </div>

      {/* ── Coupons Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Code</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Discount
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Min Order
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Usage
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Expiry
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading coupons...
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center bg-gray-50/50"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-5xl">🎟️</span>
                      <p className="text-gray-400 font-medium">No coupons yet.</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 text-sm font-bold text-[var(--color-primary)] hover:underline"
                      >
                        Create your first coupon →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-green-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <span className="font-mono font-black text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 tracking-wider">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-900 text-lg">
                        {coupon.type === "PERCENT"
                          ? `${coupon.value}%`
                          : `₹${coupon.value}`}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-gray-600">
                      ₹{coupon.minOrderValue}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-900 text-base">
                        {coupon.usedCount}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {" "}/ {coupon.usageLimit ?? "∞"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-medium text-gray-600 whitespace-nowrap">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Never"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                          coupon.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:text-amber-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(coupon.id)}
                          className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
      />

      {/* ── Create / Edit Modal ──────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl w-full max-w-lg border border-gray-200 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-black text-gray-900 font-display flex items-center gap-2">
                <span className="text-2xl">🎟️</span>
                {isEditing ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <form id="coupon-form" onSubmit={handleSave} className="space-y-5">
                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold font-mono shadow-sm"
                    placeholder="e.g. DIWALI20"
                    required
                  />
                </div>

                {/* Type + Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value as "PERCENT" | "FLAT",
                        })
                      }
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm appearance-none"
                    >
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) =>
                        setForm({ ...form, value: e.target.value })
                      }
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                      placeholder={form.type === "PERCENT" ? "e.g. 10" : "e.g. 500"}
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Min Order + Usage Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      value={form.minOrderValue}
                      onChange={(e) =>
                        setForm({ ...form, minOrderValue: e.target.value })
                      }
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) =>
                        setForm({ ...form, usageLimit: e.target.value })
                      }
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                      placeholder="Unlimited if empty"
                      min="1"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm({ ...form, expiresAt: e.target.value })
                    }
                    className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Active toggle */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer select-none"
                  onClick={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                      form.isActive ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    {form.isActive && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      Active
                    </span>
                    <span className="text-xs text-gray-500">
                      Customers can use this coupon
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer actions */}
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex-shrink-0 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                form="coupon-form"
                type="submit"
                disabled={saving}
                className="flex-[2] bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {saving ? "Saving..." : isEditing ? "Update Coupon" : "Save Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
