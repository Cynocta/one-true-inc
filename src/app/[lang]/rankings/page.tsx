import type { Metadata } from "next";
import Link from "next/link";
import { FighterArt } from "@/components/fighters/FighterArt";
import s from "@/components/pages/pages.module.css";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHero } from "@/components/ui/PageHero";
import { DIVISION_ORDER, DIVISIONS } from "@/data/divisions";
import { P4P } from "@/data/fighters";
import { NEWS } from "@/data/news";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { fightersByDivision, fullName, mustFighter, recordStr } from "@/lib/data";
import { fmtDate, href, tx } from "@/lib/format";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: translator((await params).lang)("r.headerTitle") };
}

export default async function RankingsPage({ params }: P) {
  const { lang } = await params;
  const t = translator(lang);

  return (
    <>
      <PageHero title={t("r.headerTitle")} subtitle={t("r.headerSub")}>
        <p style={{ color: "var(--red)", fontSize: 14, marginTop: 10 }}>{t("r.updated")}: {fmtDate(NEWS[0].date, lang, { day: "numeric", month: "long", year: "numeric" })}</p>
      </PageHero>
      <section className="sec sec-gray">
        <Stagger className={`wrap ${s.rankGrid}`}>
          <StaggerItem className={`${s.rankCard} ${s.p4p}`}>
            <div className={s.rankHead}><h3>{t("r.p4p")}</h3></div>
            <ol className={s.rankList}>
              {P4P.map((slug, i) => {
                const f = mustFighter(slug);
                return (
                  <li key={slug}>
                    <Link href={href(lang, `peleadores/${slug}`)}>
                      <span className={s.rk}>{i + 1}</span>
                      <span className={s.mini}><FighterArt fighter={f} /></span>
                      <span className={s.rankName}>{fullName(f)}</span>
                      <small>{tx(DIVISIONS[f.division].name, lang)}</small>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </StaggerItem>

          {DIVISION_ORDER.map((k) => {
            const list = fightersByDivision(k);
            const champ = list.find((f) => f.rank === 0);
            return (
              <StaggerItem key={k} className={s.rankCard}>
                <div className={s.rankHead}><h3>{tx(DIVISIONS[k].name, lang)}</h3><small>{DIVISIONS[k].limit}</small></div>
                {champ && (
                  <Link href={href(lang, `peleadores/${champ.slug}`)} className={s.champ}>
                    <div className={s.champArt}><FighterArt fighter={champ} corner="red" /></div>
                    <div>
                      <span className="belt">★ {t(DIVISIONS[k].women ? "f.championF" : "f.champion")}</span>
                      <b>{champ.first}<br />{champ.last}</b>
                      <small>{recordStr(champ)}</small>
                    </div>
                  </Link>
                )}
                <ol className={s.rankList}>
                  {list.filter((f) => f.rank > 0).map((f) => (
                    <li key={f.slug}>
                      <Link href={href(lang, `peleadores/${f.slug}`)}>
                        <span className={s.rk}>{f.rank}</span>
                        <span className={s.mini}><FighterArt fighter={f} /></span>
                        <span className={s.rankName}>{fullName(f)}</span>
                        <small>{recordStr(f)}</small>
                      </Link>
                    </li>
                  ))}
                </ol>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </>
  );
}
