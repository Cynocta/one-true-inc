import type { CSSProperties } from "react";
import { FighterArt } from "@/components/fighters/FighterArt";
import type { Fighter } from "@/types";
import s from "./ui.module.css";

/**
 * Placeholder de foto/video: fondo de arena + ilustración de peleador(es).
 * Cuando haya imagen real, pasar `src` y se muestra en su lugar.
 */
export function Media({ fighters = [], label, src, glow, className = "" }: { fighters?: Fighter[]; label?: string; src?: string; glow?: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${s.media} ${className}`} style={{ objectFit: "cover", width: "100%", height: "100%" }} loading="lazy" />;
  }
  return (
    <div className={`${s.media} ${className}`} style={glow ? ({ "--glow": glow } as CSSProperties) : undefined}>
      <div className={`${s.mediaBg} media-bg`} />
      {fighters.length === 1 && (
        <div className={`${s.mediaFighter} media-fighter`}>
          <FighterArt fighter={fighters[0]} corner="red" />
        </div>
      )}
      {fighters.length > 1 && (
        <div className={`${s.mediaPair} media-fighter`}>
          <FighterArt fighter={fighters[0]} corner="red" />
          <FighterArt fighter={fighters[1]} corner="blue" flip />
        </div>
      )}
      {label && <span className={s.mediaLabel}>{label}</span>}
    </div>
  );
}
