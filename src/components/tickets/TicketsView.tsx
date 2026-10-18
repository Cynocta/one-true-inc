"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import s from "@/components/pages/pages.module.css";
import { useI18n } from "@/components/providers/I18nProvider";
import { BrandBadge } from "@/components/ui/Brand";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SOCIAL, TICKETS, zonePrice } from "@/data/site";
import { upcomingEvents } from "@/lib/data";
import { fmtDate, fmtMoney, href, tx } from "@/lib/format";
import { PhaseTable } from "./PhaseTable";
import { availability } from "./venue";
import { VenueLegend, VenueMap } from "./VenueMap";

/** Página de boletas: evento → mapa animado del recinto → zona → checkout */
export function TicketsView() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const events = upcomingEvents();
  const [sel, setSel] = useState(() => events.find((e) => e.slug === params.get("evento"))?.slug ?? events[0]?.slug);
  const [zone, setZone] = useState<string | null>(null);

  const checkoutHref = (zoneId: string) => `${href(lang, "checkout")}?evento=${sel}&zona=${zoneId}`;
  const z = zone ? TICKETS.find((x) => x.id === zone) : null;

  return (
    <>
      <div className={s.teList}>
        {events.map((e) => (
          <motion.button key={e.slug} whileTap={{ scale: 0.97 }} className={`${s.te} ${sel === e.slug ? s.teOn : ""}`} onClick={() => setSel(e.slug)}>
            <AnimatePresence>{sel === e.slug && <motion.span className={s.teCheck} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>✓</motion.span>}</AnimatePresence>
            <BrandBadge brand={e.brand} />
            <b>{e.name}</b>
            <small>{fmtDate(e.date, lang)} · {e.venue}</small>
          </motion.button>
        ))}
      </div>

      <div className={s.ticketsGrid}>
        <div>
          <h2 className="title-bar">{t("ev.map")}</h2>
          <VenueMap zone={zone} onZone={setZone} onUnit={() => {}} />
          <VenueLegend zone={zone} onZone={setZone} />

          <AnimatePresence>
            {z && (
              <motion.div className={s.zoneCta} style={{ ["--zc" as string]: z.color }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <i />
                <div><b>{tx(z.name, lang)}</b><small>{fmtMoney(zonePrice(z))} {z.kind === "box" ? `· ${z.persons} ${lang === "en" ? "people" : "personas"}` : ""} · {availability(z.id).left} {lang === "en" ? "left" : "disponibles"}</small></div>
                <Link className="btn btn-red" href={checkoutHref(z.id)}>{t("t.buy")} →</Link>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="title-bar">{t("t.zones")}</h2>
          <PhaseTable zone={zone} onZone={(id) => router.push(checkoutHref(id))} />
          <p className="muted small">{t("t.note")}</p>
        </div>

        <aside className="side-col">
          <Stagger className={s.tickets}>
            {TICKETS.filter((x) => x.featured || x.kind !== "general").map((x) => (
              <StaggerItem key={x.id}>
                <Link href={checkoutHref(x.id)} className={`${s.ticket} ${x.featured ? s.ticketFeatured : ""}`} style={{ borderLeftColor: x.color }}>
                  {x.featured && <span className={s.flag}>{t("t.featured")}</span>}
                  <div>
                    <h3>{tx(x.name, lang)}</h3>
                    <ul>{x.perks[lang].map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          <div className={`panel ${s.howto}`}>
            <h4>{t("t.howTo")}</h4>
            <ol>
              <li>{t("t.step1")}</li>
              <li>{t("t.step2")}</li>
              <li>{t("t.step3")}</li>
            </ol>
            <a className="btn btn-dark btn-block" href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">{t("c.whatsapp")}</a>
          </div>
        </aside>
      </div>
    </>
  );
}
