"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import s from "./ui.module.css";

const calc = (target: number) => {
  const d = Math.max(0, target - Date.now()) / 1000;
  return { days: Math.floor(d / 86400), hours: Math.floor((d % 86400) / 3600), min: Math.floor((d % 3600) / 60), sec: Math.floor(d % 60) };
};

/** Cuenta regresiva con dígitos que caen al cambiar */
export function Countdown({ date }: { date: string }) {
  const { t } = useI18n();
  const target = new Date(date).getTime();
  const [v, setV] = useState<ReturnType<typeof calc> | null>(null);

  useEffect(() => {
    setV(calc(target));
    const id = setInterval(() => setV(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = [
    ["days", "cd.days"],
    ["hours", "cd.hours"],
    ["min", "cd.min"],
    ["sec", "cd.sec"],
  ] as const;

  return (
    <div className={s.cd}>
      {cells.map(([k, label]) => {
        const val = v ? String(v[k]).padStart(2, "0") : "--";
        return (
          <div key={k} className={s.cdCell}>
            <b className={s.cdNum}>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={val} initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                  {val}
                </motion.span>
              </AnimatePresence>
            </b>
            <span className={s.cdLabel}>{t(label)}</span>
          </div>
        );
      })}
    </div>
  );
}
