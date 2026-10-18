"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import s from "./tabs.module.css";

/** Pestañas con indicador animado. Los paneles llegan ya renderizados desde el servidor. */
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;
  return (
    <>
      <div className={s.tabs} role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === active} className={`${s.tab} ${t.id === active ? s.on : ""}`} onClick={() => setActive(t.id)}>
            {t.label}
            {t.id === active && <motion.span layoutId="tab-ind" className={s.ind} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
          {current.content}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
