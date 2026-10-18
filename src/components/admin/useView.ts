"use client";

import { useMemo } from "react";
import { UNITS } from "@/components/tickets/venue";
import { getEventData, rangeStart, type EventData, type Order, type RangeId, type Zone } from "./data";
import { useAdmin, type EventSettings } from "./store";

export interface View {
  slug: string;
  data: EventData;
  /** Zonas con los cambios del panel aplicados (precios, reservas liberadas, bloqueos) */
  zones: (Zone & { blocked: number; available: number })[];
  /** Órdenes dentro del rango de fechas elegido */
  orders: Order[];
  daily: EventData["daily"];
  range: RangeId;
  blocked: Set<string>;
  checkedIn: number;
  settings: EventSettings;
  totals: { capacity: number; sold: number; held: number; revenue: number; orders: number; available: number };
}

export const DEFAULT_SETTINGS: EventSettings = { salesOpen: true, maxPerOrder: 10, holdMinutes: 10 };

export function useView(slug: string, range: RangeId): View {
  const { state } = useAdmin();
  return useMemo(() => {
    const data = getEventData(slug);
    const start = rangeStart(range);
    const blocked = new Set(state.blocked.filter((k) => k.startsWith(slug + ":")).map((k) => k.split(":")[1]));
    const zones = data.zones.map((z) => {
      const prices = state.prices[`${slug}:${z.id}`] ?? z.prices;
      const held = state.releasedHolds.includes(`${slug}:${z.id}`) ? 0 : z.held;
      const b = z.kind === "general" ? 0 : UNITS.filter((u) => u.zone === z.id && blocked.has(u.id) && !data.soldUnits.has(u.id)).length;
      return { ...z, prices, held, blocked: b, available: Math.max(0, z.capacity - z.sold - held - b) };
    });
    const orders = data.orders.filter((o) => o.at >= start);
    const daily = data.daily.filter((d) => d.date.getTime() + 86400000 > start);
    const checkedIn = [...data.tickets.keys()].filter((c) => state.checkins[c]).length;
    const persons = (z: Zone, n: number) => n * z.persons;
    const totals = {
      capacity: data.totals.capacity,
      sold: orders.reduce((s, o) => s + o.people, 0),
      held: zones.reduce((s, z) => s + persons(z, z.held), 0),
      revenue: orders.reduce((s, o) => s + o.total, 0),
      orders: orders.length,
      available: zones.reduce((s, z) => s + persons(z, z.available), 0),
    };
    return { slug, data, zones, orders, daily, range, blocked, checkedIn, settings: { ...DEFAULT_SETTINGS, ...state.settings[slug] }, totals };
  }, [slug, range, state.blocked, state.prices, state.releasedHolds, state.checkins, state.settings]);
}

export const cop = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");
export const fmtDateTime = (t: number) => new Date(t).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).replace(".", "");
export const ago = (t: number, now = Date.now()) => {
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h` : `${Math.round(h / 24)} d`;
};
