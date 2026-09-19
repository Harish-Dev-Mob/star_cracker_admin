// ─── Site Metadata ────────────────────────────────────────────────────────────
export const SITE_NAME = "Star Cracker";
export const SITE_TAGLINE = "Light Up Every Celebration";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_DESCRIPTION =
  "Premium quality firecrackers and sparklers for every festival and celebration. Explore our wide collection of safe and vibrant fireworks.";

// ─── Navigation Links ─────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

// ─── Product Categories ───────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  { id: "sparklers", label: "Sparklers", icon: "✨" },
  { id: "rockets", label: "Rockets", icon: "🚀" },
  { id: "fountains", label: "Fountains", icon: "⛲" },
  { id: "ground-spinners", label: "Ground Spinners", icon: "🌀" },
  { id: "aerial-shells", label: "Aerial Shells", icon: "💥" },
  { id: "novelties", label: "Novelties", icon: "🎁" },

  { id: "combo-packs", label: "Combo Packs", icon: "📦" },
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PRODUCTS_PER_PAGE = 12;

// ─── Contact ──────────────────────────────────────────────────────────────────
export const CONTACT_INFO = {
  phone: "+91 98765 43210",
  email: "info@starcracker.com",
  address: "123 Festival Lane, Sivakasi, Tamil Nadu - 626123",
  hours: "Mon–Sat: 9AM – 8PM",
} as const;

// ─── Social Links ─────────────────────────────────────────────────────────────
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/firecrackerstore",
  instagram: "https://instagram.com/firecrackerstore",
  whatsapp: "https://wa.me/919876543210",
  youtube: "https://youtube.com/firecrackerstore",
} as const;
