import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { FightRow } from "@/components/events/FightRow";
import hs from "@/components/events/events.module.css";
import { VersusHero } from "@/components/events/VersusHero";
import { homeStyles } from "@/components/home/HomeSections";
import { Countdown } from "@/components/ui/Countdown";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { EVENTS } from "@/data/events";
import { translator } from "@/i18n";
import { LANGS, type Lang } from "@/i18n/config";
import { getEvent, mustFighter, upcomingEvents } from "@/lib/data";
import { fmtDate, fmtTime, href, tx } from "@/lib/format";

type P = { params: Promise<{ lang: Lang; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.flatMap((lang) => EVENTS.map((e) => ({ lang, slug: e.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  return { title: e ? e.name : "Evento" };
}

export default async function EventPage({ params }: P) {
  const { lang, slug } = await params;
  const e = getEvent(slug);
  if (!e) notFound();
  const t = translator(lang);
  const past = e.status === "past";
  const a = mustFighter(e.main[0].a), b = mustFighter(e.main[0].b);
  const others = upcomingEvents().filter((x) => x.slug !== e.slug).slice(0, 3);

  return (
    <>
      <VersusHero a={a} b={b} brand={e.brand} kicker={e.name} tagline={tx(e.tagline, lang)}>
        <div className={hs.heroMeta}>
          <div><span>{t("ev.date")}</span><b>{fmtDate(e.date, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b><small>{fmtTime(e.date, lang)}</small></div>
          <div><span>{t("ev.venue")}</span><b>{e.venue}</b><small>{e.city}</small></div>
        </div>
        {past ? (
          <div className={hs.ended}>{t("ev.ended")}</div>
        ) : (
          <>
            <Countdown date={e.date} />
            <Link className={homeStyles.liveBadge} href={`${href(lang, "boletas")}?evento=${e.slug}`}>{t("ev.tickets")}</Link>
          </>
        )}
      </VersusHero>

      <nav className={hs.subnav}>
        <div className="wrap">
          <a href="#main">{t("ev.main")}</a>
          {e.prelims.length > 0 && <a href="#prelims">{t("ev.prelims")}</a>}
          {!past && <Link href={`${href(lang, "boletas")}?evento=${e.slug}`}>{t("ev.tickets")}</Link>}
          <Link href={href(lang, "eventos")}>{t("ev.all")}</Link>
        </div>
      </nav>

      <section className="sec sec-gray">
        <div className="wrap narrow">
          <Reveal><h2 className="title-bar" id="main">{t("ev.main")}<small>{e.main.length} {lang === "en" ? "bouts" : "peleas"}</small></h2></Reveal>
          {e.main.map((bout, i) => <FightRow key={i} bout={bout} main={i === 0} />)}
          {e.prelims.length > 0 && (
            <>
              <Reveal><h2 className="title-bar" id="prelims">{t("ev.prelims")}<small>{e.prelims.length} {lang === "en" ? "bouts" : "peleas"}</small></h2></Reveal>
              {e.prelims.map((bout, i) => <FightRow key={i} bout={bout} />)}
            </>
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Reveal className="sec-head"><h2>{t("home.upcoming")}</h2></Reveal>
            <Stagger className={homeStyles.eventGrid}>
              {others.map((x) => <StaggerItem key={x.slug}><EventCard event={x} lang={lang} /></StaggerItem>)}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
