/**
 * CONTENIDO DE "LA HISTORIA" (página temporal del 2do aniversario).
 * Fechas: afiche oficial de One True (oct 2026). Sede de TB4: Instagram de @onetrue.inc.
 * Los textos son narrativos: no afirman resultados, asistencia ni cifras que no tengamos.
 *
 * FOTOS (todas del Drive "Publicidad", optimizadas en /public/historia/):
 *  - tb3-* y album-tb3-*: TrueBoxing 3. EXIF 26 abr 2026 (DSC) y edición del 3 may 2026 (ONCE_By_Yates).
 *  - ago25-* y album-ago25-*: serie YAT, editada el 29 ago 2025 (XMP), o sea la noche del 26 ago 2025.
 *    OJO: la carpeta "TrueBoxing 4 Septiembre 2026" tiene estas mismas fotos; está mal nombrada.
 *  - tb4-*: retratos de "Fotos peleadores/Peleas 06 de septiembre" (cartelera de TB4).
 *  - Nov 2024 y abr 2025: sin fotos en el Drive. Esos capítulos van sin foto hasta tener originales.
 */
import type { Lang } from "@/i18n/config";

type L = Record<Lang, string>;

export interface Photo { src: string; alt: L; focus?: string }

export interface Fighter { name: string; photo?: Photo }

export interface Chapter {
  id: string;
  date: string; // ISO
  /** brief = nota sin foto · torn = recorte + tira de fotos · contact = hoja de contacto · wire = teletipo con cartelera */
  layout: "brief" | "torn" | "contact" | "wire";
  title: L;
  body: L;
  photos: Photo[];
  venue?: L;
  /** Peleas anunciadas (solo TB4) */
  card?: [Fighter, Fighter][];
  /** Nota sin foto: frase destacada */
  quote?: L;
}

const p = (file: string, es: string, en: string, focus?: string): Photo => ({ src: `/historia/${file}.webp`, alt: { es, en }, focus });

/** Foto de portada (TB3, Drive). */
export const COVER: Photo = p("tb3-grito", "Peleador grita de alegría con el brazo en alto en TrueBoxing 3", "Fighter roars with his arm raised at TrueBoxing 3", "55% 30%");

export const FIRST_NIGHT = "2024-11-24T19:00:00-05:00";
export const ANNIVERSARY = "2026-11-24T00:00:00-05:00";

export const CHAPTERS: Chapter[] = [
  {
    id: "nov-2024",
    date: "2024-11-24",
    layout: "brief",
    title: { es: "Suena la primera campana", en: "The first bell rings" },
    body: {
      es: "Un ring, dos esquinas y un público que no sabía lo que venía. Esa noche One True dejó de ser una idea y se volvió una cartelera. Todo lo que sigue en estas páginas empezó aquí.",
      en: "One ring, two corners and a crowd that had no idea what was coming. That night One True stopped being an idea and became a fight card. Everything in these pages started here.",
    },
    quote: { es: "Todo empezó con una campana.", en: "It all started with a bell." },
    photos: [],
  },
  {
    id: "abr-2025",
    date: "2025-04-27",
    layout: "brief",
    title: { es: "La segunda campana", en: "The second bell" },
    body: {
      es: "Cinco meses después, el ring volvió a armarse. Lo que empezó como una apuesta se convirtió en una fecha que había que marcar en el calendario.",
      en: "Five months later, the ring went up again. What started as a bet became a date worth circling on the calendar.",
    },
    quote: { es: "Volvimos.", en: "We came back." },
    photos: [],
  },
  {
    id: "ago-2025",
    date: "2025-08-26",
    layout: "torn",
    title: { es: "Agosto se pelea", en: "August is for fighting" },
    body: {
      es: "Tercera noche en el calendario y el mismo ritual: vendas, guantes, campana. Hendy “La Presión” y “El Gato” subieron al ring en una noche que ya tenía caras propias.",
      en: "Third night on the calendar and the same ritual: wraps, gloves, bell. Hendy “La Presión” and “El Gato” stepped into the ring on a night that already had faces of its own.",
    },
    photos: [
      p("ago25-presion", "Hendy “La Presión” con los brazos en alto junto al presentador", "Hendy “La Presión” with both arms raised next to the announcer", "50% 35%"),
      p("ago25-gato", "Cara a cara en el ring con “El Gato”", "Face to face in the ring with “El Gato”", "50% 40%"),
      p("ago25-femenino", "Pelea femenina en agosto de 2025", "Women’s bout, August 2025", "50% 40%"),
      p("ago25-guardia", "Dos peleadores con la guardia arriba", "Two fighters with their guard up", "50% 40%"),
      p("ago25-cuerdas", "Intercambio contra las cuerdas", "Exchange against the ropes", "50% 40%"),
      p("ago25-gancho", "Un gancho entra en la pelea de agosto", "A hook lands in the August bout", "50% 40%"),
      p("ago25-clinch", "Un peleador abraza a su rival en la esquina", "A fighter clinches his rival in the corner", "50% 40%"),
    ],
  },
  {
    id: "abr-2026",
    date: "2026-04-26",
    layout: "contact",
    title: { es: "TrueBoxing 3 sube el volumen", en: "TrueBoxing 3 turns it up" },
    body: {
      es: "La tercera edición de TrueBoxing fue una noche de brazos en alto. Estas son algunas de las fotos que dejó; cada una cuenta su propia pelea.",
      en: "The third TrueBoxing was a night of raised arms. These are some of the photos it left behind; each one tells its own fight.",
    },
    photos: [
      p("tb3-intercambio", "Dos peleadoras intercambian golpes en TrueBoxing 3", "Two fighters trade punches at TrueBoxing 3", "50% 35%"),
      p("tb3-ganador", "El presentador levanta el brazo del ganador en TrueBoxing 3", "The announcer raises the winner’s arm at TrueBoxing 3", "50% 30%"),
      p("tb3-golpe", "Un golpe conecta en el centro del ring en TrueBoxing 3", "A punch lands in the middle of the ring at TrueBoxing 3", "50% 35%"),
      p("tb3-esquina", "Peleador en su esquina antes de la pelea en TrueBoxing 3", "Fighter in his corner before the bout at TrueBoxing 3", "50% 30%"),
      p("tb3-peleadoras", "Pelea femenina en TrueBoxing 3", "Women’s bout at TrueBoxing 3", "50% 35%"),
      p("tb3-impacto", "Un peleador se dobla tras un golpe en TrueBoxing 3", "A fighter doubles over after a punch at TrueBoxing 3", "50% 40%"),
      p("tb3-rincon", "Peleador solo en su rincón en TrueBoxing 3", "Fighter alone in his corner at TrueBoxing 3", "50% 35%"),
      p("tb3-celebracion", "Peleador celebra en el ring en TrueBoxing 3", "Fighter celebrates in the ring at TrueBoxing 3", "50% 30%"),
    ],
  },
  {
    id: "sep-2026",
    date: "2026-09-06",
    layout: "wire",
    title: { es: "TrueBoxing 4 enciende Distrito Palmas", en: "TrueBoxing 4 lights up Distrito Palmas" },
    body: {
      es: "La cuarta edición de TrueBoxing llevó el ring a Distrito Palmas, en Medellín. Casi dos años después de la primera campana, la casa del verdadero boxeo sigue sumando noches.",
      en: "The fourth TrueBoxing took the ring to Distrito Palmas, in Medellín. Almost two years after the first bell, the home of true boxing keeps adding nights.",
    },
    venue: { es: "Distrito Palmas, Medellín", en: "Distrito Palmas, Medellín" },
    photos: [],
    card: [
      [{ name: "Juan Pablo Sanmartín" }, { name: "Ronald “Lobo” Vásquez", photo: p("tb4-lobo", "Retrato de Ronald “Lobo” Vásquez", "Portrait of Ronald “Lobo” Vásquez", "50% 25%") }],
      [{ name: "Hendy “La Presión”", photo: p("tb4-hendy", "Retrato de Hendy “La Presión”", "Portrait of Hendy “La Presión”", "50% 25%") }, { name: "Cristian Díaz" }],
      [{ name: "José Pinto", photo: p("tb4-pinto", "Retrato de José Pinto", "Portrait of José Pinto", "50% 25%") }, { name: "Eugenio Bernal" }],
      [
        { name: "Yonandry Betorrean", photo: p("tb4-yonandry", "Retrato de Yonandry Betorrean", "Portrait of Yonandry Betorrean", "50% 30%") },
        { name: "Carlos “El Gallo” Pestaña", photo: p("tb4-pestana", "Retrato de Carlos “El Gallo” Pestaña con un gallo en el hombro", "Portrait of Carlos “El Gallo” Pestaña with a rooster on his shoulder", "50% 25%") },
      ],
      [{ name: "Samuel Gutiérrez" }, { name: "Yonde José" }],
    ],
  },
];

