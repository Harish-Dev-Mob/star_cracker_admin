"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string | null;
  isActive: boolean;
}

export default function AdminPickupLocationsPage() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isActive: true,
  });

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/admin/pickup-locations");
      const data = await res.json();
      setLocations(data);
    } catch {
      toast.error("Failed to load pickup locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/admin/pickup-locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Success", "Location deleted");
      fetchLocations();
    } catch {
      toast.error("Error", "Failed to delete location");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing && editId ? `/api/admin/pickup-locations/${editId}` : "/api/admin/pickup-locations";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      
      toast.success("Success", isEditing ? "Location updated successfully" : "Location created successfully");
      setModalOpen(false);
      fetchLocations();
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setForm({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      isActive: true,
    });
    setIsEditing(false);
    setEditId(null);
    setModalOpen(true);
  };

  const openEditModal = (loc: PickupLocation) => {
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      phone: loc.phone || "",
      isActive: loc.isActive,
    });
    setIsEditing(true);
    setEditId(loc.id);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ── CONFIRM DELETE MODAL ───────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Pickup Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
      />

      {/* ── CREATE / EDIT MODAL ──────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Pickup Locations</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage physical stores for self-pickup orders.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="relative z-10 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2"
        >
           <span className="text-lg">+</span> Add Location
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Store Name</th>
                <th className="px-6 py-4 font-bold tracking-wider">Address</th>
                <th className="px-6 py-4 font-bold tracking-wider">Contact</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">Loading locations...</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">No locations found.</td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                       <p className="font-black text-gray-900 text-base">{loc.name}</p>
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-medium text-gray-800">{loc.address}</p>
                       <p className="text-xs text-gray-500 mt-1">{loc.city}, {loc.state} - {loc.pincode}</p>
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-medium text-gray-800">{loc.phone || "—"}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${loc.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                         {loc.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(loc)}
                          className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:text-amber-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(loc.id)}
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-gray-200 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-2xl font-black text-gray-900 font-display relative z-10 flex items-center gap-2">
                <span className="text-2xl">🏪</span> {isEditing ? "Edit Location" : "Add Location"}
              </h2>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <form id="location-form" onSubmit={handleSave} className="space-y-6">
                
                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                    placeholder="e.g. Main Branch Sivakasi"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium shadow-sm"
                    placeholder="e.g. 123 Market Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium shadow-sm"
                      placeholder="e.g. Sivakasi"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium shadow-sm"
                      placeholder="e.g. Tamil Nadu"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                      placeholder="e.g. 626123"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium shadow-sm"
                      placeholder="Store contact number"
                    />
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${form.isActive ? "bg-green-600" : "bg-gray-300 "}`}>
                    {form.isActive && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-900 cursor-pointer select-none">Active</label>
                    <span className="text-xs text-gray-500">Customers can pick up from here</span>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex-shrink-0 flex gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-4 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                form="location-form"
                type="submit"
                disabled={saving}
                className="flex-[2] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-4 py-4 rounded-xl font-black uppercase tracking-wider text-xs shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : (isEditing ? "Update Location" : "Save Location")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
