import Link from "next/link";
import { FighterArt } from "@/components/fighters/FighterArt";
import { BrandBadge } from "@/components/ui/Brand";
import { translator } from "@/i18n";
import type { Lang } from "@/i18n/config";
import { mustFighter } from "@/lib/data";
import { fmtDate, fmtTime, href } from "@/lib/format";
import type { FightEvent } from "@/types";
import s from "./events.module.css";

export function EventCard({ event: e, lang, wide = false }: { event: FightEvent; lang: Lang; wide?: boolean }) {
  const t = translator(lang);
  const a = mustFighter(e.main[0].a);
  const b = mustFighter(e.main[0].b);
  const past = e.status === "past";
  const link = href(lang, `eventos/${e.slug}`);

  return (
    <article className={`${s.card} ${wide ? s.cardWide : ""} ${e.brand === "trueknuckles" ? s.tk : ""}`}>
      <Link href={link} className={s.cardMedia}>
        <div className={s.cardBg} />
        <span className={s.cardVs} aria-hidden>VS</span>
        <div className={`${s.cardFighter} ${s.cardA}`}><FighterArt fighter={a} corner="red" /></div>
        <div className={`${s.cardFighter} ${s.cardB}`}><FighterArt fighter={b} corner="blue" flip /></div>
        <div className={s.cardBrand}><BrandBadge brand={e.brand} /></div>
        {past && <span className={s.cardPast}>{t("ev.ended")}</span>}
      </Link>
      <div className={s.cardBody}>
        <span className={s.cardName}>{e.name}</span>
        <h3 className={s.cardHead}>
          <Link href={link}>{a.last} <em>vs</em> {b.last}</Link>
        </h3>
        <div className={s.cardMeta}>
          <span>{fmtDate(e.date, lang)} · {fmtTime(e.date, lang)}</span>
          <span>{e.venue} · {e.city}</span>
        </div>
        <div className={s.cardActions}>
          <Link className="btn btn-dark" href={link}>{past ? t("ev.results") : t("ev.details")}</Link>
          {!past && <Link className="btn btn-red" href={`${href(lang, "boletas")}?evento=${e.slug}`}>{t("ev.tickets")}</Link>}
        </div>
      </div>
    </article>
  );
}
