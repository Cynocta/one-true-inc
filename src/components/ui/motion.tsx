"use client";

/**
 * Primitivas de animación reutilizables (framer-motion).
 * - <Reveal>: aparece al entrar en pantalla.
 * - <Stagger> + <StaggerItem>: hijos que aparecen en cascada.
 * - <CountUp>: número que cuenta hasta su valor.
 */
import { animate, motion, useInView, useMotionValue, useTransform, type HTMLMotionProps, type Variants } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Dir = "up" | "down" | "left" | "right" | "none";
const offset = (d: Dir, n = 40) => ({ up: { y: n }, down: { y: -n }, left: { x: n }, right: { x: -n }, none: {} })[d];

export function Reveal({ children, delay = 0, dir = "up", className, ...rest }: { children: ReactNode; delay?: number; dir?: Dir } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset(dir) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ol" | "ul" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}

export function CountUp({ to, duration = 1.6, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v) + suffix);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration, ease: EASE });
    return c.stop;
  }, [inView, to, duration, mv]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

/** Texto que aparece letra por letra / palabra por palabra con un golpe */
export function SplitText({ text, className, delay = 0, by = "word" }: { text: string; className?: string; delay?: number; by?: "word" | "char" }) {
  const parts = by === "word" ? text.split(" ") : [...text];
  return (
    <span className={className} aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }} aria-hidden>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * (by === "word" ? 0.08 : 0.03), ease: EASE }}
          >
            {p}
            {by === "word" && i < parts.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export { EASE };
