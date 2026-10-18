"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Logo } from "@/components/ui/Brand";
import { Ticker } from "@/components/ui/Ticker";
import { SOCIAL } from "@/data/site";
import type { DictKey } from "@/i18n";
import { LANGS, type Lang } from "@/i18n/config";
import { nextEvent } from "@/lib/data";
import { fmtDate, href } from "@/lib/format";
import { SearchOverlay } from "./SearchOverlay";
import s from "./Header.module.css";

const LEFT: { path: string; key: DictKey }[] = [
  { path: "eventos", key: "nav.events" },
  { path: "rankings", key: "nav.rankings" },
  { path: "peleadores", key: "nav.fighters" },
  { path: "noticias", key: "nav.news" },
];
const RIGHT: { path: string; key: DictKey }[] = [
  { path: "boletas", key: "nav.tickets" },
  { path: "contacto", key: "nav.contact" },
];

export function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Cambia el idioma conservando la ruta actual */
export function useLangHref() {
  const pathname = usePathname() || "/";
  return (lang: Lang) => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length && (LANGS as readonly string[]).includes(parts[0])) parts[0] = lang;
    else parts.unshift(lang);
    return "/" + parts.join("/") + "/";
  };
}

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const to = useLangHref();
  return (
    <div className={`${s.lang} ${className}`} role="group" aria-label="Idioma / Language">
      {LANGS.map((l) => (
        <Link key={l} href={to(l)} className={l === lang ? s.langOn : ""} onClick={() => { try { localStorage.setItem("ot-lang", l); } catch {} }}>
          {l === lang && <motion.span layoutId="lang-pill" className={s.langPill} transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
          <span>{l.toUpperCase()}</span>
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const { lang, t } = useI18n();
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 10);
    setHidden(y > 400 && y > prev && !open);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
  }, [open]);

  const active = (p: string) => pathname.startsWith(`/${lang}/${p}`);
  const ev = nextEvent();
  const tickerItems = [
    t("ph.note"),
    ev ? `${ev.name} · ${fmtDate(ev.date, lang, { day: "numeric", month: "short" })} · ${ev.venue}` : "",
    t("home.ticker"),
    "#TrueBoxing",
    "#TrueKnuckles",
  ].filter(Boolean);

  const NavLink = ({ path, k }: { path: string; k: DictKey }) => (
    <Link href={href(lang, path)} className={`${s.link} ${active(path) ? s.active : ""}`}>
      {t(k)}
      {active(path) && <motion.span layoutId="nav-underline" className={s.underline} />}
    </Link>
  );

  return (
    <>
      <motion.header
        className={`${s.header} ${scrolled ? s.scrolled : ""}`}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Ticker items={tickerItems} />
        <div className={s.bar}>
          <button className={`${s.burger} ${open ? s.burgerOpen : ""}`} onClick={() => setOpen(!open)} aria-label={t("nav.menu")} aria-expanded={open}>
            <span /><span /><span />
          </button>
          <nav className={`${s.nav} ${s.left}`}>
            {LEFT.map((n) => <NavLink key={n.path} path={n.path} k={n.key} />)}
          </nav>
          <Link href={href(lang)} className={s.logo} aria-label="One True — inicio">
            <motion.span whileHover={{ scale: 1.06, rotate: -2 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} style={{ display: "inline-flex" }}>
              <Logo />
            </motion.span>
          </Link>
          <nav className={`${s.nav} ${s.right}`}>
            {RIGHT.map((n) => <NavLink key={n.path} path={n.path} k={n.key} />)}
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className={`${s.icon} ${s.hideMobile}`} aria-label="Instagram"><IconInstagram /></a>
            <LangSwitch className={s.hideMobile} />
            <button className={s.icon} onClick={() => setSearch(true)} aria-label={t("nav.search")}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="2.4" d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM16 16l5 5" /></svg>
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className={s.drawer} initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}>
            <nav>
              {[{ path: "", key: "nav.home" as DictKey }, ...LEFT, ...RIGHT].map((n, i) => (
                <motion.div key={n.path} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={href(lang, n.path)} className={n.path && active(n.path) ? s.drawerActive : ""}>
                    <span className={s.drawerNum}>0{i + 1}</span>
                    {t(n.key)}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className={s.drawerFoot}>
              <LangSwitch />
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">@onetrue.inc</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
