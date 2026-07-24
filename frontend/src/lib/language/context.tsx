"use client";

import type { SupportedLanguage } from "@/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl: boolean;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "da", name: "Dansk",   nativeName: "Dansk",       rtl: false },
  { code: "en", name: "Engelsk", nativeName: "English",     rtl: false },
  { code: "ar", name: "Arabisk", nativeName: "العربية",     rtl: true  },
  { code: "tr", name: "Tyrkisk", nativeName: "Türkçe",      rtl: false },
  { code: "uk", name: "Ukrainsk",nativeName: "Українська",  rtl: false },
  { code: "th", name: "Thai",    nativeName: "ภาษาไทย",     rtl: false },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog",     rtl: false },
  { code: "fa", name: "Persisk", nativeName: "فارسی",       rtl: true  },
];

const STORAGE_KEY = "medborger_translation_lang";

interface LanguageContextValue {
  secondLang: SupportedLanguage | null;
  setSecondLang: (lang: SupportedLanguage | null) => void;
  langInfo: LanguageInfo | null;
}

const LanguageContext = createContext<LanguageContextValue>({
  secondLang: null,
  setSecondLang: () => {},
  langInfo: null,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [secondLang, setSecondLangState] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (stored && stored !== "da") setSecondLangState(stored);
  }, []);

  const setSecondLang = useCallback((lang: SupportedLanguage | null) => {
    setSecondLangState(lang);
    if (lang) localStorage.setItem(STORAGE_KEY, lang);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const langInfo = secondLang ? LANGUAGES.find((l) => l.code === secondLang) ?? null : null;

  return (
    <LanguageContext.Provider value={{ secondLang, setSecondLang, langInfo }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
