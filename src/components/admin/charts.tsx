"use client";

/**
 * Gráficas del dashboard en SVG puro (sin librerías).
 * Reglas: una sola escala por gráfica, líneas de 2px, barras ≤ 24px con punta redondeada,
 * 2px de separación entre segmentos, textos en tinta neutra (nunca en el color de la serie),
 * leyenda cuando hay ≥ 2 series y tooltip al pasar el mouse.
 */
import { motion } from "framer-motion";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import s from "./admin.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
export const compact = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K` : String(n);
export const cop = (n: number) => "$" + n.toLocaleString("es-CO");
const niceMax = (v: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / p / (v / p > 5 ? 2 : 1)) * p * (v / p > 5 ? 2 : 1);
};

/* ---------------------------------------------------------------- Tooltip */
export function Tip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <div className={s.tip} style={{ left: x, top: y }}>{children}</div>;
}

/* ---------------------------------------------------------------- Sparkline */
export function Sparkline({ values, height = 34 }: { values: number[]; height?: number }) {
  const w = 120, h = height, max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - (v / max) * (h - 6)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={s.spark} aria-hidden>
      <path d={d} fill="none" stroke="var(--deemph)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d={pts.slice(-2).map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")} stroke="var(--series-1)" strokeWidth="2" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="var(--series-1)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}

/* ---------------------------------------------------------------- Serie por día (área + línea) */
export function SalesChart({ data, markers = [], format = (n: number) => n.toLocaleString("es-CO"), axisFormat, unit = "boletas", label = "Boletas vendidas por día" }: {
  data: { date: Date; value: number }[]; markers?: { date: Date; label: string }[];
  format?: (n: number) => string; axisFormat?: (n: number) => string; unit?: string; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 260, P = { l: 48, r: 16, t: 18, b: 28 };
  const n = Math.max(2, data.length);
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const x = (i: number) => (data.length === 1 ? (W + P.l - P.r) / 2 : P.l + (i / (n - 1)) * (W - P.l - P.r));
  const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join("");
  const area = data.length > 1 ? `${line}L${x(data.length - 1)} ${H - P.b}L${x(0)} ${H - P.b}Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const fmtDay = (d: Date) => d.toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" }).replace(".", "");
  const peak = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0);
  const step = Math.max(1, Math.ceil(data.length / 6));
  const axis = axisFormat ?? ((v: number) => v.toLocaleString("es-CO"));

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (n - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };
  const tipPos = hover !== null && ref.current ? { x: (x(hover) / W) * ref.current.clientWidth, y: (y(data[hover].value) / H) * ref.current.clientHeight } : null;

  return (
    <div className={s.chartWrap} ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className={t === 0 ? s.baseline : s.gridLine} />
            <text x={P.l - 8} y={y(t) + 4} className={s.axisY}>{axis(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (i % step === 0 || i === data.length - 1) && <text key={i} x={x(i)} y={H - 8} className={s.axisX}>{fmtDay(d.date)}</text>)}
        {markers.map((m) => {
          const i = data.findIndex((d) => d.date.getTime() >= m.date.getTime());
          return i < 0 ? null : (
            <g key={m.label}>
              <line x1={x(i)} x2={x(i)} y1={P.t} y2={H - P.b} className={s.marker} />
              <text x={x(i) + 6} y={P.t + 10} className={s.markerLbl}>{m.label}</text>
            </g>
          );
        })}
        {area && <motion.path key={`a${label}${data.length}`} d={area} fill="var(--series-1)" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ delay: 0.5, duration: 0.6 }} />}
        <motion.path key={`l${label}${data.length}`} d={line} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
        {/* etiqueta selectiva: solo el pico y el último punto */}
        {[...new Set([peak, data.length - 1])].map((i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(data[i].value)} r="4" fill="var(--series-1)" stroke="var(--surface)" strokeWidth="2" />
            <text x={x(i)} y={y(data[i].value) - 10} className={s.pointLbl}>{axis(data[i].value)}</text>
          </g>
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} className={s.crosshair} />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="var(--series-1)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
        <rect x={P.l} y={P.t} width={W - P.l - P.r} height={H - P.t - P.b} fill="transparent" />
      </svg>
      {hover !== null && tipPos && (
        <Tip x={tipPos.x} y={tipPos.y}>
          <span className={s.tipMuted}>{data[hover].date.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "long", timeZone: "America/Bogota" })}</span>
          <b>{format(data[hover].value)} {unit}</b>
        </Tip>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Columnas (una serie, p. ej. ventas por hora) */
export function Columns({ values, labels, format = (n: number) => String(n), unit = "" }: { values: number[]; labels: string[]; format?: (n: number) => string; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 200, P = { l: 36, r: 8, t: 14, b: 24 };
  const max = niceMax(Math.max(1, ...values));
  const band = (W - P.l - P.r) / values.length;
  const bw = Math.min(24, band - 2);
  const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
  const peak = values.indexOf(Math.max(...values));
  return (
    <div className={s.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg} role="img" aria-label="Distribución">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(max * t)} y2={y(max * t)} className={t === 0 ? s.baseline : s.gridLine} />
            <text x={P.l - 6} y={y(max * t) + 4} className={s.axisY}>{format(Math.round(max * t))}</text>
          </g>
        ))}
        {values.map((v, i) => {
          const cx = P.l + band * i + band / 2, top = y(v), h = H - P.b - top;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx - band / 2} y={P.t} width={band} height={H - P.t - P.b} fill="transparent" />
              {h > 0 && (
                <motion.path d={`M${cx - bw / 2} ${H - P.b}V${top + Math.min(4, h)}q0 -4 4 -4h${bw - 8}q4 0 4 4V${H - P.b}Z`}
                  fill="var(--series-1)" opacity={hover === null || hover === i ? 1 : 0.4}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: `${cx}px ${H - P.b}px` }} transition={{ delay: i * 0.02, duration: 0.6, ease: EASE }} />
              )}
              {(i % 3 === 0) && <text x={cx} y={H - 8} className={s.axisX}>{labels[i]}</text>}
              {(i === peak || hover === i) && v > 0 && <text x={cx} y={top - 6} className={s.pointLbl}>{format(v)}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && <p className={s.colHint}>{labels[hover]} · <b>{format(values[hover])} {unit}</b></p>}
    </div>
  );
}

