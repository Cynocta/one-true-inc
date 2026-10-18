"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { DIVISION_ORDER, DIVISIONS } from "@/data/divisions";
import { FIGHTERS } from "@/data/fighters";
import type { DivisionKey } from "@/types";
import { FighterCard } from "./FighterCard";
import s from "./fighters.module.css";

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Roster filtrable por división y búsqueda, con reordenamiento animado */
export function FighterGrid() {
  const { lang, t } = useI18n();
  const [div, setDiv] = useState<DivisionKey | "all">("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const n = norm(q.trim());
    return FIGHTERS
      .filter((f) => (div === "all" || f.division === div) && (!n || norm(`${f.first} ${f.last} ${f.nick}`).includes(n)))
      .sort((a, b) => DIVISION_ORDER.indexOf(a.division) - DIVISION_ORDER.indexOf(b.division) || a.rank - b.rank);
  }, [div, q]);

  const chips: [DivisionKey | "all", string][] = [["all", t("f.all")], ...DIVISION_ORDER.map((k) => [k, DIVISIONS[k].name[lang]] as [DivisionKey, string])];

  return (
    <>
      <div className={s.filters}>
        <LayoutGroup id="div-chips">
          <div className="chips" style={{ marginBottom: 0 }}>
            {chips.map(([k, label]) => (
              <button key={k} className={`chip ${div === k ? "chip-on" : ""}`} onClick={() => setDiv(k)}>
                {div === k && <motion.span layoutId="chip-bg" className="chip-bg" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <div className={s.search}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="2.4" d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM16 16l5 5" /></svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("f.search")} />
        </div>
      </div>
      <motion.div layout className={s.grid}>
        <AnimatePresence mode="popLayout">
          {list.map((f, i) => (
            <motion.div
              key={f.slug}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
            >
              <FighterCard fighter={f} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className={s.empty}>{t("search.empty")}</p>}
    </>
  );
}
