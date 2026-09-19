"use client";

import { useTranslation } from "@/store/useI18n";

export function TranslatedText({ id }: { id: string }) {
  const { t } = useTranslation();
  
  // Very simple path resolver
  const getTranslation = (path: string, obj: any) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  return <>{getTranslation(id, t) || id}</>;
}