/* ---------------------------------------------------------------- Inventario: barras apiladas por zona */
export interface StackRow { id: string; label: string; swatch: string; sold: number; held: number; capacity: number; unit: string; extra?: string }

export function InventoryBars({ rows }: { rows: StackRow[] }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div>
      <div className={s.legend}>
        <span><i style={{ background: "var(--series-1)" }} />Vendido</span>
        <span><i style={{ background: "var(--series-2)" }} />Reservado en checkout</span>
        <span><i className={s.legendTrack} />Disponible</span>
      </div>
      <div className={s.invRows}>
        {rows.map((r, idx) => {
          const pS = (r.sold / r.capacity) * 100;
          const pH = (r.held / r.capacity) * 100;
          const left = r.capacity - r.sold - r.held;
          const low = left / r.capacity <= 0.15;
          return (
            <div key={r.id} className={`${s.invRow} ${hover && hover !== r.id ? s.faded : ""}`} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)}>
              <div className={s.invLabel}>
                <i style={{ background: r.swatch }} />
                <b>{r.label}</b>
                <small>{r.extra}</small>
              </div>
              <div className={s.invTrack} role="img" aria-label={`${r.label}: ${r.sold} vendidos, ${r.held} reservados, ${left} disponibles de ${r.capacity}`}>
                <motion.span className={s.segSold} style={{ width: `${pS}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.1 + idx * 0.06, duration: 0.9, ease: EASE }} />
                {r.held > 0 && <motion.span className={s.segHeld} style={{ width: `${pH}%` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + idx * 0.06 }} />}
              </div>
              <div className={s.invNums}>
                <b>{Math.round(pS)}%</b>
                <small className={low ? s.warnText : ""}>{low && <span aria-hidden>▲ </span>}{left.toLocaleString("es-CO")} {r.unit} libres</small>
              </div>
              {hover === r.id && (
                <div className={s.invTip}>
                  <span><i style={{ background: "var(--series-1)" }} />Vendido <b>{r.sold}</b></span>
                  <span><i style={{ background: "var(--series-2)" }} />Reservado <b>{r.held}</b></span>
                  <span><i className={s.legendTrack} />Disponible <b>{left}</b></span>
                  <span className={s.tipMuted}>Capacidad {r.capacity} {r.unit}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Barras horizontales (una serie) */
export function HBars({ rows, format = (n: number) => n.toLocaleString("es-CO"), color = "var(--series-1)" }: {
  rows: { label: string; value: number; sub?: string }[]; format?: (n: number) => string; color?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className={s.hbars}>
      {rows.map((r, i) => (
        <div key={r.label} className={`${s.hbar} ${hover !== null && hover !== i ? s.faded : ""}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <div className={s.hbarTop}><span>{r.label}{r.sub && <small> · {r.sub}</small>}</span><b>{format(r.value)}</b></div>
          <div className={s.hbarTrack}>
            <motion.span style={{ width: `${(r.value / max) * 100}%`, background: color }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.8, ease: EASE }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Embudo (rampa ordinal de un solo tono) */
const FUNNEL_STEPS = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"];
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = steps[0].value;
  return (
    <div className={s.funnel}>
      {steps.map((st, i) => {
        const conv = i ? (st.value / steps[i - 1].value) * 100 : null;
        return (
          <div key={st.label} className={s.funnelRow}>
            <div className={s.hbarTop}><span>{st.label}</span><b>{st.value.toLocaleString("es-CO")}</b></div>
            <div className={s.hbarTrack}>
              <motion.span style={{ width: `${(st.value / max) * 100}%`, background: FUNNEL_STEPS[i] }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.8, ease: EASE }} />
            </div>
            {conv !== null && <small className={s.funnelConv}>{conv.toFixed(1)}% del paso anterior</small>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Medidor */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={s.meter} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <motion.span style={{ width: `${pct}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: EASE }} />
    </div>
  );
}
