import type { ReactNode } from "react";
import { SplitText, Reveal } from "./motion";
import s from "./ui.module.css";

/** Encabezado negro de las páginas internas */
export function PageHero({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className={s.pageHero}>
      <div className="arena-bg" />
      <div className="grain" />
      <span className={`ghost-text ${s.pageHeroGhost}`} aria-hidden>{title}</span>
      <div className={`wrap ${s.inner}`}>
        <h1><SplitText text={title} by="char" /></h1>
        {subtitle && <Reveal delay={0.3}><p>{subtitle}</p></Reveal>}
        {children && <Reveal delay={0.45}>{children}</Reveal>}
      </div>
    </section>
  );
}
