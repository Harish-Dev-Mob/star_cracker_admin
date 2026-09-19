/**
 * Format a price number to Indian Rupee currency string.
 * Example: formatPrice(1499) → "₹1,499"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate the discount percentage between original and discounted price.
 * Example: getDiscountPercent(1000, 750) → 25
 */
export function getDiscountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

/**
 * Slugify a string.
 * Example: slugify("Ground Spinner 500") → "ground-spinner-500"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}
