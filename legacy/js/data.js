/* ==========================================================================
   ONE TRUE INC — Datos de ejemplo (PLACEHOLDERS)
   Todo lo que hay aquí es contenido de prueba. Reemplazar con datos reales.
   Los textos bilingües usan { es: "...", en: "..." }.
   ========================================================================== */

const DIVISIONS = {
  flyw:  { es: "Mosca femenino", en: "Women's Flyweight", limit: "51 kg / 112 lb" },
  feather: { es: "Pluma", en: "Featherweight", limit: "57 kg / 126 lb" },
  light: { es: "Ligero", en: "Lightweight", limit: "61 kg / 135 lb" },
  welter: { es: "Wélter", en: "Welterweight", limit: "67 kg / 147 lb" },
  middle: { es: "Mediano", en: "Middleweight", limit: "73 kg / 160 lb" },
  heavy: { es: "Pesado", en: "Heavyweight", limit: "+91 kg / +200 lb" },
};

/* rank: 0 = campeón, 1..n = posición en el ranking */
const FIGHTERS = [
  // Mosca femenino
  { id: "valentina-cardona", first: "Valentina", last: "Cardona", nick: "La Reina", div: "flyw", rank: 0, w: 14, l: 1, d: 0, ko: 7, country: "COL", city: "Medellín", age: 27, height: "1.62 m", reach: "163 cm", stance: "orthodox", acc: 48, def: 64, ppr: 61 },
  { id: "laura-henao", first: "Laura", last: "Henao", nick: "Furia", div: "flyw", rank: 1, w: 11, l: 2, d: 0, ko: 5, country: "COL", city: "Envigado", age: 25, height: "1.60 m", reach: "160 cm", stance: "southpaw", acc: 44, def: 58, ppr: 66 },
  { id: "daniela-usuga", first: "Daniela", last: "Úsuga", nick: "Cobra", div: "flyw", rank: 2, w: 9, l: 2, d: 1, ko: 4, country: "COL", city: "Bello", age: 24, height: "1.58 m", reach: "158 cm", stance: "orthodox", acc: 41, def: 55, ppr: 58 },
  { id: "manuela-tabares", first: "Manuela", last: "Tabares", nick: "Fénix", div: "flyw", rank: 3, w: 8, l: 3, d: 0, ko: 2, country: "COL", city: "Pereira", age: 29, height: "1.63 m", reach: "164 cm", stance: "orthodox", acc: 39, def: 57, ppr: 52 },
  // Pluma
  { id: "andres-mosquera", first: "Andrés", last: "Mosquera", nick: "La Pantera", div: "feather", rank: 0, w: 19, l: 1, d: 0, ko: 13, country: "COL", city: "Quibdó", age: 28, height: "1.68 m", reach: "172 cm", stance: "orthodox", acc: 51, def: 62, ppr: 70 },
  { id: "kevin-restrepo", first: "Kevin", last: "Restrepo", nick: "Dinamita", div: "feather", rank: 1, w: 15, l: 2, d: 0, ko: 11, country: "COL", city: "Itagüí", age: 26, height: "1.70 m", reach: "174 cm", stance: "orthodox", acc: 47, def: 54, ppr: 74 },
  { id: "santiago-rios", first: "Santiago", last: "Ríos", nick: "El Halcón", div: "feather", rank: 2, w: 13, l: 3, d: 1, ko: 6, country: "COL", city: "Manizales", age: 30, height: "1.67 m", reach: "170 cm", stance: "southpaw", acc: 45, def: 60, ppr: 63 },
  { id: "brayan-cuesta", first: "Brayan", last: "Cuesta", nick: "Martillo", div: "feather", rank: 3, w: 10, l: 2, d: 0, ko: 8, country: "COL", city: "Cali", age: 23, height: "1.66 m", reach: "169 cm", stance: "orthodox", acc: 43, def: 50, ppr: 68 },
  // Ligero
  { id: "juan-arango", first: "Juan Camilo", last: "Arango", nick: "Relámpago", div: "light", rank: 0, w: 21, l: 2, d: 1, ko: 12, country: "COL", city: "Medellín", age: 29, height: "1.73 m", reach: "178 cm", stance: "orthodox", acc: 53, def: 66, ppr: 72 },
  { id: "daniel-palacios", first: "Daniel", last: "Palacios", nick: "El Cóndor", div: "light", rank: 1, w: 17, l: 3, d: 0, ko: 10, country: "COL", city: "Bogotá", age: 27, height: "1.75 m", reach: "180 cm", stance: "orthodox", acc: 49, def: 61, ppr: 67 },
  { id: "sebastian-gil", first: "Sebastián", last: "Gil", nick: "Tormenta", div: "light", rank: 2, w: 14, l: 2, d: 0, ko: 9, country: "COL", city: "Rionegro", age: 25, height: "1.72 m", reach: "177 cm", stance: "southpaw", acc: 46, def: 57, ppr: 71 },
  { id: "felipe-ocampo", first: "Felipe", last: "Ocampo", nick: "El Zurdo", div: "light", rank: 3, w: 12, l: 4, d: 1, ko: 5, country: "COL", city: "Armenia", age: 31, height: "1.71 m", reach: "175 cm", stance: "southpaw", acc: 42, def: 59, ppr: 60 },
  // Wélter
  { id: "jhon-valencia", first: "Jhon", last: "Valencia", nick: "El Tigre", div: "welter", rank: 0, w: 23, l: 1, d: 0, ko: 18, country: "COL", city: "Cartagena", age: 30, height: "1.78 m", reach: "185 cm", stance: "orthodox", acc: 55, def: 63, ppr: 76 },
  { id: "cristian-renteria", first: "Cristian", last: "Rentería", nick: "Puño de Hierro", div: "welter", rank: 1, w: 18, l: 2, d: 0, ko: 15, country: "COL", city: "Buenaventura", age: 28, height: "1.77 m", reach: "183 cm", stance: "orthodox", acc: 50, def: 56, ppr: 73 },
  { id: "luis-montoya", first: "Luis", last: "Montoya", nick: "Samurái", div: "welter", rank: 2, w: 16, l: 3, d: 1, ko: 9, country: "COL", city: "Medellín", age: 29, height: "1.79 m", reach: "184 cm", stance: "southpaw", acc: 48, def: 65, ppr: 64 },
  { id: "esteban-quintero", first: "Esteban", last: "Quintero", nick: "Toro", div: "welter", rank: 3, w: 13, l: 4, d: 0, ko: 10, country: "COL", city: "Sabaneta", age: 32, height: "1.76 m", reach: "181 cm", stance: "orthodox", acc: 44, def: 52, ppr: 69 },
  // Mediano
  { id: "carlos-hinestroza", first: "Carlos", last: "Hinestroza", nick: "El Muro", div: "middle", rank: 0, w: 20, l: 2, d: 0, ko: 14, country: "COL", city: "Barranquilla", age: 31, height: "1.83 m", reach: "190 cm", stance: "orthodox", acc: 52, def: 68, ppr: 65 },
  { id: "oscar-zapata", first: "Óscar", last: "Zapata", nick: "Vendaval", div: "middle", rank: 1, w: 16, l: 3, d: 0, ko: 12, country: "COL", city: "Medellín", age: 28, height: "1.81 m", reach: "188 cm", stance: "orthodox", acc: 47, def: 58, ppr: 70 },
  { id: "diego-murillo", first: "Diego", last: "Murillo", nick: "Coloso", div: "middle", rank: 2, w: 14, l: 2, d: 1, ko: 11, country: "COL", city: "Tumaco", age: 27, height: "1.84 m", reach: "192 cm", stance: "southpaw", acc: 45, def: 55, ppr: 66 },
  { id: "julian-ospina", first: "Julián", last: "Ospina", nick: "Machete", div: "middle", rank: 3, w: 11, l: 3, d: 0, ko: 8, country: "COL", city: "Ibagué", age: 26, height: "1.80 m", reach: "186 cm", stance: "orthodox", acc: 43, def: 53, ppr: 62 },
  // Pesado
  { id: "wilson-cordoba", first: "Wilson", last: "Córdoba", nick: "El Gigante", div: "heavy", rank: 0, w: 17, l: 1, d: 0, ko: 15, country: "COL", city: "Apartadó", age: 32, height: "1.95 m", reach: "203 cm", stance: "orthodox", acc: 49, def: 54, ppr: 52 },
  { id: "hernan-lozano", first: "Hernán", last: "Lozano", nick: "Titán", div: "heavy", rank: 1, w: 14, l: 2, d: 0, ko: 12, country: "COL", city: "Bogotá", age: 30, height: "1.92 m", reach: "198 cm", stance: "orthodox", acc: 46, def: 50, ppr: 55 },
  { id: "fredy-mena", first: "Fredy", last: "Mena", nick: "Bulldozer", div: "heavy", rank: 2, w: 12, l: 3, d: 0, ko: 11, country: "COL", city: "Turbo", age: 29, height: "1.90 m", reach: "196 cm", stance: "orthodox", acc: 44, def: 47, ppr: 58 },
  { id: "alexis-bedoya", first: "Alexis", last: "Bedoya", nick: "Roca", div: "heavy", rank: 3, w: 10, l: 2, d: 1, ko: 8, country: "COL", city: "Caldas", age: 27, height: "1.93 m", reach: "199 cm", stance: "southpaw", acc: 42, def: 51, ppr: 50 },
];

