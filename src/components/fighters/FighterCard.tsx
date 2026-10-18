"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { DIVISIONS } from "@/data/divisions";
import { recordStr } from "@/lib/data";
import { href, tx } from "@/lib/format";
import type { Fighter } from "@/types";
import { FighterArt } from "./FighterArt";
import s from "./fighters.module.css";

/** Tarjeta de peleador con inclinación 3D al pasar el mouse */
export function FighterCard({ fighter: f, dark = false }: { fighter: Fighter; dark?: boolean }) {
  const { lang, t } = useI18n();
  const champ = f.rank === 0;
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const artX = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 20 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} className={s.cardWrap}>
      <Link href={href(lang, `peleadores/${f.slug}`)} className={`${s.card} ${dark ? s.cardDark : ""} ${champ ? s.cardChamp : ""}`} onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className={s.cardMedia}>
          <span className={s.cardGhost} aria-hidden>{f.last}</span>
          {champ ? <span className={`belt ${s.cardBadge}`}>★ {t(DIVISIONS[f.division].women ? "f.championF" : "f.champion")}</span> : <span className={s.cardRank}>#{f.rank}</span>}
          <motion.div className={s.cardArt} style={{ x: artX }}>
            <FighterArt fighter={f} corner={champ ? "red" : "none"} />
          </motion.div>
        </div>
        <div className={s.cardBody}>
          <span className={s.nick}>&ldquo;{f.nick}&rdquo;</span>
          <h3><span>{f.first}</span> {f.last}</h3>
          <div className={s.cardMeta}>
            <span>{tx(DIVISIONS[f.division].name, lang)}</span>
            <b>{recordStr(f)}</b>
          </div>
        </div>
        <span className={s.cardCta}>{t("f.profile")} →</span>
      </Link>
    </motion.div>
  );
}
