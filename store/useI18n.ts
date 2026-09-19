import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from '@/locales/en';
import { ta } from '@/locales/ta';

export type Language = 'en' | 'ta';
type Translations = typeof en;

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'i18n-storage',
    }
  )
);

const translations: Record<Language, Translations> = {
  en,
  ta,
};

// Helper hook to get the translation object directly
export const useTranslation = () => {
  const language = useI18n((state) => state.language);
  return {
    t: translations[language],
    language,
  };
};
