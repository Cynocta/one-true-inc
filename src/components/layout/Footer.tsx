import Link from "next/link";
import { BrandBadge, Logo } from "@/components/ui/Brand";
import { Reveal } from "@/components/ui/motion";
import { SOCIAL } from "@/data/site";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { href } from "@/lib/format";
import { LangSwitch } from "./Header";
import s from "./Footer.module.css";

export function Footer({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const explore = [
    ["eventos", t("nav.events")],
    ["rankings", t("nav.rankings")],
    ["peleadores", t("nav.fighters")],
    ["noticias", t("nav.news")],
    ["boletas", t("nav.tickets")],
  ];
  return (
    <footer className={s.footer}>
      <div className={s.big} aria-hidden>
        <span>ONE TRUE</span>
      </div>
      <div className={`wrap ${s.grid}`}>
        <Reveal className={s.brand}>
          <Link href={href(lang)}><Logo size="lg" /></Link>
          <p>{t("foot.tagline")}</p>
          <div className={s.brands}>
            <BrandBadge brand="trueboxing" />
            <BrandBadge brand="trueknuckles" />
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h5>{t("foot.explore")}</h5>
          {explore.map(([p, label]) => <Link key={p} href={href(lang, p)}>{label}</Link>)}
        </Reveal>
        <Reveal delay={0.1}>
          <h5>{t("foot.company")}</h5>
          <Link href={href(lang, "contacto")}>{t("foot.about")}</Link>
          <Link href={href(lang, "contacto")}>{t("nav.contact")}</Link>
          <a href="#">{t("foot.terms")}</a>
          <a href="#">{t("foot.privacy")}</a>
        </Reveal>
        <Reveal delay={0.15}>
          <h5>{t("foot.follow")}</h5>
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={SOCIAL.threads} target="_blank" rel="noopener noreferrer">Threads</a>
          <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <h5 className={s.mt}>{t("foot.lang")}</h5>
          <LangSwitch />
        </Reveal>
      </div>
      <div className={s.bottom}>
        <div className="wrap">© {new Date().getFullYear()} One True Inc. {t("foot.rights")}</div>
      </div>
    </footer>
  );
}
