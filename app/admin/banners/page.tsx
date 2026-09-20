"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface FormState {
  title: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: string;
  isActive: boolean;
}

interface TopBannerState {
  topBannerEnabled: string;
  topBannerText: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  sortOrder: "0",
  isActive: true,
};

// ─── Tiny Toggle ───────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: () => void;
  id: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
        checked ? "bg-[var(--color-primary)]" : "bg-gray-200"
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Image Preview ─────────────────────────────────────────────────────────────

function ImagePreview({ url }: { url: string }) {
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const checkImage = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!url.trim()) {
        setValid(false);
        return;
      }
      setLoading(true);
      setValid(false);
      const img = new window.Image();
      img.onload = () => { if (active) { setValid(true); setLoading(false); } };
      img.onerror = () => { if (active) { setValid(false); setLoading(false); } };
      img.src = url;
    };
    checkImage();
    return () => { active = false; };
  }, [url]);

  if (!url.trim()) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
      {loading && (
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
        </div>
      )}
      {!loading && valid && (
        <div className="relative h-40 w-full">
          <Image
            src={url}
            alt="Banner preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="absolute bottom-2 left-3 text-white text-xs font-bold bg-black/40 px-2 py-0.5 rounded-md">
            Preview
          </span>
        </div>
      )}
      {!loading && !valid && (
        <div className="h-20 flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
          <span>⚠️</span> Invalid or inaccessible URL
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Top Banner (Promo Bar)
  const [topBanner, setTopBanner] = useState<TopBannerState>({
    topBannerEnabled: "true",
    topBannerText: "Festival Sale is LIVE! Up to 40% OFF on all Crackers",
  });
  const [topBannerLoading, setTopBannerLoading] = useState(true);
  const [topBannerSaving, setTopBannerSaving] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (!res.ok) throw new Error();
      setBanners(await res.json());
    } catch {
      setError("Could not load banners. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // ─── Fetch Top Banner Settings ────────────────────────────────────────────

  useEffect(() => {
    const fetchTopBanner = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data = await res.json();
        setTopBanner({
          topBannerEnabled: data.topBannerEnabled ?? "true",
          topBannerText: data.topBannerText ?? "Festival Sale is LIVE! Up to 40% OFF on all Crackers",
        });
      } catch {
        /* silent */
      } finally {
        setTopBannerLoading(false);
      }
    };
    fetchTopBanner();
  }, []);

  // ─── Save Top Banner ──────────────────────────────────────────────────────

  const handleSaveTopBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopBannerSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topBanner),
      });
      if (!res.ok) throw new Error();
      toast.success("Top banner saved successfully!");
    } catch {
      toast.error("Failed to save top banner.");
    } finally {
      setTopBannerSaving(false);
    }
  };

  // ─── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "",
      sortOrder: String(b.sortOrder),
      isActive: b.isActive,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setFormError(""); };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Something went wrong."); return; }

      if (editingId) {
        setBanners((prev) => prev.map((b) => (b.id === editingId ? data : b)));
      } else {
        setBanners((prev) =>
          [...prev, data].sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }
      closeModal();
      toast.success(editingId ? "Banner updated!" : "Banner created!");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Could not delete banner.");
        return;
      }
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Toggle active ────────────────────────────────────────────────────────

  const toggleActive = async (b: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, isActive: !b.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners((prev) => prev.map((item) => (item.id === b.id ? updated : item)));
      }
    } catch { /* silent */ }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-100 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
            Banners Management
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage the top promo bar and showcase advertisement banners on the homepage.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: Top Banner / Promo Bar
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-lg">📣</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Top Banner — Promo Bar</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                The announcement strip shown at the very top of every page
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className={`w-2 h-2 rounded-full ${topBanner.topBannerEnabled === "true" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
            {topBanner.topBannerEnabled === "true" ? "Visible on site" : "Hidden"}
          </div>
        </div>

        {/* Live Preview */}
        <div className="px-8 pt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Preview</p>
          <div className={`rounded-xl overflow-hidden transition-all duration-300 ${topBanner.topBannerEnabled !== "true" ? "opacity-40 grayscale" : ""}`}>
            <div className="bg-gradient-to-r from-orange-500 via-red-600 to-orange-500 text-white text-xs font-bold tracking-widest py-2.5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 bg-[length:20px_20px] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)]" />
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase">
                <span className="text-sm">✨</span>
                {topBanner.topBannerText || "Your promo text will appear here…"}
                <span className="text-sm">✨</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        {topBannerLoading ? (
          <div className="px-8 py-8 flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading settings…</span>
          </div>
        ) : (
          <form onSubmit={handleSaveTopBanner} className="px-8 py-6 space-y-5">
            {/* Enable / Disable */}
            <div
              onClick={() =>
                setTopBanner((prev) => ({
                  ...prev,
                  topBannerEnabled: prev.topBannerEnabled === "true" ? "false" : "true",
                }))
              }
              className="flex items-center justify-between px-5 py-4 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-gray-900">Show Top Banner</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Toggle the promotional announcement strip at the top of every page
                </p>
              </div>
              <Toggle
                id="top-banner-enabled"
                checked={topBanner.topBannerEnabled === "true"}
                onChange={() =>
                  setTopBanner((prev) => ({
                    ...prev,
                    topBannerEnabled: prev.topBannerEnabled === "true" ? "false" : "true",
                  }))
                }
              />
            </div>

            {/* Banner Text */}
            <div>
              <label
                htmlFor="top-banner-text"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              >
                <span>💬</span> Banner Text <span className="text-red-500">*</span>
              </label>
              <input
                id="top-banner-text"
                type="text"
                value={topBanner.topBannerText}
                onChange={(e) =>
                  setTopBanner((prev) => ({ ...prev, topBannerText: e.target.value }))
                }
                placeholder="e.g. Festival Sale is LIVE! Up to 40% OFF on all Crackers"
                required
                className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 bg-white"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Keep it short and punchy — displayed across the full width of the site.
              </p>
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2 border-t border-gray-50">
              <button
                type="submit"
                id="btn-save-top-banner"
                disabled={topBannerSaving}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {topBannerSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <><span>💾</span> Save Top Banner</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: Showcase Advertisement Banners (Carousel)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-lg">🖼️</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Showcase Advertisement Banners</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                The full-width image carousel shown on the homepage
              </p>
            </div>
          </div>
          <button
            id="btn-add-banner"
            onClick={openCreate}
            className="shrink-0 bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(192,38,211,0.35)] hover:shadow-[0_6px_20px_rgba(192,38,211,0.45)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="text-base">+</span> Add Banner
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4 px-8 py-5 border-b border-gray-50">
            {[
              { label: "Total", value: banners.length, color: "text-gray-900" },
              { label: "Active", value: banners.filter((b) => b.isActive).length, color: "text-green-600" },
              { label: "Inactive", value: banners.filter((b) => !b.isActive).length, color: "text-gray-400" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-2">
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Banner content */}
        <div className="px-8 py-6">
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading banners…</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <span className="text-6xl">🖼️</span>
          <p className="text-gray-400 font-medium">No showcase banners yet.</p>
          <button
            onClick={openCreate}
            className="mt-2 text-fuchsia-600 font-bold text-sm hover:underline"
          >
            + Add your first showcase banner
          </button>
        </div>
      ) : (
        <>
          {/* ── Card Grid ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/6" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='300' viewBox='0 0 800 300'%3E%3Crect fill='%23f3f4f6' width='800' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3E🖼️ Image not available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Sort order badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-lg border border-white/20">
                    <span className="opacity-70">#</span>{banner.sortOrder}
                  </div>

                  {/* Status toggle badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      id={`toggle-banner-${banner.id}`}
                      onClick={() => toggleActive(banner)}
                      title="Click to toggle status"
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 shadow-md backdrop-blur-sm ${
                        banner.isActive
                          ? "bg-green-500/90 text-white border-green-400"
                          : "bg-gray-800/70 text-gray-300 border-gray-600"
                      }`}
                    >
                      {banner.isActive ? "● Active" : "○ Inactive"}
                    </button>
                  </div>

                  {/* Index badge bottom-right */}
                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 truncate text-sm leading-snug">{banner.title}</p>
                    {banner.linkUrl ? (
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 font-semibold mt-1 block truncate transition-colors"
                      >
                        🔗 {banner.linkUrl}
                      </a>
                    ) : (
                      <p className="text-xs text-gray-300 font-medium mt-1">No link</p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      id={`btn-edit-banner-${banner.id}`}
                      onClick={() => openEdit(banner)}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:text-amber-700"
                    >
                      Edit
                    </button>
                    <button
                      id={`btn-delete-banner-${banner.id}`}
                      onClick={() => { setDeleteTarget(banner); setDeleteError(""); }}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Table (compact, for reference) ─────────────────────────────── */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
              <span className="text-sm font-black text-gray-700">All Showcase Banners</span>
              <span className="text-xs text-gray-400 font-medium">— sorted by order</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider w-40">Preview</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Title / Link</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center w-20">Order</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center w-28">Status</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-fuchsia-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="relative h-14 w-28 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{banner.title}</p>
                        {banner.linkUrl ? (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:text-blue-700 font-semibold mt-0.5 transition-colors truncate block max-w-xs"
                          >
                            {banner.linkUrl}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 font-medium">No link</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-gray-500">
                        {banner.sortOrder}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActive(banner)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 cursor-pointer ${
                            banner.isActive
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(banner)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(banner); setDeleteError(""); }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Create / Edit Showcase Banner Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="banner-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md animate-fade-in"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-pop-in">

            {/* ── Header ────────────────────────────────────── */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2
                id="banner-modal-title"
                className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2"
              >
                {editingId ? "✏️ Edit Showcase Banner" : "🖼️ Add Showcase Banner"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-lg font-medium transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* ── Scrollable Form Body ──────────────────────────────── */}
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">

                {/* Error Banner */}
                {formError && (
                  <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <span>⚠️</span> {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="banner-title" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <span>🏷️</span> Banner Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="banner-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Diwali Sale — Up to 40% Off"
                    required
                    className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 bg-white"
                  />
                </div>

                {/* Image URL + Live Preview */}
                <div>
                  <label htmlFor="banner-image" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <span>🖼️</span> Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="banner-image"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    required
                    className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 bg-white"
                  />
                  <ImagePreview url={form.imageUrl} />
                </div>

                {/* Link URL */}
                <div>
                  <label htmlFor="banner-link" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <span>🔗</span> Link URL
                    <span className="text-gray-400 font-normal normal-case text-[10px] ml-1">(optional)</span>
                  </label>
                  <input
                    id="banner-link"
                    type="url"
                    value={form.linkUrl}
                    onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="https://yoursite.com/shop/sale"
                    className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all placeholder:text-gray-400 bg-white"
                  />
                  <p className="mt-1.5 text-xs text-gray-400">Where clicking the banner takes the user.</p>
                </div>

                {/* Sort Order + Status row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Sort Order */}
                  <div>
                    <label htmlFor="banner-order" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      <span>🔢</span> Sort Order
                    </label>
                    <input
                      id="banner-order"
                      type="number"
                      min={0}
                      value={form.sortOrder}
                      onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                      className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.12)] transition-all bg-white"
                    />
                    <p className="mt-1.5 text-xs text-gray-400">Lower = shown first.</p>
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
                      <p className="text-[10px] text-gray-500 leading-tight">Customers can see this banner</p>
                    </div>
                  </div>
                </div>
                </div>

              </div>

              {/* Action buttons */}
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
                  id="btn-save-banner"
                  disabled={saving}
                  className="flex-1 px-4 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white text-sm font-bold shadow-[0_4px_14px_rgba(192,38,211,0.4)] hover:shadow-[0_6px_20px_rgba(192,38,211,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 uppercase"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : editingId ? (
                    "Save Banner"
                  ) : (
                    "Create Banner"
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
          aria-labelledby="delete-banner-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-pop-in overflow-hidden">
            {/* Banner thumbnail in modal */}
            <div className="relative h-36 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deleteTarget.imageUrl}
                alt={deleteTarget.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-4xl">🗑️</span>
              </div>
            </div>
            <div className="p-8 text-center">
              <h2 id="delete-banner-title" className="text-xl font-black text-gray-900 mb-2">
                Delete Showcase Banner?
              </h2>
              <p className="text-sm text-gray-500 mb-1">You&apos;re about to permanently delete:</p>
              <p className="text-base font-bold text-gray-800 mb-6">&ldquo;{deleteTarget.title}&rdquo;</p>

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
                  id="btn-confirm-delete-banner"
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
