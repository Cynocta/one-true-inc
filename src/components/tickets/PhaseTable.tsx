"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { currentPhaseIndex, PRICE_PHASES, TICKETS } from "@/data/site";
import { fmtDate, tx } from "@/lib/format";
import s from "./phases.module.css";

const short = (n: number) => "$" + n.toLocaleString("es-CO");

/** Tabla de precios por etapa: resalta la etapa actual y cuenta los días hasta el próximo aumento */
export function PhaseTable({ zone, onZone }: { zone?: string | null; onZone?: (id: string) => void }) {
  const { lang } = useI18n();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(id); }, []);
  const cur = currentPhaseIndex(now ?? undefined);
  const until = PRICE_PHASES[cur].until;
  const days = until && now ? Math.max(0, Math.ceil((new Date(until).getTime() - now) / 86400000)) : null;

  return (
    <div className={s.wrap}>
      {days !== null && (
        <motion.div className={s.alert} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className={s.pulse} />
          {lang === "en"
            ? <>Prices go up in <b>{days} {days === 1 ? "day" : "days"}</b> · {tx(PRICE_PHASES[cur].name, lang)} ends {fmtDate(until!, lang, { day: "numeric", month: "long" })}</>
            : <>El precio sube en <b>{days} {days === 1 ? "día" : "días"}</b> · {tx(PRICE_PHASES[cur].name, lang)} hasta el {fmtDate(until!, lang, { day: "numeric", month: "long" })}</>}
        </motion.div>
      )}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>{lang === "en" ? "Zone" : "Localidad"}</th>
              {PRICE_PHASES.map((p, i) => (
                <th key={p.id} className={i === cur ? s.now : i < cur ? s.past : ""}>
                  {tx(p.name, lang)}
                  {i === cur && <motion.span layoutId="phase-now" className={s.nowTag}>{lang === "en" ? "NOW" : "AHORA"}</motion.span>}
                  {p.until && <small>{lang === "en" ? "until" : "hasta"} {fmtDate(p.until, lang, { day: "numeric", month: "short" })}</small>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TICKETS.map((z, r) => (
              <motion.tr key={z.id} className={zone === z.id ? s.rowOn : ""} style={{ ["--zc" as string]: z.color }} onClick={() => onZone?.(z.id)}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: r * 0.06 }}>
                <td><i />{tx(z.name, lang)}{z.persons && <small> × {z.persons}</small>}</td>
                {z.prices.map((p, i) => (
                  <td key={i} className={i === cur ? s.now : i < cur ? s.past : ""}><span>{short(p)}</span></td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
