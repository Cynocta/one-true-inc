/**
 * PLACEHOLDERS — peleadores ficticios para maquetar.
 * Las fotos de ejemplo vienen de ./photos.ts. Si un peleador no tiene foto, se muestra la ilustración (FighterArt).
 */
import type { Fighter } from "@/types";
import { PLACEHOLDER_PHOTOS } from "./photos";

type Row = [slug: string, first: string, last: string, nick: string, division: Fighter["division"], rank: number, w: number, l: number, d: number, ko: number, city: string, age: number, height: string, reach: string, stance: Fighter["stance"], acc: number, def: number, ppr: number, look: Fighter["look"]];

const ROWS: Row[] = [
  // Mosca femenino
  ["valentina-cardona", "Valentina", "Cardona", "La Reina", "flyw", 0, 14, 1, 0, 7, "Medellín", 27, "1.62 m", "163 cm", "orthodox", 48, 64, 61, { skin: 1, hair: "ponytail", hairColor: "#2a1a12", trunks: "#d7141e" }],
  ["laura-henao", "Laura", "Henao", "Furia", "flyw", 1, 11, 2, 0, 5, "Envigado", 25, "1.60 m", "160 cm", "southpaw", 44, 58, 66, { skin: 2, hair: "braids", hairColor: "#140c08", trunks: "#1f4fa8" }],
  ["daniela-usuga", "Daniela", "Úsuga", "Cobra", "flyw", 2, 9, 2, 1, 4, "Bello", 24, "1.58 m", "158 cm", "orthodox", 41, 55, 58, { skin: 3, hair: "bun", hairColor: "#0f0a08", trunks: "#0d0d0f" }],
  ["manuela-tabares", "Manuela", "Tabares", "Fénix", "flyw", 3, 8, 3, 0, 2, "Pereira", 29, "1.63 m", "164 cm", "orthodox", 39, 57, 52, { skin: 0, hair: "ponytail", hairColor: "#6b3a1d", trunks: "#e3b341" }],
  // Pluma
  ["andres-mosquera", "Andrés", "Mosquera", "La Pantera", "feather", 0, 19, 1, 0, 13, "Quibdó", 28, "1.68 m", "172 cm", "orthodox", 51, 62, 70, { skin: 5, hair: "buzz", trunks: "#0d0d0f", gloves: "#d7141e" }],
  ["kevin-restrepo", "Kevin", "Restrepo", "Dinamita", "feather", 1, 15, 2, 0, 11, "Itagüí", 26, "1.70 m", "174 cm", "orthodox", 47, 54, 74, { skin: 1, hair: "mohawk", hairColor: "#1a120c", trunks: "#d7141e" }],
  ["santiago-rios", "Santiago", "Ríos", "El Halcón", "feather", 2, 13, 3, 1, 6, "Manizales", 30, "1.67 m", "170 cm", "southpaw", 45, 60, 63, { skin: 2, hair: "short", hairColor: "#1a120c", beard: true, trunks: "#ffffff" }],
  ["brayan-cuesta", "Brayan", "Cuesta", "Martillo", "feather", 3, 10, 2, 0, 8, "Cali", 23, "1.66 m", "169 cm", "orthodox", 43, 50, 68, { skin: 4, hair: "curly", trunks: "#1f4fa8" }],
  // Ligero
  ["juan-arango", "Juan Camilo", "Arango", "Relámpago", "light", 0, 21, 2, 1, 12, "Medellín", 29, "1.73 m", "178 cm", "orthodox", 53, 66, 72, { skin: 1, hair: "short", hairColor: "#20140c", beard: true, trunks: "#e3b341", gloves: "#0d0d0f" }],
  ["daniel-palacios", "Daniel", "Palacios", "El Cóndor", "light", 1, 17, 3, 0, 10, "Bogotá", 27, "1.75 m", "180 cm", "orthodox", 49, 61, 67, { skin: 2, hair: "buzz", trunks: "#1f4fa8" }],
  ["sebastian-gil", "Sebastián", "Gil", "Tormenta", "light", 2, 14, 2, 0, 9, "Rionegro", 25, "1.72 m", "177 cm", "southpaw", 46, 57, 71, { skin: 0, hair: "mohawk", hairColor: "#3b2414", trunks: "#0d0d0f" }],
  ["felipe-ocampo", "Felipe", "Ocampo", "El Zurdo", "light", 3, 12, 4, 1, 5, "Armenia", 31, "1.71 m", "175 cm", "southpaw", 42, 59, 60, { skin: 1, hair: "bald", beard: true, hairColor: "#1a120c", trunks: "#d7141e" }],
  // Wélter
  ["jhon-valencia", "Jhon", "Valencia", "El Tigre", "welter", 0, 23, 1, 0, 18, "Cartagena", 30, "1.78 m", "185 cm", "orthodox", 55, 63, 76, { skin: 4, hair: "buzz", beard: true, trunks: "#d7141e", gloves: "#d7141e" }],
  ["cristian-renteria", "Cristian", "Rentería", "Puño de Hierro", "welter", 1, 18, 2, 0, 15, "Buenaventura", 28, "1.77 m", "183 cm", "orthodox", 50, 56, 73, { skin: 5, hair: "curly", trunks: "#1f4fa8", gloves: "#1f4fa8" }],
  ["luis-montoya", "Luis", "Montoya", "Samurái", "welter", 2, 16, 3, 1, 9, "Medellín", 29, "1.79 m", "184 cm", "southpaw", 48, 65, 64, { skin: 1, hair: "bun", hairColor: "#140c08", beard: true, trunks: "#0d0d0f" }],
  ["esteban-quintero", "Esteban", "Quintero", "Toro", "welter", 3, 13, 4, 0, 10, "Sabaneta", 32, "1.76 m", "181 cm", "orthodox", 44, 52, 69, { skin: 2, hair: "bald", trunks: "#ffffff" }],
  // Mediano
  ["carlos-hinestroza", "Carlos", "Hinestroza", "El Muro", "middle", 0, 20, 2, 0, 14, "Barranquilla", 31, "1.83 m", "190 cm", "orthodox", 52, 68, 65, { skin: 4, hair: "short", hairColor: "#0f0a08", beard: true, trunks: "#0d0d0f", gloves: "#e3b341" }],
  ["oscar-zapata", "Óscar", "Zapata", "Vendaval", "middle", 1, 16, 3, 0, 12, "Medellín", 28, "1.81 m", "188 cm", "orthodox", 47, 58, 70, { skin: 0, hair: "short", hairColor: "#4a2e1a", trunks: "#1f4fa8" }],
  ["diego-murillo", "Diego", "Murillo", "Coloso", "middle", 2, 14, 2, 1, 11, "Tumaco", 27, "1.84 m", "192 cm", "southpaw", 45, 55, 66, { skin: 5, hair: "mohawk", trunks: "#d7141e" }],
  ["julian-ospina", "Julián", "Ospina", "Machete", "middle", 3, 11, 3, 0, 8, "Ibagué", 26, "1.80 m", "186 cm", "orthodox", 43, 53, 62, { skin: 2, hair: "buzz", beard: true, trunks: "#e3b341" }],
  // Pesado
  ["wilson-cordoba", "Wilson", "Córdoba", "El Gigante", "heavy", 0, 17, 1, 0, 15, "Apartadó", 32, "1.95 m", "203 cm", "orthodox", 49, 54, 52, { skin: 5, hair: "bald", beard: true, trunks: "#d7141e", gloves: "#0d0d0f" }],
  ["hernan-lozano", "Hernán", "Lozano", "Titán", "heavy", 1, 14, 2, 0, 12, "Bogotá", 30, "1.92 m", "198 cm", "orthodox", 46, 50, 55, { skin: 1, hair: "short", hairColor: "#1a120c", beard: true, trunks: "#0d0d0f" }],
  ["fredy-mena", "Fredy", "Mena", "Bulldozer", "heavy", 2, 12, 3, 0, 11, "Turbo", 29, "1.90 m", "196 cm", "orthodox", 44, 47, 58, { skin: 4, hair: "curly", trunks: "#1f4fa8" }],
  ["alexis-bedoya", "Alexis", "Bedoya", "Roca", "heavy", 3, 10, 2, 1, 8, "Caldas", 27, "1.93 m", "199 cm", "southpaw", 42, 51, 50, { skin: 0, hair: "buzz", hairColor: "#5a3a22", trunks: "#ffffff" }],
];

export const FIGHTERS: Fighter[] = ROWS.map(
  ([slug, first, last, nick, division, rank, w, l, d, ko, city, age, height, reach, stance, accuracy, defense, perRound, look]) => ({
    slug, first, last, nick, division, rank,
    record: { w, l, d, ko },
    country: "COL", city, age, height, reach, stance,
    stats: { accuracy, defense, perRound },
    look,
    photo: PLACEHOLDER_PHOTOS[slug]?.url,
  }),
);

/** Libra por libra (slugs en orden) */
export const P4P = ["jhon-valencia", "juan-arango", "andres-mosquera", "valentina-cardona", "carlos-hinestroza", "wilson-cordoba", "cristian-renteria", "kevin-restrepo", "daniel-palacios", "laura-henao"];
