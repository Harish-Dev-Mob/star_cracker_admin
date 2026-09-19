"use client";

import { useI18n } from "@/store/useI18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-3 py-1 text-xs font-bold rounded-full transition-all duration-200",
          language === "en"
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ta")}
        className={cn(
          "px-3 py-1 text-xs font-bold rounded-full transition-all duration-200",
          language === "ta"
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        )}
      >
        தமிழ்
      </button>
    </div>
  );
}
