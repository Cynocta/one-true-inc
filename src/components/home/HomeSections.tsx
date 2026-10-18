import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { FighterArt } from "@/components/fighters/FighterArt";
import { FighterCard } from "@/components/fighters/FighterCard";
import { NewsCard, NewsRow } from "@/components/news/News";
import { InstagramFeed } from "./InstagramFeed";
import { STATIC_IG_POSTS } from "@/data/instagram";
import { BrandBadge, Logo } from "@/components/ui/Brand";
import { Carousel } from "@/components/ui/Carousel";
import { Media } from "@/components/ui/Media";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { RingStat } from "@/components/ui/Stats";
import { DIVISIONS } from "@/data/divisions";
import { FIGHTERS, P4P } from "@/data/fighters";
import { NEWS } from "@/data/news";
import { SOCIAL } from "@/data/site";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { fullName, getFighter, koRate, mustFighter, nextEvent, nextFightOf, recordStr, upcomingEvents } from "@/lib/data";
import { fmtDate, href, tx } from "@/lib/format";
import s from "./home.module.css";

/* ---------- Nota principal + Lo más visto ---------- */
export function FeatureSection({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const ev = nextEvent();
  const lead = NEWS[0];
  const a = mustFighter(ev.main[0].a), b = mustFighter(ev.main[0].b);
  return (
    <section className={s.feature}>
      <div className={`wrap ${s.featureGrid}`}>
        <Reveal className={s.lead}>
          <Link href={href(lang, `eventos/${ev.slug}`)} className={s.leadMedia}>
            <Media fighters={[a, b]} label="1600×900 · foto principal" />
          </Link>
          <div className={s.leadCopy}>
            <span className={s.redBar} />
            <div className="tag">{ev.name}</div>
            <h2><Link href={href(lang, `noticias/${lead.slug}`)}>{tx(lead.title, lang)}</Link></h2>
            <p>{tx(lead.excerpt, lang)} {ev.venue}, {ev.city} · {fmtDate(ev.date, lang, { day: "numeric", month: "long" })}.</p>
            <div className={s.leadActions}>
              <Link className="btn btn-dark" href={href(lang, `eventos/${ev.slug}`)}>{t("home.watchNow")}</Link>
              <Link className="btn btn-outline" href={`${href(lang, "boletas")}?evento=${ev.slug}`}>{t("home.howToWatch")}</Link>
            </div>
          </div>
        </Reveal>
        <Reveal className={s.top} dir="left" delay={0.1}>
          <h2>{t("home.topStories")}</h2>
          <Stagger as="ol">
            {NEWS.slice(1, 7).map((n, i) => (
              <StaggerItem as="li" key={n.slug}>
                <Link href={href(lang, `noticias/${n.slug}`)}>
                  <span className={s.topNum}>{i + 1}</span>
                  <span>
                    <span className="tag">{n.category}</span>
                    <b>{tx(n.title, lang)}</b>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Carrusel de noticias ---------- */
export function DontMissSection({ lang }: { lang: Lang }) {
  const t = translator(lang);
  return (
    <section className="sec sec-dark">
      <div className="wrap">
        <Carousel title={t("home.dontMiss")} dark>
          {NEWS.map((n) => <NewsCard key={n.slug} item={n} lang={lang} variant="tall" />)}
        </Carousel>
      </div>
    </section>
  );
}

/* ---------- Roster (carrusel de peleadores) ---------- */
export function RosterSection({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const list = [...P4P.map((slug) => mustFighter(slug)), ...FIGHTERS.filter((f) => !P4P.includes(f.slug))].slice(0, 12);
  return (
    <section className={`sec sec-black ${s.roster}`}>
      <div className="arena-bg" style={{ opacity: 0.6 }} />
      <span className={`ghost-text ${s.rosterGhost}`} aria-hidden>Roster</span>
      <div className="wrap" style={{ position: "relative" }}>
        <Carousel title={t("home.roster")} kicker={t("home.rosterSub")} dark>
          {list.map((f) => <FighterCard key={f.slug} fighter={f} dark />)}
        </Carousel>
        <Reveal className={s.more}>
          <Link className="btn btn-ghost" href={href(lang, "peleadores")}>{t("f.seeAll")} →</Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Destacado ---------- */
export function FeaturedSection({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const igFighters = ["valentina-cardona", "jhon-valencia", "kevin-restrepo", "wilson-cordoba", "laura-henao", "juan-arango"].map(mustFighter);
  return (
    <section className="sec">
      <div className={`wrap ${s.featuredGrid}`}>
        <div>
          <Reveal className="sec-head"><h2>{t("home.featured")}</h2></Reveal>
          <Stagger className={s.featuredTop}>
            {NEWS.slice(0, 2).map((n) => <StaggerItem key={n.slug}><NewsCard item={n} lang={lang} /></StaggerItem>)}
          </Stagger>
          <Stagger className={s.featuredList}>
            {NEWS.slice(2, 6).map((n) => <StaggerItem key={n.slug}><NewsRow item={n} lang={lang} /></StaggerItem>)}
          </Stagger>
          <div className={s.more}>
            <Link className="btn btn-outline" href={href(lang, "noticias")}>— {t("home.moreContent")} —</Link>
          </div>
        </div>
        <aside className="side-col">
          <Reveal className={`panel ${s.ig}`} dir="left">
            <div className={s.igTop}>
              <Logo size="sm" round markOnly />
              <div><b>onetrue.inc</b><span>Instagram</span></div>
            </div>
            <InstagramFeed
              staticPosts={STATIC_IG_POSTS}
              fallback={
                <div className={s.igGrid}>
                  {igFighters.map((f) => <div key={f.slug} className={s.igCell}><Media fighters={[f]} /></div>)}
                </div>
              }
            />
            <h4>{t("home.followIg")}</h4>
            <p>{t("home.followIgText")}</p>
            <a className="btn btn-red btn-block" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">{t("home.followBtn")}</a>
          </Reveal>
          <Reveal className="panel" dir="left" delay={0.1}>
            <h4>{t("home.brands")}</h4>
            <div className={s.brandRow}><BrandBadge brand="trueboxing" /><p>{t("home.tbText")}</p></div>
            <div className={s.brandRow}><BrandBadge brand="trueknuckles" /><p>{t("home.tkText")}</p></div>
          </Reveal>
        </aside>
      </div>
    </section>
  );
}

/* ---------- Próximas carteleras ---------- */
export function UpcomingSection({ lang }: { lang: Lang }) {
  const t = translator(lang);
  return (
    <section className="sec sec-gray">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2>{t("home.upcoming")}</h2>
          <Link className="link-more" href={href(lang, "eventos")}>{t("ev.all")} →</Link>
        </Reveal>
        <Stagger className={s.eventGrid}>
          {upcomingEvents().map((e) => <StaggerItem key={e.slug}><EventCard event={e} lang={lang} /></StaggerItem>)}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------- En la mira ---------- */
export function SpotlightSection({ lang, slug = "kevin-restrepo" }: { lang: Lang; slug?: string }) {
  const t = translator(lang);
  const f = getFighter(slug) ?? FIGHTERS[0];
  const next = nextFightOf(f.slug);
  return (
    <section className={`sec sec-dark ${s.spot}`}>
      <span className="ghost-text" style={{ top: 40 }} aria-hidden>{f.nick}</span>
      <div className="wrap" style={{ position: "relative" }}>
        <Reveal className="sec-head"><h2>{t("home.spotlight")}</h2></Reveal>
        <div className={s.spotGrid}>
          <Reveal dir="right">
            <Link href={href(lang, `peleadores/${f.slug}`)} className={s.spotPhoto}>
              <FighterArt fighter={f} corner="red" />
            </Link>
          </Reveal>
          <Reveal className={s.spotInfo} delay={0.1}>
            <span className={s.spotDiv}>{tx(DIVISIONS[f.division].name, lang)} · <i className="dot-live" /> {t("f.active")}</span>
            <h3>{fullName(f)}</h3>
            <span className={s.spotNick}>&ldquo;{f.nick}&rdquo;</span>
            <div className={s.spotRec}>{recordStr(f)}<small>{t("f.wld")}</small></div>
            {next && (
              <div className={s.spotNext}>
                <span>{t("f.nextFight")}</span>
                <b>{next.event.name} · vs {fullName(next.opponent)}</b>
                <small>{fmtDate(next.event.date, lang)}</small>
              </div>
            )}
            <Link className="btn btn-red" href={href(lang, `peleadores/${f.slug}`)}>{t("f.profile")}</Link>
          </Reveal>
          <Reveal className={s.spotStats} delay={0.2}>
            <RingStat value={f.stats.accuracy} label={t("f.acc")} />
            <RingStat value={koRate(f)} label={t("f.koRate")} />
            <div className={s.statBoxes}>
              <div><b>{f.record.ko}</b><span>{t("f.ko")}</span></div>
              <div><b>{f.stats.perRound}</b><span>{t("f.ppr")}</span></div>
              <div><b>{f.reach}</b><span>{t("f.reach")}</span></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Noticias recientes ---------- */
export function RecentSection({ lang }: { lang: Lang }) {
  const t = translator(lang);
  return (
    <section className="sec">
      <div className="wrap">
        <Carousel title={t("home.recent")}>
          {[...NEWS].reverse().map((n) => <NewsCard key={n.slug} item={n} lang={lang} />)}
        </Carousel>
      </div>
    </section>
  );
}

export { s as homeStyles };
