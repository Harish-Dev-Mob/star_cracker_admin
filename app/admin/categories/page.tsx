"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

const PAGE_SIZE = 10;


// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  _count: { products: number };
}

interface FormState {
  name: string;
  icon: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  icon: "",
  image: "",
  sortOrder: "0",
  isActive: true,
};

const POPULAR_ICONS = ["🎆", "🎇", "🧨", "✨", "🎉", "🪅", "🌟", "💥", "🔥", "🎊", "🪔", "🎑"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);


  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      setCategories(await res.json());
    } catch {
      setError("Could not load categories. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Derived pagination values
  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = categories.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNums: (number | "…")[] = useMemo(() => {
    const nums: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (safePage > 3) nums.push("…");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) nums.push(i);
      if (safePage < totalPages - 2) nums.push("…");
      nums.push(totalPages);
    }
    return nums;
  }, [totalPages, safePage]);


  // ─── Modal helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      icon: cat.icon ?? "",
      image: cat.image ?? "",
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  // ─── Save (create / update) ──────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      icon: form.icon.trim() || null,
      image: form.image.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        return;
      }

      if (editingId) {
        setCategories((prev) => prev.map((c) => (c.id === editingId ? data : c)));
      } else {
        setCategories((prev) => [...prev, data].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      closeModal();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Could not delete category.");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Toggle active status ────────────────────────────────────────────────────

  const toggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cat, isActive: !cat.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      }
    } catch { /* silent */ }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-100 to-rose-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
            Categories Management
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Organize your store&apos;s product categories — create, edit & delete.
          </p>
        </div>
        <button
          id="btn-add-category"
          onClick={openCreate}
          className="relative z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Category
        </button>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: categories.length, color: "blue" },
            { label: "Active", value: categories.filter((c) => c.isActive).length, color: "green" },
            { label: "Inactive", value: categories.filter((c) => !c.isActive).length, color: "gray" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading categories…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider w-20">Icon</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Category Name</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Products</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Order</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-5xl">📁</span>
                        <p className="text-gray-400 font-medium">No categories yet.</p>
                        <button
                          onClick={openCreate}
                          className="mt-2 text-red-600 font-bold text-sm hover:underline"
                        >
                          + Create your first category
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      {/* Icon */}
                      <td className="px-6 py-4 text-center">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner mx-auto">
                          {cat.icon || "📁"}
                        </div>
                      </td>

                      {/* Name + slug */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{cat.slug}</p>
                      </td>

                      {/* Products */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-gray-900 text-base">{cat._count.products}</span>
                      </td>

                      {/* Sort order */}
                      <td className="px-6 py-4 text-center font-bold text-gray-500">
                        {cat.sortOrder}
                      </td>

                      {/* Status toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          id={`toggle-status-${cat.id}`}
                          onClick={() => toggleActive(cat)}
                          title="Click to toggle"
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border transition-all hover:scale-105 cursor-pointer ${
                            cat.isActive
                              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-edit-${cat.id}`}
                            onClick={() => openEdit(cat)}
                            className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:text-amber-700"
                          >
                            Edit
                          </button>
                          <button
                            id={`btn-delete-${cat.id}`}
                            onClick={() => { setDeleteTarget(cat); setDeleteError(""); }}
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
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer ${
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
                    className={`min-w-[36px] h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                safePage === totalPages
                  ? "opacity-40 pointer-events-none border-gray-200 text-gray-400 bg-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Create / Edit Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-pop-in overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 id="modal-title" className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                {editingId ? "✏️ Edit Category" : "✨ Create Category"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-lg font-medium transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="p-8 space-y-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="cat-name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sparklers"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors placeholder:text-gray-300"
                />
              </div>

              {/* Icon */}
              <div>
                <label htmlFor="cat-icon" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Icon (emoji)
                </label>
                <input
                  id="cat-icon"
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="🎆"
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors"
                />
                {/* Quick picks */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {POPULAR_ICONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setForm((f) => ({ ...f, icon: em }))}
                      className={`w-9 h-9 rounded-lg border text-xl flex items-center justify-center transition-all hover:scale-110 ${
                        form.icon === em
                          ? "border-red-400 bg-red-50 shadow-sm"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort order + Active in a row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cat-order" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Sort Order
                  </label>
                  <input
                    id="cat-order"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    min={0}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className="flex items-center gap-3 px-4 py-3 h-12 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                      ✓
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-bold text-gray-900 leading-tight">Active</p>
                      <p className="text-[10px] text-gray-500 leading-tight">Customers can see this category</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 mt-2 border-t border-gray-100 px-8 pb-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-category"
                  disabled={saving}
                  className="flex-1 px-4 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.35)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 uppercase"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : editingId ? (
                    "Save Category"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Delete Confirm Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-pop-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🗑️
            </div>
            <h2 id="delete-modal-title" className="text-xl font-black text-gray-900 mb-2">
              Delete Category?
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              You&apos;re about to permanently delete:
            </p>
            <p className="text-base font-bold text-gray-800 mb-4">
              {deleteTarget.icon} {deleteTarget.name}
            </p>
            {deleteTarget._count.products > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-xl mb-4">
                ⚠️ This category has {deleteTarget._count.products} product(s). Delete will be blocked unless they&apos;re reassigned.
              </div>
            )}
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-4">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
