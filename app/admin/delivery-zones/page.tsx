"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface DeliveryZone {
  id: string;
  pincode: string | null;
  stateCode: string | null;
  isAllowed: boolean;
  courierPartner: string | null;
  minOrderValue: number;
  notes: string | null;
  createdAt: string;
}

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    pincode: "",
    stateCode: "",
    isAllowed: true,
    courierPartner: "",
    minOrderValue: "0",
    notes: "",
  });

  const fetchZones = async () => {
    try {
      const res = await fetch("/api/admin/delivery-zones");
      const data = await res.json();
      setZones(data);
    } catch {
      toast.error("Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/delivery-zones/${editingId}`
        : "/api/admin/delivery-zones";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(
        editingId ? "Updated successfully" : "Created successfully",
      );
      setModalOpen(false);
      fetchZones();
    } catch {
      toast.error("Failed to save delivery zone");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted successfully");
      fetchZones();
    } catch {
      toast.error("Failed to delete delivery zone");
    }
  };

  const openModal = (zone?: DeliveryZone) => {
    if (zone) {
      setEditingId(zone.id);
      setForm({
        pincode: zone.pincode || "",
        stateCode: zone.stateCode || "",
        isAllowed: zone.isAllowed,
        courierPartner: zone.courierPartner || "",
        minOrderValue: zone.minOrderValue.toString(),
        notes: zone.notes || "",
      });
    } else {
      setEditingId(null);
      setForm({
        pincode: "",
        stateCode: "",
        isAllowed: true,
        courierPartner: "",
        minOrderValue: "0",
        notes: "",
      });
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display">
            Delivery Zones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage serviceable pincodes and state codes
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="relative z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Zone
        </button>
      </div>

      {/* ── List Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50/50 border-b border-gray-100 uppercase text-xs font-black tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Partner</th>
              <th className="px-6 py-4 text-center">Min Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No zones defined.
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    {zone.pincode ? (
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                        PIN: {zone.pincode}
                      </span>
                    ) : null}
                    {zone.stateCode ? (
                      <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded ml-2">
                        STATE: {zone.stateCode}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${zone.isAllowed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {zone.isAllowed ? "Allowed" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {zone.courierPartner || "—"}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900">
                    ₹{zone.minOrderValue}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(zone)}
                      className="text-blue-600 font-bold text-xs uppercase tracking-wider hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(zone.id)}
                      className="text-red-600 font-bold text-xs uppercase tracking-wider hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Confirm Delete Modal ───────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Delivery Zone"
        message="Are you sure you want to delete this delivery zone? This action cannot be undone."
      />

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-2xl relative overflow-hidden" style={{ colorScheme: "light" }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <h2 className="text-2xl font-black text-gray-900 font-display mb-6 relative z-10">
              {editingId ? "Edit" : "Add"} Delivery Zone
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Pincode (6 digits)
                </label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium placeholder:text-gray-400"
                  placeholder="e.g. 600001"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="text-xs font-black text-gray-400 tracking-wider">
                  OR
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  State Prefix (2 digits)
                </label>
                <input
                  type="text"
                  value={form.stateCode}
                  onChange={(e) =>
                    setForm({ ...form, stateCode: e.target.value })
                  }
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium placeholder:text-gray-400"
                  placeholder="e.g. 29 for Karnataka"
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="isAllowed"
                  checked={form.isAllowed}
                  onChange={(e) =>
                    setForm({ ...form, isAllowed: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label
                  htmlFor="isAllowed"
                  className="text-sm font-bold text-gray-900 cursor-pointer select-none"
                >
                  Allow Delivery to this Zone
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) =>
                      setForm({ ...form, minOrderValue: e.target.value })
                    }
                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={form.courierPartner}
                    onChange={(e) =>
                      setForm({ ...form, courierPartner: e.target.value })
                    }
                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
                />
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

