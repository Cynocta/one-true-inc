"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FighterArt } from "@/components/fighters/FighterArt";
import { useI18n } from "@/components/providers/I18nProvider";
import { DIVISIONS } from "@/data/divisions";
import { mustFighter, recordStr } from "@/lib/data";
import { href } from "@/lib/format";
import type { Bout, Fighter } from "@/types";
import s from "./events.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

function Side({ f, side, win, lose }: { f: Fighter; side: "a" | "b"; win: boolean; lose: boolean }) {
  const { lang, t } = useI18n();
  return (
    <Link href={href(lang, `peleadores/${f.slug}`)} className={`${s.side} ${side === "b" ? s.sideB : ""} ${lose ? s.lose : ""}`}>
      <motion.div
        className={s.sidePhoto}
        initial={{ x: side === "a" ? -60 : 60, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <FighterArt fighter={f} corner={side === "a" ? "red" : "blue"} flip={side === "b"} />
        {win && <span className={s.win}>{t("ev.win")}</span>}
      </motion.div>
      <div className={s.sideName}>
        {f.rank === 0 ? <span className="belt">C</span> : <span className={s.rk}>#{f.rank}</span>}
        <b>{f.first}</b>
        <strong>{f.last}</strong>
        <span className={s.rec}>{recordStr(f)}</span>
      </div>
    </Link>
  );
}

export function FightRow({ bout, main = false }: { bout: Bout; main?: boolean }) {
  const { lang, t } = useI18n();
  const a = mustFighter(bout.a), b = mustFighter(bout.b), r = bout.result;
  return (
    <motion.div
      className={`${s.row} ${main ? s.rowMain : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <Side f={a} side="a" win={r?.winner === "a"} lose={!!r && r.winner !== "a"} />
      <div className={s.mid}>
        <span className={s.div}>{DIVISIONS[bout.division].name[lang]}</span>
        {bout.title && <span className="belt">{t("ev.title")}</span>}
        <motion.span className={s.vs} initial={{ scale: 2.2, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 }}>
          VS
        </motion.span>
        {r ? <span className={s.res}>{r.method} · R{r.round} · {r.time}</span> : <span className={s.rounds}>{bout.rounds} {t("ev.rounds")}</span>}
      </div>
      <Side f={b} side="b" win={r?.winner === "b"} lose={!!r && r.winner !== "b"} />
    </motion.div>
  );
}
