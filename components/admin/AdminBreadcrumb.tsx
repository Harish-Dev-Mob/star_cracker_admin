"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Maps path segments to readable labels */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Dashboard",
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  stocks: "Stocks",
  categories: "Categories",
  customers: "Customers",
  coupons: "Coupons",
  banners: "Banners",
  reviews: "Reviews",
  "delivery-zones": "Delivery Zones",
  "pickup-locations": "Pickup Locations",
  settings: "Settings",
  profile: "Profile",
  combos: "Combos",
};

function toLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function AdminBreadcrumb() {
  const pathname = usePathname();

  // Build crumbs from URL segments, starting after /admin
  const segments = pathname.split("/").filter(Boolean); // e.g. ["admin","customers","abc123"]

  type Crumb = { label: string; href: string; isLast: boolean };
  const crumbs: Crumb[] = [];

  // Always start with "Dashboard"
  crumbs.push({ label: "Dashboard", href: "/admin/dashboard", isLast: false });

  // Walk segments after "admin"
  const afterAdmin = segments.slice(1); // drop "admin"
  let builtHref = "/admin";

  afterAdmin.forEach((seg, i) => {
    builtHref += `/${seg}`;
    const isLast = i === afterAdmin.length - 1;
    const isId = seg.length > 20 || /^[a-z0-9]{20,}$/i.test(seg); // detect cuid/uuid segments

    if (isId) {
      crumbs.push({ label: `#${seg.slice(-8).toUpperCase()}`, href: builtHref, isLast });
    } else if (seg !== "dashboard") {
      crumbs.push({ label: toLabel(seg), href: builtHref, isLast });
    } else {
      // If it IS dashboard, update the first crumb to be "last"
      crumbs[0].isLast = true;
    }
  });

  // If only on /admin/dashboard, make Dashboard the last item
  if (crumbs.length === 1) crumbs[0].isLast = true;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 flex-wrap"
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {/* Separator */}
          {i > 0 && (
            <span className="text-gray-300 font-medium select-none mx-0.5">
              /
            </span>
          )}

          {crumb.isLast ? (
            /* Current page — bold + primary color */
            <span className="text-sm font-bold text-[var(--color-primary)]">
              {crumb.label}
            </span>
          ) : (
            /* Ancestor — muted, clickable */
            <Link
              href={crumb.href}
              className="text-sm font-medium text-gray-400 hover:text-[var(--color-primary)] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
