"use client";

import { InstagramLogoIcon, ThreadsLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Logo } from "./Logo";
import { Signup } from "./Signup";
import s from "./teaser.module.css";

/** Fotos reales de TrueBoxing 3 (abr 2026) y de la noche del 26 ago 2025, del Drive de One True. */
const PHOTOS = [
  { src: "/img/tb3-grito.webp", pos: "58% 28%" },
  { src: "/img/ago25-presion.webp", pos: "50% 30%" },
  { src: "/img/tb3-golpe.webp", pos: "50% 35%" },
  { src: "/img/ago25-gato.webp", pos: "62% 40%" },
  { src: "/img/tb3-impacto.webp", pos: "50% 40%" },
];

const PUNCHES = ["JAB", "CROSS", "HOOK", "UPPERCUT"];

export const SOCIAL = {
  instagram: "https://www.instagram.com/onetrue.inc/",
  whatsapp: "https://wa.me/message/A3A7VHZJIA2YF1",
  threads: "https://www.threads.net/@onetrue.inc",
};

const COMING = ["Boletas en línea", "Carteleras", "Peleadores", "Rankings", "Tienda oficial", "TrueBoxing", "TrueKnuckles"];

const SLAM = [0.2, 0.9, 0.3, 1] as const;

type Hit = { id: number; x: number; y: number; word: string; big: boolean };

