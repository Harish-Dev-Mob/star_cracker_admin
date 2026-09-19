import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names intelligently.
 * Resolves conflicts (e.g. p-4 + p-2 → p-2) and filters falsy values.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", "text-sm")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
