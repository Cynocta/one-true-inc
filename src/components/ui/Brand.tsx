import type { Brand } from "@/types";
import s from "./ui.module.css";

/** Símbolo "1" isométrico del logo One True (también se usa como favicon). */
export const LOGO_MARK_PATHS = [
  "M198 383C262 370 330 305 343 232L440 198 505 236 403 270C390 352 335 420 268 440V530L198 493Z",
  "M268 530 338 508V690C338 735 316 760 290 770L268 778V862L198 826V734L238 719C258 711 268 695 268 678Z",
];

/**
 * Logo One True en SVG, reconstruido del logo oficial (texto en Montserrat Black inclinado).
 * Usa `currentColor`: blanco sobre fondos oscuros, negro sobre claros.
 * Cuando el cliente entregue el SVG original, reemplazar el contenido del <svg>.
 */
export function Logo({ size = "md", round = false, markOnly = false }: { size?: "sm" | "md" | "lg"; round?: boolean; markOnly?: boolean }) {
  return (
    <span className={`${s.logo} ${s[size]} ${round ? s.round : ""}`}>
      <svg viewBox={markOnly ? "180 185 340 690" : "180 185 730 690"} role="img" aria-label="One True" fill="currentColor">
        {LOGO_MARK_PATHS.map((d) => <path key={d} d={d} />)}
        {!markOnly && (
          <>
            <g transform="skewY(-20)" style={{ fontFamily: "var(--font-logo), 'Montserrat', sans-serif", fontWeight: 900 }}>
              <text x="402" y="634" fontSize="262" textLength="402" lengthAdjust="spacingAndGlyphs">one</text>
              <text x="398" y="922" fontSize="262" textLength="458" lengthAdjust="spacingAndGlyphs">true</text>
            </g>
            <g transform="translate(876 472)">
              <circle r="17" fill="none" stroke="currentColor" strokeWidth="5" />
              <text y="8" textAnchor="middle" fontSize="22" fontWeight="900" style={{ fontFamily: "var(--font-logo), sans-serif" }}>R</text>
            </g>
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
