import type { Metadata } from "next";
import { Suspense } from "react";
import { TicketsView } from "@/components/tickets/TicketsView";
import { PageHero } from "@/components/ui/PageHero";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: translator((await params).lang)("t.headerTitle") };
}

export default async function TicketsPage({ params }: P) {
  const t = translator((await params).lang);
  return (
    <>
      <PageHero title={t("t.headerTitle")} subtitle={t("t.headerSub")} />
      <section className="sec sec-gray">
        <div className="wrap">
          <Suspense>
            <TicketsView />
          </Suspense>
        </div>
      </section>
    </>
  );
}
