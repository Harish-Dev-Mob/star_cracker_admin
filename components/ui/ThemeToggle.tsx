"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full border border-gray-200 bg-white" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex items-center justify-center h-10 w-10 rounded-full border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
        isDark
          ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-700"
          : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300"
      )}
      aria-label="Toggle theme"
    >
      <span className="text-lg group-hover:scale-110 transition-transform">
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
