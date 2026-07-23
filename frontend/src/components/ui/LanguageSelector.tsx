"use client";

import { LANGUAGES, useLanguage } from "@/lib/language/context";
import type { SupportedLanguage } from "@/types";

export function LanguageSelector() {
  const { secondLang, setSecondLang } = useLanguage();

  return (
    <select
      value={secondLang ?? ""}
      onChange={(e) => setSecondLang((e.target.value as SupportedLanguage) || null)}
      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
      title="Vis oversættelse"
      aria-label="Vælg oversættelsessprog"
    >
      <option value="">🌐 Oversæt</option>
      {LANGUAGES.filter((l) => l.code !== "da").map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName}
        </option>
      ))}
    </select>
  );
}
