import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FighterArt } from "@/components/fighters/FighterArt";
import { NewsCard } from "@/components/news/News";
import s from "@/components/pages/pages.module.css";
import { BrandBadge } from "@/components/ui/Brand";
import { CountUp, Reveal, SplitText, Stagger, StaggerItem } from "@/components/ui/motion";
import { RingStat, StatBar } from "@/components/ui/Stats";
import { DIVISIONS } from "@/data/divisions";
import { FIGHTERS } from "@/data/fighters";
import { NEWS } from "@/data/news";
import { translator } from "@/i18n";
import { LANGS, type Lang } from "@/i18n/config";
import { fighterHistory, fullName, getFighter, koRate } from "@/lib/data";
import { fmtDate, href, tx } from "@/lib/format";

type P = { params: Promise<{ lang: Lang; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.flatMap((lang) => FIGHTERS.map((f) => ({ lang, slug: f.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const f = getFighter((await params).slug);
  return { title: f ? `${fullName(f)} "${f.nick}"` : "Peleador" };
}

export default async function FighterPage({ params }: P) {
  const { lang, slug } = await params;
  const f = getFighter(slug);
  if (!f) notFound();
  const t = translator(lang);
  const div = DIVISIONS[f.division];
  const hist = fighterHistory(f.slug);
  const next = hist.filter((h) => !h.result).at(-1);
  const related = NEWS.filter((n) => n.fighter === f.slug);
  const total = f.record.w + f.record.l + f.record.d;

  return (
    <>
      <section className={s.athHero}>
        <div className="arena-bg" />
        <div className="grain" />
        <span className="ghost-text" style={{ bottom: "6%" }} aria-hidden>{f.last}</span>
        <div className={`wrap ${s.athGrid}`}>
          <div className={s.athCopy}>
            <Reveal><span className={s.athDiv}>{tx(div.name, lang)} · <i className="dot-live" /> {t("f.active")}</span></Reveal>
            <Reveal delay={0.1}>
              {f.rank === 0 ? <span className="belt belt-lg">★ {t(div.women ? "f.championF" : "f.champion")}</span> : <span className={s.athRank}>#{f.rank} · {tx(div.name, lang)}</span>}
            </Reveal>
            <Reveal delay={0.15}><span className={s.athNick}>&ldquo;{f.nick}&rdquo;</span></Reveal>
            <h1>
              <SplitText text={f.first} delay={0.2} />
              <strong><SplitText text={f.last} by="char" delay={0.35} /></strong>
            </h1>
            <Reveal delay={0.5} className={s.athRec}>
              <div><b><CountUp to={f.record.w} /></b><span>{t("f.wins")}</span></div>
              <div><b><CountUp to={f.record.l} /></b><span>{t("f.losses")}</span></div>
              <div><b><CountUp to={f.record.d} /></b><span>{t("f.draws")}</span></div>
              <div><b><CountUp to={f.record.ko} /></b><span>{t("f.ko")}</span></div>
            </Reveal>
          </div>
          <Reveal className={s.athPhoto} dir="left" delay={0.2}>
            <FighterArt fighter={f} corner="red" />
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className={`wrap ${s.athBody}`}>
          <div>
            <Reveal><h2 className="title-bar">{t("f.stats")}</h2></Reveal>
            <Reveal className={s.statPanel}>
              <RingStat value={f.stats.accuracy} label={t("f.acc")} />
              <RingStat value={f.stats.defense} label={t("f.def")} />
              <RingStat value={koRate(f)} label={t("f.koRate")} />
            </Reveal>
            <div className={s.bars}>
              <StatBar label={t("f.wins")} value={f.record.w} max={total} />
              <StatBar label={t("f.losses")} value={f.record.l} max={total} />
              <StatBar label={t("f.draws")} value={f.record.d} max={total} />
              <StatBar label={t("f.ko")} value={f.record.ko} max={total} />
              <StatBar label={t("f.ppr")} value={f.stats.perRound} max={100} />
            </div>

            <Reveal><h2 className="title-bar">{t("f.history")}</h2></Reveal>
            {hist.length ? (
              <Reveal className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>{t("f.result")}</th><th>{t("f.opponent")}</th><th>{t("f.event")}</th><th>{t("ev.method")}</th><th>{t("ev.round")}</th></tr>
                  </thead>
                  <tbody>
                    {hist.map((h, i) => (
                      <tr key={i}>
                        <td>{h.result ? <span className={`res res-${h.result}`}>{t(h.result === "W" ? "f.W" : "f.L")}</span> : <span className="res res-n">{fmtDate(h.event.date, lang, { day: "numeric", month: "short" })}</span>}</td>
                        <td><Link href={href(lang, `peleadores/${h.opponent.slug}`)}>{fullName(h.opponent)}</Link></td>
                        <td><Link href={href(lang, `eventos/${h.event.slug}`)}>{h.event.name}</Link></td>
                        <td>{h.bout.result?.method ?? "—"}</td>
                        <td>{h.bout.result ? `R${h.bout.result.round} · ${h.bout.result.time}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
            ) : <p className="muted">{t("f.noHistory")}</p>}
          </div>

          <aside className="side-col">
            <Reveal className={`panel ${s.bio}`} dir="left">
              <h4>{t("f.info")}</h4>
              <dl>
                <div><dt>{t("f.division")}</dt><dd>{tx(div.name, lang)}<small>{div.limit}</small></dd></div>
                <div><dt>{t("f.hometown")}</dt><dd>{f.city}, {f.country}</dd></div>
                <div><dt>{t("f.age")}</dt><dd>{f.age}</dd></div>
                <div><dt>{t("f.height")}</dt><dd>{f.height}</dd></div>
                <div><dt>{t("f.reach")}</dt><dd>{f.reach}</dd></div>
                <div><dt>{t("f.stance")}</dt><dd>{t(f.stance === "orthodox" ? "f.orthodox" : "f.southpaw")}</dd></div>
              </dl>
            </Reveal>
            {next && (
              <Reveal dir="left" delay={0.1}>
                <Link href={href(lang, `eventos/${next.event.slug}`)} className={s.next}>
                  <div className={s.nextOpp}><FighterArt fighter={next.opponent} corner="blue" flip /></div>
                  <span>{t("f.nextFight")}</span>
                  <BrandBadge brand={next.event.brand} />
                  <b>{next.event.name}</b>
                  <strong>vs {fullName(next.opponent)}</strong>
                  <small>{fmtDate(next.event.date, lang)} · {next.event.venue}</small>
                </Link>
              </Reveal>
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="sec sec-gray">
          <div className="wrap">
            <Reveal className="sec-head"><h2>{t("f.related")}</h2></Reveal>
            <Stagger className={s.newsGrid}>
              {related.map((n) => <StaggerItem key={n.slug}><NewsCard item={n} lang={lang} /></StaggerItem>)}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
