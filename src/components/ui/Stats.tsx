"use client";

import { motion } from "framer-motion";
import { CountUp, EASE } from "./motion";
import s from "./ui.module.css";

const C = 2 * Math.PI * 44;

/** Anillo de porcentaje que se dibuja al entrar en pantalla */
export function RingStat({ value, label }: { value: number; label: string }) {
  return (
    <div className={s.ring}>
      <div className={s.ringSvg}>
        <svg viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" className={s.ringBg} />
          <motion.circle
            cx="50" cy="50" r="44" className={s.ringFg}
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            whileInView={{ strokeDashoffset: C * (1 - value / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE }}
          />
        </svg>
        <div className={s.ringVal}><CountUp to={value} suffix="%" /></div>
      </div>
      <span className={s.ringLabel}>{label}</span>
    </div>
  );
}

/** Barra horizontal que crece al entrar en pantalla */
export function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className={s.bar}>
      <span>{label}</span>
      <div className={s.barTrack}>
        <motion.div
          className={s.barFill}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: max ? value / max : 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </div>
      <b><CountUp to={value} /></b>
    </div>
  );
}
