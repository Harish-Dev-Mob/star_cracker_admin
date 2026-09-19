"use client";

import { create } from "zustand";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// ─── Toast Store ─────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).slice(2) },
      ],
    })),
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// ─── Convenience helpers ──────────────────────────────────────────────────────
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "success", title, message, duration: 4000 }),
  error: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "error", title, message, duration: 6000 }),
  info: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "info", title, message, duration: 4000 }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "warning", title, message, duration: 5000 }),
};

// ─── Individual Toast Item ────────────────────────────────────────────────────
const typeConfig: Record<ToastType, { icon: string; classes: string }> = {
  success: { icon: "✓", classes: "border-green-400 bg-green-50 text-green-900" },
  error:   { icon: "✕", classes: "border-red-400 bg-red-50 text-red-900" },
  info:    { icon: "ℹ", classes: "border-blue-400 bg-blue-50 text-blue-900" },
  warning: { icon: "⚠", classes: "border-amber-400 bg-amber-50 text-amber-900" },
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const config = typeConfig[t.type];

  useEffect(() => {
    const timer = setTimeout(() => remove(t.id), t.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, remove]);

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 w-80 p-4 rounded-[var(--radius-lg)]",
        "border-l-4 shadow-[var(--shadow-md)] animate-slide-up",
        "bg-white",
        config.classes
      )}
    >
      <span className="text-lg font-bold shrink-0 mt-0.5">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{t.title}</p>
        {t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}
      </div>
      <button
        onClick={() => remove(t.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-sm"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
