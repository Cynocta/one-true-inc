"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import s from "./ui.module.css";

export type TickerItem = string | { text: string; href: string };
const label = (it: TickerItem) => (typeof it === "string" ? it : it.text);

/** Cinta roja animada con mensajes en loop. Los ítems con href son enlaces (p. ej. la preventa). */
export function Ticker({ items }: { items: TickerItem[] }) {
  const row = [...items, ...items, ...items, ...items];
  const link = items.find((it): it is { text: string; href: string } => typeof it !== "string");
  return (
    <div className={s.ticker} aria-label={items.map(label).join(" · ")}>
      {/* Enlace accesible fuera de la cinta animada (la cinta es decorativa y se repite) */}
      {link && <Link href={link.href} className={s.tickerSr}>{link.text}</Link>}
      <motion.div className={s.tickerTrack} animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, ease: "linear", repeat: Infinity }} aria-hidden>
        {[...row, ...row].map((it, i) =>
          typeof it === "string" ? (
            <span key={i} className={s.tickerItem}>{it}</span>
          ) : (
            <Link key={i} href={it.href} className={`${s.tickerItem} ${s.tickerLink}`} tabIndex={-1}>{it.text}</Link>
          ),
        )}
      </motion.div>
    </div>
  );
}
