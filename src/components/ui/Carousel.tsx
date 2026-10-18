"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import s from "./ui.module.css";

const Arrow = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path d={dir === "l" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"} fill="none" stroke="currentColor" strokeWidth="2.6" />
  </svg>
);

/** Carrusel horizontal con scroll-snap, flechas, barra de progreso y arrastre con mouse */
export function Carousel({ title, kicker, children, dark = false }: { title: string; kicker?: string; children: ReactNode; dark?: boolean }) {
  const { t } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const { scrollXProgress } = useScroll({ container: track });
  const progress = useSpring(scrollXProgress, { stiffness: 200, damping: 30 });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  // arrastre con mouse
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false, startX = 0, startLeft = 0, moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const go = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className={s.car}>
      <div className="sec-head">
        <div>
          {kicker && <div className="sec-kicker">{kicker}</div>}
          <h2>{title}</h2>
        </div>
        <div className={s.carNav} style={{ color: dark ? "#fff" : "#000" }}>
          <button className={s.carBtn} onClick={() => go(-1)} disabled={edges.start} aria-label={t("common.prev")}><Arrow dir="l" /></button>
          <button className={s.carBtn} onClick={() => go(1)} disabled={edges.end} aria-label={t("common.next")}><Arrow dir="r" /></button>
        </div>
      </div>
      <div className={s.carTrack} ref={track}>{children}</div>
      <div className={s.carProgress}><motion.span style={{ scaleX: progress }} /></div>
    </div>
  );
}
