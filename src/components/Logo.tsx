import { LOGO_MARK, LOGO_MARK_VIEWBOX, LOGO_REG, LOGO_TEXT, LOGO_VIEWBOX, WORDMARK_REG, WORDMARK_TEXT, WORDMARK_VIEWBOX } from "./logo-paths";

/** Wordmark horizontal oficial "onetrue®" (`currentColor`). Para espacios anchos y bajos. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox={WORDMARK_VIEWBOX} role="img" aria-label="One True" fill="currentColor" fillRule="evenodd">
      <path d={WORDMARK_TEXT} />
      <path d={WORDMARK_REG} />
    </svg>
  );
}

/** Logo oficial One True en SVG (`currentColor`). `markOnly` muestra solo el símbolo "1". */
export function Logo({ className = "", markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <svg className={className} viewBox={markOnly ? LOGO_MARK_VIEWBOX : LOGO_VIEWBOX} role="img" aria-label="One True" fill="currentColor" fillRule="evenodd">
      <path d={LOGO_MARK} />
      {!markOnly && (
        <>
          <path d={LOGO_TEXT} />
          <path d={LOGO_REG} />
        </>
      )}
    </svg>
  );
}
