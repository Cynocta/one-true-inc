import type { PricePhase, TicketZone } from "@/types";

export const SOCIAL = {
  instagram: "https://www.instagram.com/onetrue.inc/",
  whatsapp: "https://wa.me/message/A3A7VHZJIA2YF1",
  threads: "https://www.threads.net/@onetrue.inc",
};

/**
 * Número de WhatsApp que recibe pedidos de la tienda (formato 57XXXXXXXXXX, sin +).
 * PENDIENTE en la hoja de la tienda. Mientras esté vacío, el pedido se copia al portapapeles
 * y se abre SOCIAL.whatsapp (los enlaces wa.me/message no aceptan texto prellenado).
 */
export const SHOP_WHATSAPP_PHONE = "";

/** Preventa de la camiseta del 2do aniversario: muestra "Historia" en el menú y en la cinta roja. Pásalo a false al cerrar la preventa. */
export const PRESALE_ACTIVE = true;

/**
 * Etapas de precio. Las fechas son de EJEMPLO para TrueBoxing 5; cuando haya backend,
 * cada evento tendrá sus propias etapas y el cambio de precio lo hará el servidor.
 */
export const PRICE_PHASES: PricePhase[] = [
  { id: "e1", name: { es: "Etapa 1", en: "Phase 1" }, until: "2026-10-31T23:59:59-05:00" },
  { id: "e2", name: { es: "Etapa 2", en: "Phase 2" }, until: "2026-11-25T23:59:59-05:00" },
  { id: "full", name: { es: "Full", en: "Full" }, until: null },
];

export function currentPhaseIndex(now = Date.now()) {
  const i = PRICE_PHASES.findIndex((p) => p.until && now <= new Date(p.until).getTime());
  return i === -1 ? PRICE_PHASES.length - 1 : i;
}

export const zonePrice = (z: TicketZone, phase = currentPhaseIndex()) => z.prices[phase];

/** Zonas y precios por etapa tomados del mapa de TrueBoxing 4 (One True). */
export const TICKETS: TicketZone[] = [
  { id: "palco-platino", kind: "box", persons: 6, color: "#c9ccd3", featured: true,
    name: { es: "Palco Platino", en: "Platinum Box" }, prices: [1600000, 1800000, 2000000],
    perks: { es: ["Palco para 6 personas", "Vista preferencial al ring", "Servicio a la mesa"], en: ["Box for 6 people", "Prime ring view", "Table service"] } },
  { id: "palco-vip", kind: "box", persons: 6, color: "#1f9d55",
    name: { es: "Palco VIP", en: "VIP Box" }, prices: [800000, 900000, 1000000],
    perks: { es: ["Palco de 4 a 6 personas", "Junto a la zona VIP"], en: ["Box for 4 to 6 people", "Next to the VIP area"] } },
  { id: "ringside", kind: "seat", color: "#d7141e",
    name: { es: "Ringside", en: "Ringside" }, prices: [260000, 288000, 320000],
    perks: { es: ["Silla numerada al pie del ring", "Eliges tu silla"], en: ["Numbered seat at the ring", "Pick your seat"] } },
  { id: "vip", kind: "general", color: "#f2d64b",
    name: { es: "VIP", en: "VIP" }, prices: [144000, 162000, 180000],
    perks: { es: ["Individual", "A los lados del ring"], en: ["Individual", "On the sides of the ring"] } },
  { id: "preferencial", kind: "general", color: "#8ecae6",
    name: { es: "Preferencial", en: "Preferred" }, prices: [120000, 135000, 150000],
    perks: { es: ["Individual", "Tribuna lateral"], en: ["Individual", "Side stand"] } },
  { id: "general", kind: "general", color: "#f4f4f5",
    name: { es: "General", en: "General" }, prices: [96000, 108000, 120000],
    perks: { es: ["Entrada general", "Acceso a la barra"], en: ["General admission", "Bar access"] } },
];
