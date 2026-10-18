import type { Metadata } from "next";
import { NewsFilter } from "@/components/news/NewsFilter";
import { NewsCard } from "@/components/news/News";
import s from "@/components/pages/pages.module.css";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/ui/PageHero";
import { NEWS } from "@/data/news";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: translator((await params).lang)("n.headerTitle") };
}

export default async function NewsPage({ params }: P) {
  const { lang } = await params;
  const t = translator(lang);
  return (
    <>
      <PageHero title={t("n.headerTitle")} subtitle={t("n.headerSub")} />
      <section className="sec sec-gray">
        <div className="wrap">
          <Reveal className={s.newsLead}>
            <NewsCard item={NEWS[0]} lang={lang} variant="lead" />
            <div className={s.newsLeadSide}>
              {NEWS.slice(1, 3).map((n) => <NewsCard key={n.slug} item={n} lang={lang} />)}
            </div>
          </Reveal>
          <NewsFilter
            allLabel={t("f.all")}
            items={NEWS.map((n) => ({ key: n.slug, category: n.category, node: <NewsCard item={n} lang={lang} /> }))}
          />
        </div>
      </section>
    </>
  );
}
