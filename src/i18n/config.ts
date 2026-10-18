export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";

export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);
