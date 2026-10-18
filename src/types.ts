import type { Lang } from "@/i18n/config";

/** Texto bilingüe */
export type L10n = Record<Lang, string>;

export type DivisionKey = "flyw" | "feather" | "light" | "welter" | "middle" | "heavy";

export interface Division {
  key: DivisionKey;
  name: L10n;
  limit: string;
  women?: boolean;
}

export type Stance = "orthodox" | "southpaw";
export type HairStyle = "buzz" | "short" | "bald" | "mohawk" | "curly" | "ponytail" | "braids" | "bun";

/** Rasgos de la ilustración placeholder del peleador (se reemplaza por foto real) */
export interface FighterLook {
  skin: 0 | 1 | 2 | 3 | 4 | 5;
  hair: HairStyle;
  hairColor?: string;
  beard?: boolean;
  trunks: string; // color de pantaloneta
  gloves?: string; // color de guantes
}

export interface Fighter {
  slug: string;
  first: string;
  last: string;
  nick: string;
  division: DivisionKey;
  /** 0 = campeón, 1..n = posición */
  rank: number;
  record: { w: number; l: number; d: number; ko: number };
  country: string;
  city: string;
  age: number;
  height: string;
  reach: string;
  stance: Stance;
  stats: { accuracy: number; defense: number; perRound: number };
  look: FighterLook;
  /** Foto del peleador (URL o ruta en /public). Sin foto se muestra la ilustración. */
  photo?: string;
}

export type Brand = "trueboxing" | "trueknuckles";
export type Method = "KO" | "TKO" | "DEC" | "SD" | "DQ";

export interface Bout {
  a: string;
  b: string;
  division: DivisionKey;
  rounds: number;
  title?: boolean;
  result?: { winner: "a" | "b"; method: Method; round: number; time: string };
}

export interface FightEvent {
  slug: string;
  brand: Brand;
  name: string;
  status: "upcoming" | "past";
  date: string;
  venue: string;
  city: string;
  tagline: L10n;
  main: Bout[];
  prelims: Bout[];
}

export interface NewsItem {
  slug: string;
  category: string;
  date: string;
  fighter?: string;
  title: L10n;
  excerpt: L10n;
}

/**
 * Zona de boletería.
 * kind: "general" = se compra por cantidad · "seat" = se elige silla (ringside) · "box" = se elige palco completo
 */
export interface TicketZone {
  id: string;
  name: L10n;
  /** Precio por etapa: [Etapa 1, Etapa 2, Full] (COP). Para palcos es el precio del palco completo. */
  prices: [number, number, number];
  perks: Record<Lang, string[]>;
  kind: "general" | "seat" | "box";
  /** Personas por palco (solo kind = "box") */
  persons?: number;
  /** Color de la zona en el mapa */
  color: string;
  featured?: boolean;
}

export interface PricePhase {
  id: string;
  name: L10n;
  /** Fecha límite (ISO). null = última etapa */
  until: string | null;
}
