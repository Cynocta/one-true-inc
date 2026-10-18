"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { FighterArt } from "@/components/fighters/FighterArt";
import { EVENTS } from "@/data/events";
import { FIGHTERS } from "@/data/fighters";
import { NEWS } from "@/data/news";
import { DIVISIONS } from "@/data/divisions";
import { fmtDate, href, tx } from "@/lib/format";
import s from "./SearchOverlay.module.css";

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, t } = useI18n();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const res = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return null;
    return {
      fighters: FIGHTERS.filter((f) => norm(`${f.first} ${f.last} ${f.nick}`).includes(n)).slice(0, 6),
      events: EVENTS.filter((e) => norm(`${e.name} ${e.venue}`).includes(n)).slice(0, 4),
      news: NEWS.filter((x) => norm(tx(x.title, lang)).includes(n)).slice(0, 4),
    };
  }, [q, lang]);

  const empty = res && !res.fighters.length && !res.events.length && !res.news.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={s.ov} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div className={s.box} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <div className={s.row}>
              <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholder")} />
              <button onClick={onClose} aria-label={t("common.close")} className={s.close}>✕</button>
            </div>
            <div className={s.results} onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}>
              {res?.fighters.length ? (
                <>
                  <h4>{t("search.fighters")}</h4>
                  <div className={s.fighters}>
                    {res.fighters.map((f) => (
                      <Link key={f.slug} href={href(lang, `peleadores/${f.slug}`)} className={s.fighter}>
                        <div className={s.fArt}><FighterArt fighter={f} /></div>
                        <div><b>{f.first} {f.last}</b><span>&ldquo;{f.nick}&rdquo; · {tx(DIVISIONS[f.division].name, lang)}</span></div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
              {res?.events.length ? (
                <>
                  <h4>{t("search.events")}</h4>
                  {res.events.map((e) => (
                    <Link key={e.slug} href={href(lang, `eventos/${e.slug}`)} className={s.item}><b>{e.name}</b><span>{fmtDate(e.date, lang)}</span></Link>
                  ))}
                </>
              ) : null}
              {res?.news.length ? (
                <>
                  <h4>{t("search.news")}</h4>
                  {res.news.map((n) => (
                    <Link key={n.slug} href={href(lang, `noticias/${n.slug}`)} className={s.item}><b>{tx(n.title, lang)}</b></Link>
                  ))}
                </>
              ) : null}
              {empty && <p className={s.empty}>{t("search.empty")}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