/* Libra por libra (ids en orden) */
const P4P = ["jhon-valencia", "juan-arango", "andres-mosquera", "valentina-cardona", "carlos-hinestroza", "wilson-cordoba", "cristian-renteria", "kevin-restrepo", "daniel-palacios", "laura-henao"];

/*
  brand: "trueboxing" | "trueknuckles"
  card: [ { a, b, div, rounds, title?, result? } ]  — a/b = ids de FIGHTERS
  main = cartelera estelar, prelims = preliminares
*/
const EVENTS = [
  {
    id: "trueboxing-5", brand: "trueboxing", name: "TrueBoxing 5", status: "upcoming",
    date: "2026-12-12T20:00:00-05:00",
    venue: "Distrito Palmas", city: "Medellín, Colombia",
    tagline: { es: "La noche de los campeones", en: "Night of champions" },
    main: [
      { a: "jhon-valencia", b: "cristian-renteria", div: "welter", rounds: 10, title: true },
      { a: "valentina-cardona", b: "laura-henao", div: "flyw", rounds: 10, title: true },
      { a: "kevin-restrepo", b: "santiago-rios", div: "feather", rounds: 8 },
      { a: "oscar-zapata", b: "diego-murillo", div: "middle", rounds: 8 },
      { a: "hernan-lozano", b: "fredy-mena", div: "heavy", rounds: 8 },
    ],
    prelims: [
      { a: "sebastian-gil", b: "felipe-ocampo", div: "light", rounds: 6 },
      { a: "daniela-usuga", b: "manuela-tabares", div: "flyw", rounds: 6 },
      { a: "brayan-cuesta", b: "julian-ospina", div: "feather", rounds: 6 },
      { a: "luis-montoya", b: "esteban-quintero", div: "welter", rounds: 6 },
    ],
  },
  {
    id: "trueknuckles-2", brand: "trueknuckles", name: "TrueKnuckles 2", status: "upcoming",
    date: "2027-02-20T20:00:00-05:00",
    venue: "Coliseo (por definir)", city: "Medellín, Colombia",
    tagline: { es: "La casa del verdadero nudillo", en: "The home of the true knuckle" },
    main: [
      { a: "carlos-hinestroza", b: "oscar-zapata", div: "middle", rounds: 5, title: true },
      { a: "wilson-cordoba", b: "alexis-bedoya", div: "heavy", rounds: 5 },
      { a: "daniel-palacios", b: "sebastian-gil", div: "light", rounds: 5 },
    ],
    prelims: [
      { a: "esteban-quintero", b: "luis-montoya", div: "welter", rounds: 3 },
      { a: "brayan-cuesta", b: "santiago-rios", div: "feather", rounds: 3 },
    ],
  },
  {
    id: "trueboxing-6", brand: "trueboxing", name: "TrueBoxing 6", status: "upcoming",
    date: "2027-04-24T20:00:00-05:00",
    venue: "Por definir", city: "Colombia",
    tagline: { es: "Próximamente", en: "Coming soon" },
    main: [
      { a: "juan-arango", b: "daniel-palacios", div: "light", rounds: 10, title: true },
      { a: "andres-mosquera", b: "kevin-restrepo", div: "feather", rounds: 10, title: true },
    ],
    prelims: [],
  },
  {
    id: "trueboxing-4", brand: "trueboxing", name: "TrueBoxing 4", status: "past",
    date: "2026-09-06T19:00:00-05:00",
    venue: "Distrito Palmas", city: "Medellín, Colombia",
    tagline: { es: "La casa del verdadero boxeo", en: "The home of true boxing" },
    main: [
      { a: "juan-arango", b: "felipe-ocampo", div: "light", rounds: 10, title: true, result: { winner: "a", method: "KO", round: 4, time: "2:13" } },
      { a: "andres-mosquera", b: "brayan-cuesta", div: "feather", rounds: 10, title: true, result: { winner: "a", method: "DEC", round: 10, time: "3:00" } },
      { a: "carlos-hinestroza", b: "julian-ospina", div: "middle", rounds: 8, result: { winner: "a", method: "TKO", round: 6, time: "1:47" } },
      { a: "wilson-cordoba", b: "hernan-lozano", div: "heavy", rounds: 8, result: { winner: "a", method: "KO", round: 2, time: "0:58" } },
    ],
    prelims: [
      { a: "laura-henao", b: "daniela-usuga", div: "flyw", rounds: 6, result: { winner: "a", method: "DEC", round: 6, time: "2:00" } },
      { a: "cristian-renteria", b: "esteban-quintero", div: "welter", rounds: 6, result: { winner: "a", method: "TKO", round: 3, time: "2:31" } },
    ],
  },
  {
    id: "trueknuckles-1", brand: "trueknuckles", name: "TrueKnuckles 1", status: "past",
    date: "2026-05-16T20:00:00-05:00",
    venue: "Por definir", city: "Medellín, Colombia",
    tagline: { es: "Nace el verdadero nudillo", en: "The true knuckle is born" },
    main: [
      { a: "oscar-zapata", b: "julian-ospina", div: "middle", rounds: 5, result: { winner: "a", method: "KO", round: 2, time: "1:20" } },
      { a: "fredy-mena", b: "alexis-bedoya", div: "heavy", rounds: 5, result: { winner: "a", method: "TKO", round: 3, time: "0:44" } },
    ],
    prelims: [
      { a: "sebastian-gil", b: "felipe-ocampo", div: "light", rounds: 3, result: { winner: "a", method: "DEC", round: 3, time: "2:00" } },
    ],
  },
  {
    id: "trueboxing-3", brand: "trueboxing", name: "TrueBoxing 3", status: "past",
    date: "2026-03-14T19:00:00-05:00",
    venue: "Por definir", city: "Medellín, Colombia",
    tagline: { es: "Sangre nueva", en: "New blood" },
    main: [
      { a: "jhon-valencia", b: "luis-montoya", div: "welter", rounds: 10, title: true, result: { winner: "a", method: "DEC", round: 10, time: "3:00" } },
      { a: "valentina-cardona", b: "manuela-tabares", div: "flyw", rounds: 10, title: true, result: { winner: "a", method: "TKO", round: 7, time: "1:05" } },
    ],
    prelims: [],
  },
];

