import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "discount"
  | "stock-in"
  | "stock-low"
  | "stock-out"
  | "status-placed"
  | "status-confirmed"
  | "status-packed"
  | "status-shipped"
  | "status-delivered"
  | "status-cancelled"
  | "combo"
  | "featured";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:           "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]",
  success:           "bg-green-100 text-green-800",
  error:             "bg-red-100 text-red-700",
  warning:           "bg-amber-100 text-amber-800",
  info:              "bg-blue-100 text-blue-800",
  discount:          "bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] font-bold",
  "stock-in":        "bg-green-100 text-green-800",
  "stock-low":       "bg-amber-100 text-amber-800",
  "stock-out":       "bg-red-100 text-red-700",
  "status-placed":   "bg-blue-100 text-blue-800",
  "status-confirmed":"bg-indigo-100 text-indigo-800",
  "status-packed":   "bg-purple-100 text-purple-800",
  "status-shipped":  "bg-orange-100 text-orange-800",
  "status-delivered":"bg-green-100 text-green-800",
  "status-cancelled":"bg-red-100 text-red-700",
  combo:             "bg-[var(--color-primary)] text-white",
  featured:          "bg-[var(--color-accent)] text-[var(--color-primary-dark)]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={cn("badge", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

/** Map OrderStatus → BadgeVariant */
export function getStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    PLACED:    "status-placed",
    CONFIRMED: "status-confirmed",
    PACKED:    "status-packed",
    SHIPPED:   "status-shipped",
    DELIVERED: "status-delivered",
    CANCELLED: "status-cancelled",
  };
  return map[status] ?? "default";
}

/** Map stock count → BadgeVariant */
export function getStockVariant(stock: number): BadgeVariant {
  if (stock === 0) return "stock-out";
  if (stock <= 10) return "stock-low";
  return "stock-in";
}
