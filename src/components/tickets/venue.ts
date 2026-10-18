/**
 * Geometría del recinto (basada en el mapa de TrueBoxing 4 · Distrito Palmas).
 * Coordenadas en el viewBox 0 0 1000 760 del <VenueMap>.
 * Las unidades "seat" (sillas ringside) y "box" (palcos) se venden individualmente.
 *
 * SOLD = vendidos de EJEMPLO. Con backend, esto viene del inventario en tiempo real.
 */

export interface Unit {
  id: string;
  zone: "palco-platino" | "palco-vip" | "ringside";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
}

const units: Unit[] = [];

// Palcos Platino superiores (A13–A16)
[["A13", 60], ["A14", 190], ["A15", 690], ["A16", 820]].forEach(([id, x]) =>
  units.push({ id: id as string, zone: "palco-platino", label: id as string, x: x as number, y: 34, w: 120, h: 60 }));

// Palcos Platino 1–12 en arco bajo el ring
for (let i = 0; i < 12; i++) {
  const cx = 272 + i * 41.5;
  const t = (cx - 500) / 230;
  const cy = 452 + (1 - t * t) * 22;
  units.push({ id: `P${i + 1}`, zone: "palco-platino", label: String(i + 1), x: cx - 17, y: cy - 20, w: 34, h: 40, rot: Math.atan(-2 * t * 22 / 230) * (180 / Math.PI) });
}

// Palcos VIP 1–4 (izquierda) y 5–8 (derecha)
for (let i = 0; i < 4; i++) {
  units.push({ id: `V${i + 1}`, zone: "palco-vip", label: String(i + 1), x: 182, y: 186 + i * 74, w: 46, h: 62 });
  units.push({ id: `V${i + 5}`, zone: "palco-vip", label: String(i + 5), x: 772, y: 186 + i * 74, w: 46, h: 62 });
}

// Sillas ringside (42): fila superior, columnas laterales y dos filas inferiores
const S = 15, STEP = 19;
let n = 1;
for (let i = 0; i < 8; i++) units.push({ id: `R${n}`, zone: "ringside", label: String(n++), x: 425 + i * STEP, y: 178, w: S, h: S });
for (let i = 0; i < 8; i++) units.push({ id: `R${n}`, zone: "ringside", label: String(n++), x: 398, y: 205 + i * STEP, w: S, h: S });
for (let i = 0; i < 8; i++) units.push({ id: `R${n}`, zone: "ringside", label: String(n++), x: 587, y: 205 + i * STEP, w: S, h: S });
for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) units.push({ id: `R${n}`, zone: "ringside", label: String(n++), x: 416 + i * STEP, y: 372 + r * STEP, w: S, h: S });

export const UNITS = units;

export const SOLD = new Set<string>(["A14", "P3", "P7", "P8", "V2", "V6", "R3", "R4", "R11", "R19", "R20", "R27", "R31", "R32", "R38"]);

/** Cupos de ejemplo para las zonas que se venden por cantidad */
export const GENERAL_STOCK: Record<string, number> = { vip: 118, preferencial: 296, general: 640 };

export function availability(zoneId: string) {
  const list = UNITS.filter((u) => u.zone === zoneId);
  if (list.length) return { total: list.length, left: list.filter((u) => !SOLD.has(u.id)).length };
  const left = GENERAL_STOCK[zoneId] ?? 0;
  return { total: left, left };
}

/** Bloques de las zonas generales (pueden tener varias áreas en el mapa) */
export const AREAS: { zone: "general" | "preferencial" | "vip"; x: number; y: number; w: number; h: number; label?: string; vertical?: boolean }[] = [
  { zone: "general", x: 30, y: 128, w: 92, h: 448, label: "GENERAL", vertical: true },
  { zone: "general", x: 878, y: 128, w: 92, h: 448, label: "GENERAL", vertical: true },
  { zone: "general", x: 170, y: 592, w: 270, h: 56, label: "ZONA GENERAL" },
  { zone: "general", x: 560, y: 592, w: 270, h: 56, label: "ZONA GENERAL" },
  { zone: "preferencial", x: 130, y: 150, w: 42, h: 404, label: "PREFERENCIAL", vertical: true },
  { zone: "preferencial", x: 828, y: 150, w: 42, h: 404, label: "PREFERENCIAL", vertical: true },
  { zone: "vip", x: 240, y: 140, w: 112, h: 420, label: "VIP", vertical: true },
  { zone: "vip", x: 648, y: 140, w: 112, h: 420, label: "VIP", vertical: true },
];