/* Zonas de boletería (basado en el mapa de TrueBoxing 4 — precios de ejemplo en COP) */
const TICKETS = [
  { id: "palco-platino", name: { es: "Palco Platino", en: "Platinum Box" }, price: 1000000, perks: { es: ["Mesa para 10 personas", "Vista directa al ring", "Servicio de mesero", "Acceso preferencial"], en: ["Table for 10 people", "Direct ring view", "Waiter service", "Priority access"] }, featured: true },
  { id: "palco-vip", name: { es: "Palco VIP", en: "VIP Box" }, price: 800000, perks: { es: ["Mesa para 8 personas", "Zona elevada", "Acceso preferencial"], en: ["Table for 8 people", "Raised area", "Priority access"] } },
  { id: "platino", name: { es: "Platino", en: "Platinum" }, price: 250000, perks: { es: ["Silla numerada ringside", "Kit de bienvenida"], en: ["Numbered ringside seat", "Welcome kit"] } },
  { id: "vip", name: { es: "VIP", en: "VIP" }, price: 180000, perks: { es: ["Silla numerada", "Acceso a barra"], en: ["Numbered seat", "Bar access"] } },
  { id: "preferencial", name: { es: "Preferencial", en: "Preferred" }, price: 120000, perks: { es: ["Silla en tribuna preferencial"], en: ["Preferred stand seat"] } },
  { id: "general", name: { es: "General", en: "General" }, price: 80000, perks: { es: ["Entrada general de pie"], en: ["General standing admission"] } },
];

