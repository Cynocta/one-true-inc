"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { FighterArt } from "@/components/fighters/FighterArt";
import { useI18n } from "@/components/providers/I18nProvider";
import { BrandBadge } from "@/components/ui/Brand";
import { href } from "@/lib/format";
import type { Brand, Fighter } from "@/types";
import s from "./events.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero "cara a cara": los peleadores entran desde los lados, el VS golpea en el centro
 * y todo tiene parallax al hacer scroll. Se usa en el home y en el detalle de evento.
 */
export function VersusHero({ a, b, brand, kicker, tagline, children, as = "h1" }: {
  a: Fighter; b: Fighter; brand: Brand; kicker: string; tagline?: string; children?: ReactNode; as?: "h1" | "h2";
}) {
  const { lang } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const ghostX = useTransform(scrollYProgress, [0, 1], ["-50%", "-62%"]);
  const Title = as === "h1" ? motion.h1 : motion.h2;

  return (
    <section ref={ref} className={s.hero}>
      <div className="arena-bg" />
      <div className="grain" />
      <motion.span className="ghost-text" style={{ bottom: "8%", x: ghostX, left: "50%", translateX: 0 }} aria-hidden>
        {a.last} · {b.last}
      </motion.span>
      <div className={`wrap ${s.heroGrid}`}>
        <motion.div style={{ y: yA }} className={s.heroFighter}>
          <motion.div initial={{ x: -160, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.1, delay: 0.15, ease: EASE }} style={{ height: "100%", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Link href={href(lang, `peleadores/${a.slug}`)} style={{ height: "100%", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <FighterArt fighter={a} corner="red" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className={s.heroCenter} style={{ y: yC }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <BrandBadge brand={brand} large />
          </motion.div>
          <motion.span className={s.heroName} initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.3em" }} transition={{ duration: 1, delay: 0.2 }}>
            {kicker}
          </motion.span>
          <Title className={s.heroTitle}>
            <motion.span initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.35, ease: EASE }}>{a.last}</motion.span>
            <motion.em initial={{ scale: 3, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.75 }}>vs</motion.em>
            <motion.span initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5, ease: EASE }}>{b.last}</motion.span>
          </Title>
          {tagline && (
            <motion.p className={s.heroTag} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              {tagline}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.05, ease: EASE }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            {children}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: yB }} className={s.heroFighter}>
          <motion.div initial={{ x: 160, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.1, delay: 0.15, ease: EASE }} style={{ height: "100%", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Link href={href(lang, `peleadores/${b.slug}`)} style={{ height: "100%", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <FighterArt fighter={b} corner="blue" flip />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

