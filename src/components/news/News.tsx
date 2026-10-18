import Link from "next/link";
import { Media } from "@/components/ui/Media";
import type { Lang } from "@/i18n/config";
import { getFighter } from "@/lib/data";
import { fmtDate, href, tx } from "@/lib/format";
import type { NewsItem } from "@/types";
import s from "./news.module.css";

const fightersOf = (n: NewsItem) => {
  const f = n.fighter ? getFighter(n.fighter) : undefined;
  return f ? [f] : [];
};

export function NewsCard({ item: n, lang, variant = "default" }: { item: NewsItem; lang: Lang; variant?: "default" | "tall" | "lead" | "dark" }) {
  return (
    <Link href={href(lang, `noticias/${n.slug}`)} className={`${s.card} ${s[variant]}`}>
      <div className={s.media}>
        <Media fighters={fightersOf(n)} label="1280×720" />
        <span className={s.play} aria-hidden>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
        </span>
      </div>
      <div className={s.body}>
        <div className="tag">{n.category}</div>
        <h3>{tx(n.title, lang)}</h3>
        {variant === "lead" && <p>{tx(n.excerpt, lang)}</p>}
      </div>
    </Link>
  );
}

export function NewsRow({ item: n, lang }: { item: NewsItem; lang: Lang }) {
  return (
    <Link href={href(lang, `noticias/${n.slug}`)} className={s.row}>
      <div className={s.rowMedia}><Media fighters={fightersOf(n)} label="800×450" /></div>
      <div className={s.rowBody}>
        <div className="tag">{n.category} · {fmtDate(n.date, lang, { day: "numeric", month: "short" })}</div>
        <h3>{tx(n.title, lang)}</h3>
        <p>{tx(n.excerpt, lang)}</p>
      </div>
    </Link>
  );
}
