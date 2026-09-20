"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  name: string;
  location: string;
  rating: string;
  text: string;
  isVisible: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  location: "",
  rating: "5",
  text: "",
  isVisible: true,
};

// ─── Auto-approve setting (localStorage) ────────────────────────────────────────
const AUTO_APPROVE_KEY = "admin_reviews_auto_approve";

// ─── Star Rating Input ───────────────────────────────────────────────────────────

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <span
            className={
              star <= (hovered || value) ? "text-amber-400" : "text-gray-200"
            }
          >
            &#9733;
          </span>
        </button>
      ))}
      <span className="ml-2 text-sm font-bold text-gray-500 self-center">
        {value}/5
      </span>
    </div>
  );
}

// ─── Static Stars Display ────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-sm ${s <= rating ? "text-amber-400" : "text-gray-200"}`}
        >
          &#9733;
        </span>
      ))}
    </span>
  );
}

// ─── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  id,
  size = "md",
}: {
  checked: boolean;
  onChange: () => void;
  id: string;
  size?: "sm" | "md";
}) {
  const isSmall = size === "sm";
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative rounded-full transition-colors flex items-center px-1 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${isSmall ? "w-10 h-6" : "w-14 h-8"
        } ${checked ? "bg-[var(--color-primary)]" : "bg-gray-200"}`}
    >
      <span
        className={`rounded-full bg-white shadow-sm transition-transform ${isSmall ? "w-4 h-4" : "w-6 h-6"
          } ${checked ? (isSmall ? "translate-x-4" : "translate-x-6") : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Auto-approve
  const [autoApprove, setAutoApprove] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTO_APPROVE_KEY) === "true";
    }
    return false;
  });

  // ─── Persist auto-approve ────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(AUTO_APPROVE_KEY, String(autoApprove));
  }, [autoApprove]);

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error();
      setReviews(await res.json());
    } catch {
      setError("Could not load reviews. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ─── Filtered reviews ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q);
      const matchRating =
        filterRating === "all" || r.rating === Number(filterRating);
      const matchVis =
        filterVisibility === "all" ||
        (filterVisibility === "visible" && r.isVisible) ||
        (filterVisibility === "hidden" && !r.isVisible);
      return matchSearch && matchRating && matchVis;
    });
  }, [reviews, search, filterRating, filterVisibility]);

  // ─── Stats ───────────────────────────────────────────────────────────────

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  // ─── Modal helpers ───────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isVisible: autoApprove });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (r: Review) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      location: r.location,
      rating: String(r.rating),
      text: r.text,
      isVisible: r.isVisible,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  // ─── Save ────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      rating: Number(form.rating),
      text: form.text.trim(),
      isVisible: form.isVisible,
    };

    try {
      const url = editingId
        ? `/api/admin/reviews/${editingId}`
        : "/api/admin/reviews";
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
        setReviews((prev) =>
          prev.map((r) => (r.id === editingId ? data : r))
        );
      } else {
        setReviews((prev) => [data, ...prev]);
      }
      closeModal();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Could not delete review.");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Toggle visibility ───────────────────────────────────────────────────

  const toggleVisible = async (r: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...r, isVisible: !r.isVisible }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) =>
          prev.map((item) => (item.id === r.id ? updated : item))
        );
      }
    } catch {
      /* silent */
    }
  };

  // ─── Approve all hidden ──────────────────────────────────────────────────

  const approveAll = async () => {
    const hidden = reviews.filter((r) => !r.isVisible);
    for (const r of hidden) {
      await fetch(`/api/admin/reviews/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...r, isVisible: true }),
      });
    }
    setReviews((prev) => prev.map((r) => ({ ...r, isVisible: true })));
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
            Reviews Management
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage customer reviews — edit, approve, hide, and create new ones.
          </p>
        </div>
        <button
          id="btn-add-review"
          onClick={openCreate}
          className="relative z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Review
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Auto-Approve Panel ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xl shrink-0">
            &#9889;
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">Auto-Approve New Reviews</p>
            <p className="text-xs text-gray-500 mt-0.5 max-w-sm">
              When enabled, newly created reviews will automatically be set to{" "}
              <strong>Visible</strong> without manual approval.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Toggle
            id="toggle-auto-approve"
            checked={autoApprove}
            onChange={() => setAutoApprove((v) => !v)}
          />
          <span
            className={`text-sm font-bold ${autoApprove ? "text-green-600" : "text-gray-400"}`}
          >
            {autoApprove ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: reviews.length, icon: "📝" },
            { label: "Visible", value: reviews.filter((r) => r.isVisible).length, icon: "✅" },
            { label: "Hidden", value: reviews.filter((r) => !r.isVisible).length, icon: "🚫" },
            { label: "Avg. Rating", value: avgRating, icon: "⭐" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center"
            >
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      {!loading && reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              id="review-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location, or text…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors placeholder:text-gray-300"
            />
          </div>

          {/* Rating filter */}
          <select
            id="filter-rating"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors bg-white"
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {"★".repeat(r)} ({r} star{r > 1 ? "s" : ""})
              </option>
            ))}
          </select>

          {/* Visibility filter */}
          <select
            id="filter-visibility"
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors bg-white"
          >
            <option value="all">All Status</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          {/* Approve all */}
          {reviews.some((r) => !r.isVisible) && (
            <button
              id="btn-approve-all"
              onClick={approveAll}
              className="px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold hover:bg-green-100 transition-colors flex items-center gap-2 shrink-0"
            >
              ✅ Approve All
            </button>
          )}
        </div>
      )}

      {/* ── Review List ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-20 flex flex-col items-center gap-3">
          <span className="text-6xl">⭐</span>
          <p className="text-gray-400 font-medium">No reviews yet.</p>
          <button
            onClick={openCreate}
            className="mt-2 text-amber-600 font-bold text-sm hover:underline"
          >
            + Create your first review
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-16 flex flex-col items-center gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-gray-400 font-medium">No reviews match your filters.</p>
          <button
            onClick={() => {
              setSearch("");
              setFilterRating("all");
              setFilterVisibility("all");
            }}
            className="text-amber-600 font-bold text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-700">All Reviews</span>
              <span className="text-xs text-gray-400 font-medium">
                — {filtered.length} of {reviews.length} shown
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map((review) => (
              <div
                key={review.id}
                className={`p-6 flex flex-col sm:flex-row gap-4 hover:bg-amber-50/20 transition-colors group ${!review.isVisible ? "opacity-60" : ""
                  }`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <p className="font-black text-gray-900 text-base leading-tight">
                      {review.name}
                    </p>
                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                      📍 {review.location}
                    </span>
                    {!review.isVisible && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 items-start sm:items-end shrink-0">
                  <div className="flex items-center gap-2">
                    <Toggle
                      id={`toggle-review-${review.id}`}
                      checked={review.isVisible}
                      onChange={() => toggleVisible(review)}
                      size="sm"
                    />
                    <span
                      className={`text-xs font-bold ${review.isVisible ? "text-green-600" : "text-gray-400"
                        }`}
                    >
                      {review.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id={`btn-edit-review-${review.id}`}
                      onClick={() => openEdit(review)}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:text-amber-700"
                    >
                      Edit
                    </button>
                    <button
                      id={`btn-delete-review-${review.id}`}
                      onClick={() => {
                        setDeleteTarget(review);
                        setDeleteError("");
                      }}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Create / Edit Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

            {/* ── Header ───────────────────────────────────────── */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2
                id="review-modal-title"
                className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2"
              >
                {editingId ? "✏️ Edit Review" : "⭐ Create Review"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-lg font-medium transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* ── Scrollable Form Body ──────────────────────────────────── */}
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-6 sm:py-8 space-y-6">

                {/* Error Banner */}
                {formError && (
                  <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <span className="text-lg">⚠️</span>
                    {formError}
                  </div>
                )}

                {/* ── Name + Location side by side ────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="review-name"
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                    >
                      <span className="text-base">👤</span> Customer Name
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Priya Sharma"
                      required
                      className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 bg-white"
                    />
                  </div>

                  {/* Location */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="review-location"
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                    >
                      <span className="text-base">📍</span> Location
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="review-location"
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      placeholder="e.g. Chennai, TN"
                      required
                      className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 bg-white"
                    />
                  </div>
                </div>

                {/* ── Rating ──────────────────────────────────────────── */}
                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl px-5 py-4">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <span className="text-base">⭐</span> Rating
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <StarInput
                      value={Number(form.rating)}
                      onChange={(v) => setForm((f) => ({ ...f, rating: String(v) }))}
                    />
                    <div className="ml-auto bg-white border-2 border-amber-300 text-amber-600 font-black text-lg px-3 py-1 rounded-xl shadow-sm">
                      {form.rating}/5
                    </div>
                  </div>
                </div>

                {/* ── Review Text ─────────────────────────────────────── */}
                <div>
                  <label
                    htmlFor="review-text"
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    <span className="text-base">💬</span> Review Text
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="review-text"
                    value={form.text}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, text: e.target.value }))
                    }
                    placeholder="Write the customer review here…"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 resize-none bg-white leading-relaxed"
                  />
                  {/* Character count + progress bar */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden mr-3">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((form.text.length / 500) * 100, 100)}%`,
                          background: form.text.length > 450
                            ? "#ef4444"
                            : form.text.length > 200
                            ? "#f59e0b"
                            : "#B91C1C",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 flex-shrink-0">
                      {form.text.length} chars
                    </span>
                  </div>
                </div>

                {/* ── Visibility Card ─────────────────────────────────── */}
                <div
                  className="flex items-center gap-3 px-4 py-3 h-14 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setForm((f) => ({ ...f, isVisible: !f.isVisible }))}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${form.isVisible ? 'bg-green-500' : 'bg-gray-300'}`}>
                    ✓
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-900 leading-tight">Visible on Website</p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {form.isVisible
                        ? "Customers can see this review"
                        : "Review is private and not shown"}
                    </p>
                  </div>
                </div>

              </div>

              {/* ── Action Buttons ──────────────────────────────────── */}
              <div className="flex gap-4 pt-6 mt-2 border-t border-gray-100 px-5 sm:px-8 pb-5 sm:pb-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-review"
                  disabled={saving}
                  className="flex-1 px-4 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-bold shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 uppercase"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : editingId ? (
                    "Save Review"
                  ) : (
                    "Create Review"
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
          aria-labelledby="delete-review-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-red-50 to-red-100 px-8 py-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-red-100 border-4 border-red-200 rounded-2xl flex items-center justify-center text-3xl">
                🗑️
              </div>
              <div className="text-center">
                <h2
                  id="delete-review-title"
                  className="text-xl font-black text-gray-900"
                >
                  Delete Review?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Review by{" "}
                  <strong className="text-gray-800">{deleteTarget.name}</strong>{" "}
                  from <em>{deleteTarget.location}</em> will be permanently removed.
                </p>
              </div>
            </div>

            <div className="p-6">
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
                  id="btn-confirm-delete-review"
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
        </div>
      )}
    </div>
  );
}
