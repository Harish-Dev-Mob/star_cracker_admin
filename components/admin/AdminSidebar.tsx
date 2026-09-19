"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/constants";

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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[var(--color-border)] flex flex-col hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)] shrink-0">
        <Link href="/admin/dashboard" className="font-display font-bold text-lg text-[var(--color-primary-dark)]">
          {SITE_NAME} Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {ADMIN_NAV.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${isActive
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
      {/* <div className="p-4 border-t border-[var(--color-border)]">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-[var(--radius-md)] transition-colors"
        >
          <span>🏠</span> Back to Store
        </Link>
      </div> */}
    </aside>
  );
}
