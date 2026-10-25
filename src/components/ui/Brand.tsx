import type { Brand } from "@/types";
import { LOGO_MARK, LOGO_MARK_VIEWBOX, LOGO_REG, LOGO_TEXT, LOGO_VIEWBOX, WORDMARK_REG, WORDMARK_TEXT, WORDMARK_VIEWBOX } from "./logo-paths";
import s from "./ui.module.css";

export { LOGO_MARK } from "./logo-paths";

/** Wordmark horizontal oficial "onetrue®" (`currentColor`). Para espacios anchos y bajos. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox={WORDMARK_VIEWBOX} role="img" aria-label="One True" fill="currentColor" fillRule="evenodd">
      <path d={WORDMARK_TEXT} />
      <path d={WORDMARK_REG} />
    </svg>
  );
}

/**
 * Logo oficial One True en SVG, vectorizado del archivo original (ver logo-paths.ts).
 * Usa `currentColor`: blanco sobre fondos oscuros, negro sobre claros.
 */
export function Logo({ size = "md", round = false, markOnly = false }: { size?: "sm" | "md" | "lg"; round?: boolean; markOnly?: boolean }) {
  return (
    <span className={`${s.logo} ${s[size]} ${round ? s.round : ""}`}>
      <svg viewBox={markOnly ? LOGO_MARK_VIEWBOX : LOGO_VIEWBOX} role="img" aria-label="One True" fill="currentColor" fillRule="evenodd">
        <path d={LOGO_MARK} />
        {!markOnly && (
          <>
            <path d={LOGO_TEXT} />
            <path d={LOGO_REG} />
          </>
        )}
      </svg>
    </span>
  );
}

export function BrandBadge({ brand, large = false }: { brand: Brand; large?: boolean }) {
  const tk = brand === "trueknuckles";
  return (
    <span className={`${s.badge} ${tk ? s.tk : s.tb} ${large ? s.badgeLg : ""}`}>
      True<b>{tk ? "Knuckles" : "Boxing"}</b>
    </span>
  );
}
