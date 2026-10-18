/**
 * DATOS Y REGLAS DEL CHECKOUT SIMULADO (modo demo).
 * Nada de esto cobra dinero ni sale del navegador. Cuando se integre la pasarela real,
 * el precio, el cupo y la aprobación se deciden en el servidor (ver memoria del proyecto).
 */
import type { Lang } from "@/i18n/config";

export interface Addon {
  id: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  price: number;
  max: number;
}

export const ADDONS: Addon[] = [
  { id: "parking", name: { es: "Parqueadero", en: "Parking" }, desc: { es: "Un cupo por vehículo", en: "One spot per vehicle" }, price: 25000, max: 2 },
  { id: "shirt", name: { es: "Camiseta oficial", en: "Official shirt" }, desc: { es: "Se reclama en el evento", en: "Picked up at the event" }, price: 90000, max: 4 },
  { id: "photo", name: { es: "Foto con un peleador", en: "Photo with a fighter" }, desc: { es: "Después de la cartelera", en: "After the fight card" }, price: 60000, max: 2 },
];

export const HOLD_SECONDS = 10 * 60;

export type Method = "card" | "pse" | "nequi";
export type Outcome = "approved" | "declined" | "pending";

/** Tarjetas de prueba (formato estándar de sandbox) */
export const TEST_CARDS = {
  approved: "4242 4242 4242 4242",
  declined: "4000 0000 0000 0002",
};

export const PSE_BANKS = [
  { id: "ok", name: { es: "Banco de prueba · aprueba", en: "Test bank · approves" }, outcome: "approved" as Outcome },
  { id: "no", name: { es: "Banco de prueba · rechaza", en: "Test bank · declines" }, outcome: "declined" as Outcome },
  { id: "wait", name: { es: "Banco de prueba · queda pendiente", en: "Test bank · stays pending" }, outcome: "pending" as Outcome },
];

export const NEQUI_DECLINE_PHONE = "3000000000";

/* ---------- Validaciones de tarjeta ---------- */
export const digits = (v: string) => v.replace(/\D/g, "");

export function luhn(num: string) {
  const d = digits(num);
  if (d.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string): "visa" | "mastercard" | "amex" | null {
  const d = digits(num);
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return null;
}

export const formatCard = (v: string) => {
  const d = digits(v).slice(0, 16);
  return cardBrand(d) === "amex" ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")) : d.replace(/(\d{4})(?=\d)/g, "$1 ");
};

export const formatExp = (v: string) => {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export function expValid(v: string) {
  const [m, y] = v.split("/").map(Number);
  if (!m || m > 12 || y === undefined || isNaN(y)) return false;
  const now = new Date();
  const yy = now.getFullYear() % 100;
  return y > yy || (y === yy && m >= now.getMonth() + 1);
}

export function cardOutcome(num: string): Outcome {
  return digits(num) === digits(TEST_CARDS.declined) ? "declined" : "approved";
}

export const orderNumber = () => `OT-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
export const ticketCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, "0")).join("").toUpperCase().slice(0, 10);