export function Teaser() {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [hits, setHits] = useState<Hit[]>([]);
  const [punched, setPunched] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const combo = useRef({ n: 0, at: 0, id: 0 });
  const sag = useMotionValue(0);
  const shake = useMotionValue(0);

  // Fotos en rotación (el anillo de luz se mueve, la pelea sigue)
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setSlide((i) => (i + 1) % PHOTOS.length), 5200);
    return () => clearInterval(t);
  }, [reduce]);

  // Cuántos van en la fila (se muestra solo cuando ya es un número que impresiona)
  useEffect(() => {
    fetch("/api/registro").then((r) => (r.ok ? r.json() : null)).then((d) => d && setCount(d.count)).catch(() => null);
  }, []);

  function punch(e: PointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("a, button, input, select, label, summary")) return;
    const box = e.currentTarget.getBoundingClientRect();
    const now = performance.now();
    const c = combo.current;
    c.n = now - c.at < 900 ? c.n + 1 : 1;
    c.at = now;
    const id = ++c.id;
    const word = c.n >= 3 ? `Combo x${c.n}` : PUNCHES[Math.floor(Math.random() * PUNCHES.length)];
    setHits((h) => [...h.slice(-5), { id, x: e.clientX - box.left, y: e.clientY - box.top, word, big: c.n >= 3 }]);
    setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 950);
    setPunched(true);
    if (!reduce) {
      animate(sag, [0, 42, -16, 7, 0], { duration: 0.95, ease: "easeOut" });
      animate(shake, [0, -10, 8, -4, 2, 0], { duration: 0.36 });
      navigator.vibrate?.(16);
    }
  }

  return (
    <main className={s.page}>
      <div aria-hidden className={s.grain} />

      {/* ---------------- Escena ---------------- */}
      <motion.section className={s.hero} style={{ x: shake }} onPointerDown={punch} aria-labelledby="titular">
        <div className={s.photos} aria-hidden>
          {PHOTOS.map((p, i) => (
            <motion.img
              key={p.src}
              src={p.src}
              alt=""
              style={{ objectPosition: p.pos }}
              initial={false}
              animate={{ opacity: i === slide ? 1 : 0, scale: i === slide ? 1.08 : 1.18 }}
              transition={{ opacity: { duration: 1.4 }, scale: { duration: 6.5, ease: "linear" } }}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
            />
          ))}
          <span className={s.tint} />
          <Ropes sag={sag} reduce={!!reduce} />
          <span className={s.shade} />
          <span className={s.spot} />
        </div>

        <header className={s.top}>
          <motion.a
            href="#lista"
            className={s.brand}
            aria-label="One True"
            initial={reduce ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Logo />
          </motion.a>
          <nav className={s.social} aria-label="Redes de One True">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramLogoIcon size={22} weight="bold" /></a>
            <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsappLogoIcon size={22} weight="bold" /></a>
            <a href={SOCIAL.threads} target="_blank" rel="noopener noreferrer" aria-label="Threads"><ThreadsLogoIcon size={22} weight="bold" /></a>
          </nav>
        </header>

        <div className={s.copy}>
          <motion.p
            className={s.stamp}
            initial={reduce ? false : { opacity: 0, scale: 2.4, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 420, damping: 16, delay: 1.5 }}
          >
            Próximamente
          </motion.p>
          <h1 id="titular" className={s.headline} aria-label="El ring se está armando">
            {["El ring", "se está", "armando"].map((line, i) => (
              <span key={line} className={s.lineMask} aria-hidden>
                <motion.span
                  className={`${s.line} ${i === 2 ? s.red : ""}`}
                  initial={reduce ? false : { y: "110%", skewY: 8 }}
                  animate={{ y: "0%", skewY: 0 }}
                  transition={{ duration: 0.85, delay: 0.55 + i * 0.13, ease: SLAM }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className={s.sub}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
          >
            La nueva casa del verdadero boxeo en Colombia llega muy pronto. Entra a la lista y entérate primero.
          </motion.p>
          <motion.div
            className={s.ctaRow}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <a href="#lista" className={s.cta}>
              <span>Entrar a la lista</span>
            </a>
            {count !== null && count >= 25 && <span className={s.queue}><b>{count.toLocaleString("es-CO")}</b> ya están en la fila</span>}
          </motion.div>
        </div>

        <AnimatePresence>
          {!punched && (
            <motion.p
              className={s.hint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 2.6, duration: 0.6 }}
            >
              Toca la pantalla y tira un golpe
            </motion.p>
          )}
        </AnimatePresence>

        {hits.map((h) => (
          <span key={h.id} className={`${s.hit} ${h.big ? s.hitBig : ""}`} style={{ left: h.x, top: h.y }} aria-hidden>
            <i />
            <b>{h.word}</b>
          </span>
        ))}
      </motion.section>

      {/* ---------------- Lo que viene ---------------- */}
      <div className={s.ticker} aria-label={`Lo que viene: ${COMING.join(", ")}`}>
        <div className={s.tickerTrack} aria-hidden>
          {[0, 1].map((k) => (
            <span key={k}>{COMING.map((c) => <b key={c}>{c}</b>)}</span>
          ))}
        </div>
      </div>

      {/* ---------------- Lista ---------------- */}
      <Signup count={count} />

      <footer className={s.foot}>
        <Logo className={s.footLogo} markOnly />
        <p>La casa del verdadero boxeo.</p>
        <nav aria-label="Redes de One True">
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={SOCIAL.threads} target="_blank" rel="noopener noreferrer">Threads</a>
        </nav>
        <small>© {new Date().getFullYear()} One True Inc.</small>
      </footer>
    </main>
  );
}

/** Tres cuerdas del ring: se tensan al cargar y vibran con cada golpe. */
function Ropes({ sag, reduce }: { sag: MotionValue<number>; reduce: boolean }) {
  return (
    <svg className={s.ropes} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden>
      {[640, 760, 880].map((y, i) => (
        <Rope key={y} y={y} i={i} sag={sag} reduce={reduce} />
      ))}
    </svg>
  );
}

function Rope({ y, i, sag, reduce }: { y: number; i: number; sag: MotionValue<number>; reduce: boolean }) {
  const d = useTransform(sag, (v) => `M -20 ${y} Q 500 ${y + 16 + v * (1 - i * 0.22)} 1020 ${y}`);
  return (
    <>
      <motion.path
        d={d}
        className={i === 1 ? s.ropeWhite : s.ropeRed}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.25, delay: 0.25 + i * 0.14, ease: [0.7, 0, 0.2, 1] }}
      />
      <motion.path
        d={d}
        className={s.ropeShine}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.25, delay: 0.25 + i * 0.14, ease: [0.7, 0, 0.2, 1] }}
      />
    </>
  );
}
