import Link from "next/link";
import { VersusHero } from "@/components/events/VersusHero";
import { DontMissSection, FeaturedSection, FeatureSection, homeStyles as s, RecentSection, RosterSection, SpotlightSection, UpcomingSection } from "@/components/home/HomeSections";
import { Countdown } from "@/components/ui/Countdown";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { mustFighter, nextEvent } from "@/lib/data";
import { fmtDate, href, tx } from "@/lib/format";

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = translator(lang);
  const ev = nextEvent();
  const a = mustFighter(ev.main[0].a), b = mustFighter(ev.main[0].b);

  return (
    <>
      <VersusHero a={a} b={b} brand={ev.brand} kicker={`${ev.name} · ${t("ev.mainEvent")}`} tagline={tx(ev.tagline, lang)}>
        <span className={s.heroMeta}>{fmtDate(ev.date, lang, { weekday: "long", day: "numeric", month: "long" })} · {ev.venue}</span>
        <Countdown date={ev.date} />
        <div className={s.heroBtns}>
          <Link className={s.liveBadge} href={`${href(lang, "boletas")}?evento=${ev.slug}`}>{t("home.liveNow")}</Link>
        </div>
        <Link className="link-more" href={href(lang, `eventos/${ev.slug}`)} style={{ color: "#fff" }}>{t("home.watchNow")} →</Link>
      </VersusHero>
      <FeatureSection lang={lang} />
      <RosterSection lang={lang} />
      <FeaturedSection lang={lang} />
      <DontMissSection lang={lang} />
      <UpcomingSection lang={lang} />
      <SpotlightSection lang={lang} />
      <RecentSection lang={lang} />
    </>
  );
}
