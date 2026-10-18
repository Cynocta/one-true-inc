import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import s from "@/components/pages/pages.module.css";
import { BrandBadge } from "@/components/ui/Brand";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/ui/PageHero";
import { SOCIAL } from "@/data/site";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: translator((await params).lang)("c.headerTitle") };
}

export default async function ContactPage({ params }: P) {
  const t = translator((await params).lang);
  const channels = [
    { name: "WhatsApp", sub: t("c.whatsapp"), url: SOCIAL.whatsapp },
    { name: "Instagram", sub: "@onetrue.inc", url: SOCIAL.instagram },
    { name: "Threads", sub: "@onetrue.inc", url: SOCIAL.threads },
  ];
  return (
    <>
      <PageHero title={t("c.headerTitle")} subtitle={t("c.headerSub")} />
      <section className="sec sec-gray">
        <div className={`wrap ${s.contactGrid}`}>
          <Reveal><ContactForm /></Reveal>
          <aside className="side-col">
            <Reveal className="panel" dir="left">
              <h4>{t("c.channels")}</h4>
              {channels.map((c) => (
                <a key={c.name} className={s.channel} href={c.url} target="_blank" rel="noopener noreferrer">
                  <span><b>{c.name}</b><span>{c.sub}</span></span>
                  <span aria-hidden>↗</span>
                </a>
              ))}
            </Reveal>
            <Reveal className="panel" dir="left" delay={0.1}>
              <h4>{t("home.brands")}</h4>
              <p style={{ margin: "0 0 12px" }}><BrandBadge brand="trueboxing" /></p>
              <p className="muted" style={{ marginTop: 0 }}>{t("home.tbText")}</p>
              <p style={{ margin: "20px 0 12px" }}><BrandBadge brand="trueknuckles" /></p>
              <p className="muted" style={{ margin: 0 }}>{t("home.tkText")}</p>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
