"use client";

/**
 * Mapa interactivo del recinto: zonas por color, ring con reflectores,
 * sillas ringside y palcos seleccionables uno a uno.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { LOGO_MARK } from "@/components/ui/Brand";
import { TICKETS, zonePrice } from "@/data/site";
import { fmtMoney, tx } from "@/lib/format";
import { AREAS, availability, SOLD, UNITS, type Unit } from "./venue";
import s from "./venue.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const RING = { x: 425, y: 205, w: 150, h: 150 };
const RC = { x: RING.x + RING.w / 2, y: RING.y + RING.h / 2 };

/** Retardo de entrada según la distancia al ring: el mapa "se enciende" desde el centro */
const delayFor = (x: number, y: number) => 0.35 + Math.hypot(x - RC.x, y - RC.y) / 900;

interface Props {
  zone: string | null;
  onZone?: (id: string) => void;
  units?: string[];
  onUnit?: (id: string) => void;
  interactive?: boolean;
  /** Unidades vendidas a mostrar (por defecto, las de ejemplo de venue.ts) */
  sold?: Set<string>;
  /** Unidades bloqueadas por el organizador (no se venden) */
  blocked?: Set<string>;
}

export function VenueMap({ zone, onZone, units = [], onUnit, interactive = true, sold: soldProp, blocked }: Props) {
  const soldSet = soldProp ?? SOLD;
  const { lang } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState({ x: 0, y: 0 });
  const focus = hover ?? zone;
  const selected = new Set(units);

  const zoneById = useMemo(() => Object.fromEntries(TICKETS.map((z) => [z.id, z])), []);
  const color = (id: string) => zoneById[id]?.color ?? "#888";

  const move = (e: MouseEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const zoneProps = (id: string) => ({
    className: `${s.zone} ${focus && focus !== id ? s.dim : ""} ${zone === id ? s.selected : ""} ${interactive ? s.clickable : ""}`,
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(null),
    onClick: () => interactive && onZone?.(id),
    style: { ["--zc" as string]: color(id) },
  });

  const unitClick = (u: Unit) => {
    if (!interactive || soldSet.has(u.id)) return;
    if (zone !== u.zone) onZone?.(u.zone);
    onUnit?.(u.id);
  };

  const hoverZone = hover ? zoneById[hover] : null;
  const hoverAvail = hover ? availability(hover) : null;

  return (
    <div className={s.wrap} ref={wrap} onMouseMove={move}>
      <div className={s.smoke} aria-hidden />
      <div className={s.flashes} aria-hidden>{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</div>

      <svg viewBox="0 0 1000 760" className={s.svg} role="img" aria-label="Mapa del recinto">
        <defs>
          <radialGradient id="vm-floor" cx="50%" cy="38%" r="70%">
            <stop offset="0" stopColor="#24242a" />
            <stop offset="1" stopColor="#0b0b0d" />
          </radialGradient>
          <linearGradient id="vm-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="vm-ringglow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#d7141e" stopOpacity=".55" />
            <stop offset="1" stopColor="#d7141e" stopOpacity="0" />
          </radialGradient>
          <filter id="vm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="vm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.035)" />
          </pattern>
        </defs>

        {/* Piso */}
        <motion.rect x="10" y="10" width="980" height="740" rx="28" fill="url(#vm-floor)" stroke="rgba(255,255,255,.1)" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
        <rect x="10" y="10" width="980" height="740" rx="28" fill="url(#vm-grid)" />

        {/* Tarima */}
        <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: EASE }}>
          <rect x="390" y="26" width="220" height="74" rx="8" fill="#0d0d0f" stroke="#fff" strokeWidth="2" />
          <rect x="400" y="38" width="14" height="44" rx="3" fill="#2a2a30" />
          <rect x="586" y="38" width="14" height="44" rx="3" fill="#2a2a30" />
          <rect x="462" y="36" width="76" height="16" rx="3" fill="#2a2a30" className={s.screen} />
          <text x="500" y="84" className={s.lblStage}>{lang === "en" ? "STAGE" : "TARIMA"}</text>
        </motion.g>

        {/* Áreas por cantidad: General, Preferencial, VIP */}
        {AREAS.map((a, i) => (
          <motion.g key={i} {...zoneProps(a.zone)} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delayFor(a.x + a.w / 2, a.y + a.h / 2), duration: 0.6, ease: EASE }} style={{ ...zoneProps(a.zone).style, transformOrigin: `${a.x + a.w / 2}px ${a.y + a.h / 2}px` }}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="8" className={s.area} />
            {a.label && (
              <text x={a.x + a.w / 2} y={a.y + a.h / 2} className={s.lblArea}
                transform={a.vertical ? `rotate(-90 ${a.x + a.w / 2} ${a.y + a.h / 2})` : undefined}
                style={{ fontSize: a.zone === "preferencial" ? 16 : a.vertical ? 30 : 18 }}>
                {lang === "en" ? a.label.replace("ZONA GENERAL", "GENERAL AREA").replace("PREFERENCIAL", "PREFERRED") : a.label}
              </text>
            )}
          </motion.g>
        ))}

        {/* Barra */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <rect x="455" y="586" width="90" height="68" rx="10" fill="#8d9096" />
          <text x="500" y="626" className={s.lblBar}>{lang === "en" ? "BAR" : "BARRA"}</text>
        </motion.g>

        {/* Franja Platino bajo el arco */}
        <motion.g {...zoneProps("palco-platino")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <path d="M232 470 Q500 528 768 470 L768 552 Q500 590 232 552 Z" className={s.band} />
          <text x="500" y="556" className={s.lblBand}>PLATINO</text>
        </motion.g>

        {/* Palcos y sillas */}
        {UNITS.map((u) => {
          const sold = soldSet.has(u.id);
          const isBlocked = !sold && !!blocked?.has(u.id);
          const on = selected.has(u.id);
          const cx = u.x + u.w / 2, cy = u.y + u.h / 2;
          return (
            <motion.g key={u.id}
              className={`${s.unit} ${focus && focus !== u.zone ? s.dim : ""} ${sold ? s.sold : ""} ${isBlocked ? s.blocked : ""} ${on ? s.unitOn : ""} ${interactive && !sold ? s.clickable : ""}`}
              style={{ ["--zc" as string]: color(u.zone), transformOrigin: `${cx}px ${cy}px` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: on ? [1, 1.35, 1.12] : 1 }}
              transition={{ delay: on ? 0 : delayFor(cx, cy), duration: on ? 0.45 : 0.5, ease: EASE }}
              whileHover={interactive && !sold ? { scale: 1.18 } : undefined}
              onMouseEnter={() => setHover(u.zone)} onMouseLeave={() => setHover(null)}
              onClick={() => unitClick(u)}>
              <g transform={u.rot ? `rotate(${u.rot} ${cx} ${cy})` : undefined}>
                <rect x={u.x} y={u.y} width={u.w} height={u.h} rx={u.zone === "ringside" ? 3 : 6} className={s.unitRect} />
                {u.zone !== "ringside" && <text x={cx} y={cy + (u.h > 50 ? 7 : 6)} className={s.lblUnit} style={{ fontSize: u.w > 100 ? 20 : 17 }}>{u.label}</text>}
                {sold && <path d={`M${u.x + 4} ${u.y + 4}L${u.x + u.w - 4} ${u.y + u.h - 4}M${u.x + u.w - 4} ${u.y + 4}L${u.x + 4} ${u.y + u.h - 4}`} className={s.cross} />}
                {on && u.zone === "ringside" && <path d={`M${u.x + 3.5} ${cy}l3.5 3.5 5-6.5`} className={s.tick} />}
              </g>
            </motion.g>
          );
        })}

        {/* Ring */}
        <g className={`${focus && focus !== "ringside" ? s.dimSoft : ""}`}>
          <motion.circle cx={RC.x} cy={RC.y} r="150" fill="url(#vm-ringglow)" className={s.ringGlow}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} />
          <motion.rect x={RING.x} y={RING.y} width={RING.w} height={RING.h} rx="4" fill="#141418" stroke="#fff" strokeWidth="2"
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: `${RC.x}px ${RC.y}px` }}
            transition={{ duration: 0.7, ease: EASE }} />
          <rect x={RING.x + 14} y={RING.y + 14} width={RING.w - 28} height={RING.h - 28} fill="#0d0d0f" />
          {/* Logo en la lona */}
          <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 12 }}
            style={{ transformOrigin: `${RC.x}px ${RC.y}px` }}>
            <g transform={`translate(${RC.x} ${RC.y}) scale(.036) translate(-664 -1000)`} fill="#fff" className={s.canvasLogo}>
              <path d={LOGO_MARK} />
            </g>
          </motion.g>
          {/* Cuerdas que se dibujan */}
          {[10, 16, 22].map((inset, i) => (
            <motion.rect key={inset} x={RING.x + inset} y={RING.y + inset} width={RING.w - inset * 2} height={RING.h - inset * 2}
              fill="none" stroke={i === 1 ? "#fff" : "#d7141e"} strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.15, duration: 1.1, ease: "easeInOut" }} />
          ))}
          {/* Esquineros */}
          {[[RING.x + 8, RING.y + 8, "#d7141e"], [RING.x + RING.w - 8, RING.y + 8, "#fff"], [RING.x + 8, RING.y + RING.h - 8, "#fff"], [RING.x + RING.w - 8, RING.y + RING.h - 8, "#2c6fd6"]].map(([x, y, c], i) => (
            <motion.circle key={i} cx={x as number} cy={y as number} r="5" fill={c as string} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 + i * 0.08, type: "spring" }} />
          ))}
          {/* Reflectores */}
          <g className={s.beams} aria-hidden>
            <g className={s.beamL}><path d={`M300 30 L${RC.x - 30} ${RC.y + 60} L${RC.x + 50} ${RC.y + 40} Z`} fill="url(#vm-beam)" /></g>
            <g className={s.beamR}><path d={`M700 30 L${RC.x + 30} ${RC.y + 60} L${RC.x - 50} ${RC.y + 40} Z`} fill="url(#vm-beam)" /></g>
          </g>
        </g>

        {/* Entrada */}
        <g className={s.entry}>
          <text x="500" y="706" className={s.lblEntry}>{lang === "en" ? "ENTRANCE" : "ENTRADA"}</text>
          {[0, 1, 2].map((i) => <path key={i} d={`M488 ${716 + i * 9} l12 7 12-7`} className={s.chev} style={{ animationDelay: `${i * 0.18}s` }} />)}
        </g>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoverZone && hoverAvail && (
          <motion.div className={s.tip} style={{ left: tip.x, top: tip.y, ["--zc" as string]: hoverZone.color }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>
            <b>{tx(hoverZone.name, lang)}</b>
            <span>{fmtMoney(zonePrice(hoverZone))}{hoverZone.kind === "box" ? ` · ${hoverZone.persons} ${lang === "en" ? "people" : "personas"}` : ""}</span>
            <small>{hoverAvail.left} {lang === "en" ? "available" : "disponibles"}</small>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Leyenda de colores (también sirve como selector de zona) */
export function VenueLegend({ zone, onZone }: { zone: string | null; onZone?: (id: string) => void }) {
  const { lang } = useI18n();
  return (
    <div className={s.legend}>
      {TICKETS.map((z) => {
        const av = availability(z.id);
        return (
          <motion.button key={z.id} type="button" whileTap={{ scale: 0.97 }} className={`${s.legendItem} ${zone === z.id ? s.legendOn : ""}`} style={{ ["--zc" as string]: z.color }} onClick={() => onZone?.(z.id)}>
            <i />
            <span><b>{tx(z.name, lang)}</b><small>{fmtMoney(zonePrice(z))}{z.kind === "box" ? ` / ${lang === "en" ? "box" : "palco"}` : ""}</small></span>
            <em className={av.left <= 10 ? s.hot : ""}>{av.left}</em>
          </motion.button>
        );
      })}
    </div>
  );
}
