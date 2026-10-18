/**
 * GENERADOR DE DATOS DE EJEMPLO DEL PANEL (determinístico por evento).
 * Todo sale de una sola lista de órdenes, así los números siempre cuadran:
 * órdenes → boletas → ventas por día → mapa → medios de pago → peleadores.
 * Con backend, este archivo se reemplaza por consultas a la base de datos.
 */
import { EVENTS } from "@/data/events";
import { FIGHTERS } from "@/data/fighters";
import { PRICE_PHASES, TICKETS } from "@/data/site";
import { UNITS } from "@/components/tickets/venue";
import type { FightEvent } from "@/types";

/* ---------------- RNG con semilla ---------------- */
function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pickW = <T,>(rng: () => number, items: [T, number][]) => { const tot = items.reduce((s, [, w]) => s + w, 0); let r = rng() * tot; for (const [v, w] of items) { if ((r -= w) <= 0) return v; } return items[items.length - 1][0]; };

/* ---------------- Tipos ---------------- */
export type Method = "Tarjeta" | "PSE" | "Nequi";
export interface Zone { id: string; name: string; color: string; kind: "general" | "seat" | "box"; persons: number; capacity: number; sold: number; held: number; prices: [number, number, number] }
export interface Ticket { code: string; orderId: string; holder: string; zoneId: string; unit?: string; index: number; of: number }
export interface Order {
  id: string; at: number; buyer: string; email: string; phone: string; doc: string;
  zoneId: string; qty: number; people: number; units: string[]; unitPrice: number; addons: { label: string; qty: number; price: number }[];
  total: number; method: Method; ref?: string; phase: number; tickets: Ticket[];
}
export interface EventData {
  event: FightEvent; zones: Zone[]; orders: Order[]; tickets: Map<string, Ticket>;
  daily: { date: Date; tickets: number; revenue: number }[]; hours: number[]; now: number;
  soldUnits: Set<string>; totals: { capacity: number; sold: number; held: number; revenue: number; orders: number };
  funnel: { label: string; value: number }[]; markers: { date: Date; label: string }[];
}

const BASE_SOLD: Record<string, number> = { "palco-platino": 9, "palco-vip": 5, ringside: 30, vip: 168, preferencial: 205, general: 412 };
const BASE_HELD: Record<string, number> = { "palco-platino": 1, "palco-vip": 0, ringside: 3, vip: 6, preferencial: 9, general: 14 };
const CAPACITY: Record<string, number> = { vip: 240, preferencial: 400, general: 900 };
const PROFILES: Record<string, { fill: number; days: number; announce?: number }> = {
  "trueboxing-5": { fill: 1, days: 26, announce: 16 },
  "trueknuckles-2": { fill: 0.34, days: 12, announce: 3 },
  "trueboxing-6": { fill: 0.08, days: 6 },
};

const FIRST = ["Camila", "Andrés", "Sofía", "Juan", "Valeria", "Santiago", "Mariana", "Daniel", "Laura", "Mateo", "Isabella", "Sebastián", "Natalia", "Felipe", "Daniela", "Alejandro", "Paula", "Nicolás", "Manuela", "Carlos", "Juliana", "David", "Gabriela", "Esteban", "Luisa", "Tomás", "Sara", "Miguel", "Antonia", "Simón"];
const LAST = ["Restrepo", "Gómez", "Ramírez", "Vélez", "Ochoa", "Castaño", "Zapata", "Mejía", "Arango", "Jaramillo", "Henao", "Cardona", "Montoya", "Giraldo", "Londoño", "Salazar", "Quintero", "Muñoz", "Ríos", "Agudelo"];
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const DAY = 86400000;
export const NOW = new Date("2026-10-10T18:00:00-05:00").getTime();

const phaseAt = (t: number) => { const i = PRICE_PHASES.findIndex((p) => p.until && t <= new Date(p.until).getTime()); return i === -1 ? PRICE_PHASES.length - 1 : i; };

const cache = new Map<string, EventData>();