/** Álbum: más fotos de TB3 y de agosto de 2025 (Drive). */
export const ALBUM: { photo: Photo; date: string }[] = [
  { date: "2026-04-26", photo: p("album-tb3-1", "Presentador en el ring de TrueBoxing 3", "Announcer in the TrueBoxing 3 ring") },
  { date: "2025-08-26", photo: p("album-ago25-1", "Peleador lanza un golpe en agosto de 2025", "Fighter throws a punch, August 2025") },
  { date: "2026-04-26", photo: p("album-tb3-2", "Pelea vista desde la esquina en TrueBoxing 3", "A bout seen from the corner at TrueBoxing 3") },
  { date: "2026-04-26", photo: p("album-tb3-5", "El presentador anuncia la siguiente pelea en TrueBoxing 3", "The announcer calls the next bout at TrueBoxing 3") },
  { date: "2025-08-26", photo: p("album-ago25-2", "Peleador avanza en agosto de 2025", "Fighter moves forward, August 2025") },
  { date: "2026-04-26", photo: p("album-tb3-3", "Peleadores en el centro del ring en TrueBoxing 3", "Fighters in the center of the ring at TrueBoxing 3") },
  { date: "2026-04-26", photo: p("album-tb3-6", "Peleador celebra con el puño en alto en TrueBoxing 3", "Fighter celebrates with a raised fist at TrueBoxing 3") },
  { date: "2026-04-26", photo: p("album-tb3-4", "Peleador espera en la esquina en TrueBoxing 3", "Fighter waits in the corner at TrueBoxing 3") },
];

/** Camiseta conmemorativa: datos aprobados en la hoja "OneTrue_pendientes_tienda" del Drive. */
export const SHIRT = {
  sku: "CT2A2026",
  name: { es: "Camiseta TrueBoxing 2do aniversario", en: "TrueBoxing 2nd anniversary tee" },
  price: 140000,
  sizes: ["S", "M", "L", "XL", "XXL"] as const,
  fit: { es: "Oversize unisex", en: "Oversize, unisex" },
  color: { es: "Negra, estampada adelante y atrás", en: "Black, printed front and back" },
  material: { es: "85% algodón, 11% poliéster, 4% spandex", en: "85% cotton, 11% polyester, 4% spandex" },
  care: { es: "Secar a la sombra, con plancha tibia", en: "Dry in the shade, iron on low" },
  mode: { es: "Preventa oficial", en: "Official presale" },
  photos: { back: "/historia/camiseta-espalda.webp", front: "/historia/camiseta-frente.webp" },
};
