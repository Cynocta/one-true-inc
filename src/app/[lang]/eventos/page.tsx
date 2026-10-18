import type { Metadata } from "next";
import { EventCard } from "@/components/events/EventCard";
import { Tabs } from "@/components/events/EventTabs";
import es from "@/components/events/events.module.css";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHero } from "@/components/ui/PageHero";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { pastEvents, upcomingEvents } from "@/lib/data";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: translator((await params).lang)("ev.headerTitle") };
}

export default async function EventsPage({ params }: P) {
  const { lang } = await params;
  const t = translator(lang);
  const list = (events: ReturnType<typeof upcomingEvents>) => (
    <Stagger className={es.list}>
      {events.map((e) => <StaggerItem key={e.slug}><EventCard event={e} lang={lang} wide /></StaggerItem>)}
    </Stagger>
  );
  return (
    <>
      <PageHero title={t("ev.headerTitle")} subtitle={t("ev.headerSub")} />
      <section className="sec sec-gray">
        <div className="wrap">
          <Tabs tabs={[
            { id: "upcoming", label: t("ev.upcoming"), content: list(upcomingEvents()) },
            { id: "past", label: t("ev.past"), content: list(pastEvents()) },
          ]} />
        </div>
      </section>
    </>
  );
}
