import type { Metadata } from "next";
import { FighterGrid } from "@/components/fighters/FighterGrid";
import { PageHero } from "@/components/ui/PageHero";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: translator((await params).lang)("f.headerTitle") };
}

export default async function FightersPage({ params }: P) {
  const t = translator((await params).lang);
  return (
    <>
      <PageHero title={t("f.headerTitle")} subtitle={t("f.headerSub")} />
      <section className="sec sec-gray">
        <div className="wrap">
          <FighterGrid />
        </div>
      </section>
    </>
  );
}
