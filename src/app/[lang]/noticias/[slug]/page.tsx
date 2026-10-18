import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FighterArt } from "@/components/fighters/FighterArt";
import { NewsCard } from "@/components/news/News";
import s from "@/components/pages/pages.module.css";
import { Media } from "@/components/ui/Media";
import { Reveal, SplitText, Stagger, StaggerItem } from "@/components/ui/motion";
import { DIVISIONS } from "@/data/divisions";
import { NEWS } from "@/data/news";
import { SOCIAL } from "@/data/site";
import { translator } from "@/i18n";
import { LANGS, type Lang } from "@/i18n/config";
import { fullName, getFighter, getNews, recordStr } from "@/lib/data";
import { fmtDate, href, tx } from "@/lib/format";

type P = { params: Promise<{ lang: Lang; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.flatMap((lang) => NEWS.map((n) => ({ lang, slug: n.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const n = getNews(slug);
  return { title: n ? tx(n.title, lang) : "Noticia", description: n ? tx(n.excerpt, lang) : undefined };
}

export default async function ArticlePage({ params }: P) {
  const { lang, slug } = await params;
  const n = getNews(slug);
  if (!n) notFound();
  const t = translator(lang);
  const f = n.fighter ? getFighter(n.fighter) : undefined;

  return (
    <>
      <article className={s.article}>
        <div className="wrap narrow">
          <Reveal><Link className={s.back} href={href(lang, "noticias")}>← {t("n.back")}</Link></Reveal>
          <Reveal delay={0.05}><div className="tag">{n.category} · {fmtDate(n.date, lang, { day: "numeric", month: "long", year: "numeric" })} · 3 {t("n.minRead")}</div></Reveal>
          <h1><SplitText text={tx(n.title, lang)} delay={0.1} /></h1>
          <Reveal delay={0.4}><p className={s.articleLead}>{tx(n.excerpt, lang)}</p></Reveal>
        </div>
        <Reveal className={`wrap narrow`} delay={0.3}>
          <div className={s.articleMedia}><Media fighters={f ? [f] : []} label="1600×900 · foto / video" /></div>
        </Reveal>
        <div className={`wrap narrow ${s.articleBody}`}>
          <Reveal><p>{t("n.body")}</p></Reveal>
          <Reveal><p>{t("n.body")}</p></Reveal>
          {f && (
            <Reveal>
              <Link className={s.inlineFighter} href={href(lang, `peleadores/${f.slug}`)}>
                <div className={s.ifArt}><FighterArt fighter={f} /></div>
                <div>
                  <span>&ldquo;{f.nick}&rdquo;</span>
                  <b>{fullName(f)}</b>
                  <small>{tx(DIVISIONS[f.division].name, lang)} · {recordStr(f)}</small>
                </div>
                <em>{t("f.profile")} →</em>
              </Link>
            </Reveal>
          )}
          <Reveal><p>{t("n.body")}</p></Reveal>
          <div className={s.share}>
            <span>{t("n.share")}</span>
            <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </article>
      <section className="sec sec-gray">
        <div className="wrap">
          <Reveal className="sec-head"><h2>{t("n.more")}</h2></Reveal>
          <Stagger className={s.newsGrid}>
            {NEWS.filter((x) => x.slug !== n.slug).slice(0, 4).map((x) => <StaggerItem key={x.slug}><NewsCard item={x} lang={lang} /></StaggerItem>)}
          </Stagger>
        </div>
      </section>
    </>
  );
}
