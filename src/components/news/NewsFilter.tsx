"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import s from "@/components/pages/pages.module.css";

/** Filtro por categoría. Las tarjetas llegan renderizadas desde el servidor. */
export function NewsFilter({ items, allLabel }: { items: { key: string; category: string; node: ReactNode }[]; allLabel: string }) {
  const cats = ["all", ...new Set(items.map((i) => i.category))];
  const [cat, setCat] = useState("all");
  const list = items.filter((i) => cat === "all" || i.category === cat);

  return (
    <>
      <LayoutGroup id="news-chips">
        <div className="chips" style={{ marginTop: 44 }}>
          {cats.map((c) => (
            <button key={c} className={`chip ${cat === c ? "chip-on" : ""}`} onClick={() => setCat(c)}>
              {cat === c && <motion.span layoutId="news-chip-bg" className="chip-bg" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
              <span>{c === "all" ? allLabel : c}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
      <motion.div layout className={s.newsGrid}>
        <AnimatePresence mode="popLayout">
          {list.map((i, idx) => (
            <motion.div key={i.key} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.45, delay: idx * 0.04 }}>
              {i.node}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
