"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useId, type ReactNode } from "react";
import s from "./admin.module.css";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function Card({ title, sub, action, children, className = "", delay = 0 }: { title: string; sub?: string; action?: ReactNode; children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section className={`${s.card} ${className}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}>
      <header className={s.cardHead}>
        <div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>
        {action}
      </header>
      {children}
    </motion.section>
  );
}

export function Stat({ label, value, sub, tone, delay = 0, children }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "up" | "down"; delay?: number; children?: ReactNode }) {
  return (
    <motion.div className={s.kpi} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}>
      <span className={s.kpiLabel}>{label}</span>
      <b className={s.kpiValue}>{value}</b>
      {children}
      {sub && <span className={tone === "up" ? s.up : tone === "down" ? s.down : s.kpiSub}>{sub}</span>}
    </motion.div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <div className={s.range} role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)} className={value === o.id ? s.rangeOn : ""} aria-pressed={value === o.id}>
            {value === o.id && <motion.span layoutId="seg" className={s.rangePill} />}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`${s.switch} ${on ? s.switchOn : ""}`} onClick={() => onChange(!on)}>
      <motion.i layout transition={{ type: "spring", stiffness: 600, damping: 35 }} />
    </button>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className={s.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className={s.drawer} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: EASE }} role="dialog" aria-label={title}>
            <header className={s.drawerHead}><h3>{title}</h3><button onClick={onClose} aria-label="Cerrar">✕</button></header>
            <div className={s.drawerBody}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className={s.empty}>{children}</p>;
}

/** Descarga un CSV generado en el navegador */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
