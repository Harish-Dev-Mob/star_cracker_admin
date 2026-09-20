"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/constants";
import { useState, useEffect } from "react";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/products", label: "Products", icon: "🎆" },
  { href: "/admin/stocks", label: "Stocks", icon: "📈" },
  { href: "/admin/categories", label: "Categories", icon: "📁" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/coupons", label: "Coupons", icon: "🎟️" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/delivery-zones", label: "Delivery", icon: "🚚" },
  { href: "/admin/pickup-locations", label: "Pickups", icon: "🏪" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {ADMIN_NAV.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-primary)] text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileMenuButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Open navigation menu"
      className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors gap-[5px]"
    >
      <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
      <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
      <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
    </button>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[var(--color-border)] flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)] shrink-0">
          <Link
            href="/admin/dashboard"
            className="font-display font-bold text-lg text-[var(--color-primary-dark)]"
          >
            {SITE_NAME} Admin
          </Link>
        </div>
        <NavLinks />
      </aside>

      {/* ── Mobile Header Bar ───────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 shadow-sm">
        <Link
          href="/admin/dashboard"
          className="font-display font-bold text-base text-[var(--color-primary-dark)]"
        >
          {SITE_NAME} Admin
        </Link>
        <MobileMenuButton onClick={() => setMobileOpen(true)} />
      </div>

      {/* ── Mobile Drawer Overlay ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-slide-in-left">
            <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--color-border)] shrink-0">
              <Link
                href="/admin/dashboard"
                className="font-display font-bold text-base text-[var(--color-primary-dark)]"
                onClick={() => setMobileOpen(false)}
              >
                {SITE_NAME} Admin
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <NavLinks onLinkClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