const NEWS = [
  { id: "trueboxing-5-anuncio", cat: "TrueBoxing 5", date: "2026-10-01", fighter: "jhon-valencia",
    title: { es: "Valencia vs. Rentería encabezará TrueBoxing 5", en: "Valencia vs. Rentería to headline TrueBoxing 5" },
    excerpt: { es: "El campeón wélter defenderá su cinturón ante el puño más pesado de la división.", en: "The welterweight champion defends his belt against the division's heaviest hitter." } },
  { id: "arango-ko", cat: "TrueBoxing 4", date: "2026-09-07", fighter: "juan-arango",
    title: { es: "Arango retiene con un KO de antología", en: "Arango retains with an all-time KO" },
    excerpt: { es: "'Relámpago' apagó las luces en el cuarto asalto ante un Distrito Palmas lleno.", en: "'Relámpago' turned the lights off in round four in front of a packed Distrito Palmas." } },
  { id: "cardona-henao", cat: "TrueBoxing 5", date: "2026-09-28", fighter: "valentina-cardona",
    title: { es: "Cardona y Henao: la revancha que todos pedían", en: "Cardona vs. Henao: the rematch everyone wanted" },
    excerpt: { es: "La campeona mosca enfrenta a la retadora número uno en la co-estelar.", en: "The flyweight champion faces the number-one contender in the co-main event." } },
  { id: "trueknuckles-2-fecha", cat: "TrueKnuckles", date: "2026-09-20", fighter: "carlos-hinestroza",
    title: { es: "TrueKnuckles 2 ya tiene fecha", en: "TrueKnuckles 2 is officially dated" },
    excerpt: { es: "El verdadero nudillo regresa en febrero con Hinestroza vs. Zapata.", en: "The true knuckle returns in February with Hinestroza vs. Zapata." } },
  { id: "cordoba-gigante", cat: "TrueBoxing 4", date: "2026-09-08", fighter: "wilson-cordoba",
    title: { es: "Córdoba: 'Nadie aguanta dos asaltos conmigo'", en: "Córdoba: 'Nobody lasts two rounds with me'" },
    excerpt: { es: "El campeón pesado habla tras su noqueo en 58 segundos.", en: "The heavyweight champion speaks after his 58-second knockout." } },
  { id: "mosquera-defensa", cat: "TrueBoxing 4", date: "2026-09-07", fighter: "andres-mosquera",
    title: { es: "Mosquera suma otra defensa por decisión", en: "Mosquera adds another defense by decision" },
    excerpt: { es: "'La Pantera' dominó los diez asaltos ante Cuesta.", en: "'La Pantera' controlled all ten rounds against Cuesta." } },
  { id: "detras-camaras", cat: "One True", date: "2026-08-30", fighter: "kevin-restrepo",
    title: { es: "Detrás de cámaras: así se prepara una noche One True", en: "Behind the scenes: how a One True night comes together" },
    excerpt: { es: "Del montaje del ring al último vendaje: un recorrido completo.", en: "From ring setup to the last hand wrap: a full walkthrough." } },
  { id: "nuevos-talentos", cat: "One True", date: "2026-08-15", fighter: "sebastian-gil",
    title: { es: "Cinco prospectos que debes seguir", en: "Five prospects you should follow" },
    excerpt: { es: "La nueva generación del boxeo colombiano ya pelea en casa.", en: "The new generation of Colombian boxing is already fighting at home." } },
];

const SOCIAL = {
  instagram: "https://www.instagram.com/onetrue.inc/",
  whatsapp: "https://wa.me/message/A3A7VHZJIA2YF1",
  threads: "https://www.threads.net/@onetrue.inc",
};
