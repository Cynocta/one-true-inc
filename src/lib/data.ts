/** Consultas sobre los datos. Si más adelante se usa un CMS o API, solo hay que cambiar este archivo. */
import { EVENTS } from "@/data/events";
import { FIGHTERS } from "@/data/fighters";
import { NEWS } from "@/data/news";
import type { Bout, DivisionKey, Fighter, FightEvent } from "@/types";

export const getFighter = (slug: string) => FIGHTERS.find((f) => f.slug === slug);
export const mustFighter = (slug: string): Fighter => {
  const f = getFighter(slug);
  if (!f) throw new Error(`Fighter not found: ${slug}`);
  return f;
};
export const getEvent = (slug: string) => EVENTS.find((e) => e.slug === slug);
export const getNews = (slug: string) => NEWS.find((n) => n.slug === slug);

export const upcomingEvents = () =>
  EVENTS.filter((e) => e.status === "upcoming").sort((a, b) => +new Date(a.date) - +new Date(b.date));
export const pastEvents = () =>
  EVENTS.filter((e) => e.status === "past").sort((a, b) => +new Date(b.date) - +new Date(a.date));
export const nextEvent = () => upcomingEvents()[0];

export const fightersByDivision = (div: DivisionKey) =>
  FIGHTERS.filter((f) => f.division === div).sort((a, b) => a.rank - b.rank);

export const champions = () => FIGHTERS.filter((f) => f.rank === 0);

export const fullName = (f: Fighter) => `${f.first} ${f.last}`;
export const recordStr = (f: Fighter) => `${f.record.w}-${f.record.l}-${f.record.d}`;
export const koRate = (f: Fighter) => (f.record.w ? Math.round((f.record.ko / f.record.w) * 100) : 0);

export interface HistoryRow {
  event: FightEvent;
  bout: Bout;
  opponent: Fighter;
  result: "W" | "L" | null;
}

export function fighterHistory(slug: string): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const event of EVENTS) {
    for (const bout of [...event.main, ...event.prelims]) {
      if (bout.a !== slug && bout.b !== slug) continue;
      const me = bout.a === slug ? "a" : "b";
      rows.push({
        event,
        bout,
        opponent: mustFighter(me === "a" ? bout.b : bout.a),
        result: bout.result ? (bout.result.winner === me ? "W" : "L") : null,
      });
    }
  }
  return rows.sort((x, y) => +new Date(y.event.date) - +new Date(x.event.date));
}

export const nextFightOf = (slug: string) => fighterHistory(slug).filter((h) => !h.result).at(-1);
