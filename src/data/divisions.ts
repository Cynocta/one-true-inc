import type { Division, DivisionKey } from "@/types";

export const DIVISIONS: Record<DivisionKey, Division> = {
  flyw: { key: "flyw", name: { es: "Mosca femenino", en: "Women's Flyweight" }, limit: "51 kg / 112 lb", women: true },
  feather: { key: "feather", name: { es: "Pluma", en: "Featherweight" }, limit: "57 kg / 126 lb" },
  light: { key: "light", name: { es: "Ligero", en: "Lightweight" }, limit: "61 kg / 135 lb" },
  welter: { key: "welter", name: { es: "Wélter", en: "Welterweight" }, limit: "67 kg / 147 lb" },
  middle: { key: "middle", name: { es: "Mediano", en: "Middleweight" }, limit: "73 kg / 160 lb" },
  heavy: { key: "heavy", name: { es: "Pesado", en: "Heavyweight" }, limit: "+91 kg / +200 lb" },
};

export const DIVISION_ORDER = Object.keys(DIVISIONS) as DivisionKey[];
