"use client";

import { motion } from "framer-motion";
import s from "./ui.module.css";

/** Cinta roja animada con mensajes en loop */
export function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={s.ticker} aria-label={items.join(" · ")}>
      <motion.div className={s.tickerTrack} animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, ease: "linear", repeat: Infinity }} aria-hidden>
        {[...row, ...row].map((txt, i) => (
          <span key={i} className={s.tickerItem}>{txt}</span>
        ))}
      </motion.div>
    </div>
  );
}
