"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Lang } from "@/i18n/config";
import type { Photo } from "./data";
import s from "./gazette.module.css";

const PRINT_EASE = [0.7, 0, 0.2, 1] as const;

const MONTHS: Record<Lang, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
};

export function dateParts(iso: string, lang: Lang) {
  const [y, m, d] = iso.split("-").map(Number);
  return { day: String(d), month: MONTHS[lang][m - 1], year: String(y) };
}

export function longDate(iso: string, lang: Lang) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === "es" ? "es-CO" : "en-US", { day: "numeric", month: "long", year: "numeric" });
}

/** Foto en semitono que "se imprime" de arriba hacia abajo al entrar en pantalla. Al pasar el cursor recupera el color. */
export function Print({ photo, lang, className = "", eager = false, caption }: { photo: Photo; lang: Lang; className?: string; eager?: boolean; caption?: string }) {
  const reduce = useReducedMotion();
  // Se observa el <figure> (sin recorte): una placa con clip-path al 100% tiene área visible 0 y nunca "entra"
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const shown = reduce || inView;
  return (
    <figure ref={ref} className={`${s.print} ${className}`}>
      <motion.div
        className={s.printPlate}
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={shown ? { clipPath: "inset(0 0 0% 0)" } : undefined}
        transition={{ duration: 1.15, ease: PRINT_EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.alt[lang]} style={{ objectPosition: photo.focus }} loading={eager ? "eager" : "lazy"} decoding="async" />
        {!reduce && (
          <motion.span
            aria-hidden
            className={s.roller}
            initial={{ y: "-100%" }}
            animate={shown ? { y: "420%" } : undefined}
            transition={{ duration: 1.15, ease: PRINT_EASE }}
          />
        )}
      </motion.div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Sello de goma con la fecha: cae con fuerza y queda torcido, como en la mesa de redacción. */
export function Stamp({ iso, lang, className = "" }: { iso: string; lang: Lang; className?: string }) {
  const reduce = useReducedMotion();
  const { day, month, year } = dateParts(iso, lang);
  return (
    <motion.time
      dateTime={iso}
      className={`${s.stamp} ${className}`}
      initial={reduce ? false : { scale: 2.6, opacity: 0, rotate: -26 }}
      whileInView={{ scale: 1, opacity: 1, rotate: -9 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 520, damping: 17, mass: 0.9 }}
    >
      <span className={s.stampDay}>{day}</span>
      <span className={s.stampMonth}>{month}</span>
      <span className={s.stampYear}>{year}</span>
    </motion.time>
  );
}

/** Titular que se escribe letra por letra, como un teletipo. */
export function Teletype({ text, as: Tag = "h2", className = "" }: { text: string; as?: "h2" | "h3" | "p"; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const MotionTag = motion[Tag];
  return (
    <MotionTag ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={reduce ? false : { opacity: 0 }}
          animate={inView || reduce ? { opacity: 1 } : undefined}
          transition={{ duration: 0.01, delay: reduce ? 0 : i * 0.045 }}
        >
          {ch}
        </motion.span>
      ))}
      {!reduce && <span aria-hidden className={s.caret} />}
    </MotionTag>
  );
}

/** Número que corre hasta su valor al entrar en pantalla (sin re-render: escribe directo en el DOM). */
export function Tally({ value, className = "" }: { value: number | null; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || value === null || !inView) return;
    if (reduce) { el.textContent = value.toLocaleString("es-CO"); return; }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString("es-CO"); },
    });
    return () => controls.stop();
  }, [value, inView, reduce]);
  return <span ref={ref} className={className}>{value === null ? "..." : "0"}</span>;
}

/** Entrada simple para bloques de texto. */
export function Rise({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
