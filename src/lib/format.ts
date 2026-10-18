import type { Lang } from "@/i18n/config";
import type { L10n } from "@/types";

const locale = (lang: Lang) => (lang === "en" ? "en-US" : "es-CO");

export const tx = (v: L10n | string | undefined, lang: Lang) => (v == null ? "" : typeof v === "string" ? v : v[lang] ?? v.es);

export function fmtDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso).toLocaleDateString(locale(lang), { timeZone: "America/Bogota", ...opts }).replace(/\./g, "");
}

export function fmtTime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleTimeString(locale(lang), { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }) + " COT";
}

export const fmtMoney = (n: number) => "$" + n.toLocaleString("es-CO") + " COP";

export const href = (lang: Lang, path = "") => `/${lang}${path ? "/" + path.replace(/^\//, "") : ""}/`.replace(/\/+$/, "/");
