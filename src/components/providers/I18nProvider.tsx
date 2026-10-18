"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "@/i18n/config";
import { translator, type DictKey } from "@/i18n";

interface Ctx {
  lang: Lang;
  t: (key: DictKey) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: translator(lang) }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