export function getEventData(slug: string): EventData {
  const hit = cache.get(slug);
  if (hit) return hit;
  const event = EVENTS.find((e) => e.slug === slug)!;
  const prof = PROFILES[slug] ?? { fill: 0.1, days: 5 };
  const rng = mulberry32(hash(slug));

  const zones: Zone[] = TICKETS.map((z) => {
    const units = UNITS.filter((u) => u.zone === z.id).length;
    const capacity = units || CAPACITY[z.id];
    return {
      id: z.id, name: z.name.es, color: z.color, kind: z.kind, persons: z.persons ?? 1, capacity, prices: z.prices,
      sold: Math.min(capacity, Math.round(BASE_SOLD[z.id] * prof.fill)),
      held: Math.round(BASE_HELD[z.id] * Math.max(prof.fill, 0.3)),
    };
  });

  // Unidades (palcos/sillas) en orden salteado para que el mapa se vea natural
  const unitQueue: Record<string, string[]> = {};
  for (const zid of ["palco-platino", "palco-vip", "ringside"]) {
    const list = UNITS.filter((u) => u.zone === zid);
    const order: string[] = [];
    for (let i = 0; order.length < list.length && i < list.length * 4; i++) { const u = list[(i * 7) % list.length]; if (!order.includes(u.id)) order.push(u.id); }
    unitQueue[zid] = order;
  }

  // Pesos por día: base + pico en el anuncio + crecimiento al final
  const start = NOW - (prof.days - 1) * DAY;
  const weights: [number, number][] = Array.from({ length: prof.days }, (_, d) => {
    let w = 1 + rng() * 0.6 + d * 0.04;
    if (prof.announce !== undefined) { const k = d - prof.announce; if (k >= 0 && k < 4) w *= [6, 7.5, 4, 2.6][k]; }
    if (d >= prof.days - 4) w *= 2;
    return [d, w];
  });

  const fighterPool: [string, number][] = [
    [event.main[0].a, 6], [event.main[0].b, 5],
    ...(event.main[1] ? [[event.main[1].a, 4], [event.main[1].b, 3]] as [string, number][] : []),
    ...event.main.slice(2).flatMap((b) => [[b.a, 1.2], [b.b, 1]] as [string, number][]),
  ];

  const raw: Omit<Order, "id" | "tickets">[] = [];
  for (const z of zones) {
    let remaining = z.sold;
    while (remaining > 0) {
      const qty = z.kind === "box" ? 1 : Math.min(remaining, pickW(rng, [[1, 3], [2, 5], [3, 2], [4, 1.5], [6, 0.5]]));
      remaining -= qty;
      const day = pickW(rng, weights);
      const at = Math.min(NOW - 60000, start + day * DAY - 5 * 3600000 + (8 + rng() * 15.5) * 3600000);
      const first = FIRST[Math.floor(rng() * FIRST.length)], last = LAST[Math.floor(rng() * LAST.length)];
      const phase = phaseAt(at);
      const unitPrice = z.prices[phase];
      const people = qty * z.persons;
      const addons: Order["addons"] = [];
      if (rng() < 0.2) addons.push({ label: "Parqueadero", qty: 1, price: 25000 });
      if (rng() < 0.11) addons.push({ label: "Camiseta oficial", qty: 1 + Math.floor(rng() * 2), price: 90000 });
      if (rng() < 0.04) addons.push({ label: "Foto con peleador", qty: 1, price: 60000 });
      const units = z.kind === "general" ? [] : unitQueue[z.id].splice(0, qty);
      raw.push({
        at, buyer: `${first} ${last}`, email: `${plain(first)}.${plain(last)}${Math.floor(rng() * 90 + 10)}@example.com`,
        phone: `3${Math.floor(rng() * 3) + 0}${Math.floor(rng() * 10)} *** **${String(Math.floor(rng() * 100)).padStart(2, "0")}`,
        doc: `CC ***${String(Math.floor(rng() * 10000)).padStart(4, "0")}`,
        zoneId: z.id, qty, people, units, unitPrice, addons,
        total: unitPrice * qty + addons.reduce((s, a) => s + a.qty * a.price, 0),
        method: pickW<Method>(rng, [["Tarjeta", 46], ["PSE", 31], ["Nequi", 23]]),
        ref: rng() < 0.42 ? pickW(rng, fighterPool) : undefined,
        phase,
      });
    }
  }
  raw.sort((a, b) => a.at - b.at);

  const tickets = new Map<string, Ticket>();
  const code = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rng() * 32)]).join("");
  const orders: Order[] = raw.map((o, i) => {
    const id = `OT-${String(hash(slug) % 90 + 10)}${String(1000 + i).padStart(4, "0")}`;
    const z = zones.find((x) => x.id === o.zoneId)!;
    const list: Ticket[] = Array.from({ length: o.people }, (_, k) => {
      const t: Ticket = {
        code: code(), orderId: id, zoneId: o.zoneId, index: k + 1, of: o.people,
        holder: k === 0 ? o.buyer : `Invitado ${k + 1} · ${o.buyer.split(" ")[0]}`,
        unit: o.units.length ? o.units[Math.floor(k / z.persons)] : undefined,
      };
      tickets.set(t.code, t);
      return t;
    });
    return { ...o, id, tickets: list };
  });

  const daily = Array.from({ length: prof.days }, (_, d) => ({ date: new Date(start + d * DAY), tickets: 0, revenue: 0 }));
  const hours = Array(24).fill(0);
  for (const o of orders) {
    const d = Math.min(prof.days - 1, Math.max(0, Math.floor((o.at - start + 5 * 3600000) / DAY)));
    daily[d].tickets += o.people;
    daily[d].revenue += o.total;
    hours[(new Date(o.at).getUTCHours() + 19) % 24] += o.people; // hora de Bogotá (UTC-5)
  }

  const soldUnits = new Set(orders.flatMap((o) => o.units));
  const sold = orders.reduce((s, o) => s + o.people, 0);
  const totals = {
    capacity: zones.reduce((s, z) => s + z.capacity * z.persons, 0),
    sold,
    held: zones.reduce((s, z) => s + z.held * z.persons, 0),
    revenue: orders.reduce((s, o) => s + o.total, 0),
    orders: orders.length,
  };
  const funnel = [
    { label: "Visitas a la página del evento", value: Math.round(orders.length * 31.6) },
    { label: "Eligieron zona", value: Math.round(orders.length * 11.9) },
    { label: "Llegaron al pago", value: Math.round(orders.length * 2.55) },
    { label: "Pagos aprobados", value: orders.length },
  ];
  const markers = prof.announce !== undefined ? [{ date: daily[prof.announce].date, label: "Anuncio cartelera" }] : [];

  const data: EventData = { event, zones, orders, tickets, daily, hours, now: NOW, soldUnits, totals, funnel, markers };
  cache.set(slug, data);
  return data;
}

/** Busca una boleta en todos los eventos (para detectar "boleta de otro evento" en la puerta) */
export function findTicketAnywhere(code: string): { slug: string; ticket: Ticket } | null {
  for (const e of EVENTS.filter((x) => x.status === "upcoming")) {
    const t = getEventData(e.slug).tickets.get(code);
    if (t) return { slug: e.slug, ticket: t };
  }
  return null;
}

export const fighterName = (slug?: string) => {
  if (!slug) return "Directo";
  const f = FIGHTERS.find((x) => x.slug === slug);
  return f ? `${f.first} ${f.last}` : slug;
};

export const RANGES = [
  { id: "today", label: "Hoy", days: 1 },
  { id: "7d", label: "7 días", days: 7 },
  { id: "30d", label: "30 días", days: 30 },
  { id: "all", label: "Toda la venta", days: 3650 },
] as const;
export type RangeId = (typeof RANGES)[number]["id"];
export const rangeStart = (range: RangeId) => {
  const days = RANGES.find((r) => r.id === range)!.days;
  const d = new Date(NOW); d.setHours(0, 0, 0, 0);
  return d.getTime() - (days - 1) * DAY;
};
