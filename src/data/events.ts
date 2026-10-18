/** PLACEHOLDERS — carteleras de ejemplo. TrueBoxing 4 usa fecha/sede reales del Instagram, pero la cartelera es inventada. */
import type { FightEvent } from "@/types";

export const EVENTS: FightEvent[] = [
  {
    slug: "trueboxing-5", brand: "trueboxing", name: "TrueBoxing 5", status: "upcoming",
    date: "2026-12-12T20:00:00-05:00", venue: "Distrito Palmas", city: "Medellín, Colombia",
    tagline: { es: "La noche de los campeones", en: "Night of champions" },
    main: [
      { a: "jhon-valencia", b: "cristian-renteria", division: "welter", rounds: 10, title: true },
      { a: "valentina-cardona", b: "laura-henao", division: "flyw", rounds: 10, title: true },
      { a: "kevin-restrepo", b: "santiago-rios", division: "feather", rounds: 8 },
      { a: "oscar-zapata", b: "diego-murillo", division: "middle", rounds: 8 },
      { a: "hernan-lozano", b: "fredy-mena", division: "heavy", rounds: 8 },
    ],
    prelims: [
      { a: "sebastian-gil", b: "felipe-ocampo", division: "light", rounds: 6 },
      { a: "daniela-usuga", b: "manuela-tabares", division: "flyw", rounds: 6 },
      { a: "brayan-cuesta", b: "julian-ospina", division: "feather", rounds: 6 },
      { a: "luis-montoya", b: "esteban-quintero", division: "welter", rounds: 6 },
    ],
  },
  {
    slug: "trueknuckles-2", brand: "trueknuckles", name: "TrueKnuckles 2", status: "upcoming",
    date: "2027-02-20T20:00:00-05:00", venue: "Coliseo (por definir)", city: "Medellín, Colombia",
    tagline: { es: "La casa del verdadero nudillo", en: "The home of the true knuckle" },
    main: [
      { a: "carlos-hinestroza", b: "oscar-zapata", division: "middle", rounds: 5, title: true },
      { a: "wilson-cordoba", b: "alexis-bedoya", division: "heavy", rounds: 5 },
      { a: "daniel-palacios", b: "sebastian-gil", division: "light", rounds: 5 },
    ],
    prelims: [
      { a: "esteban-quintero", b: "luis-montoya", division: "welter", rounds: 3 },
      { a: "brayan-cuesta", b: "santiago-rios", division: "feather", rounds: 3 },
    ],
  },
  {
    slug: "trueboxing-6", brand: "trueboxing", name: "TrueBoxing 6", status: "upcoming",
    date: "2027-04-24T20:00:00-05:00", venue: "Por definir", city: "Colombia",
    tagline: { es: "Próximamente", en: "Coming soon" },
    main: [
      { a: "juan-arango", b: "daniel-palacios", division: "light", rounds: 10, title: true },
      { a: "andres-mosquera", b: "kevin-restrepo", division: "feather", rounds: 10, title: true },
    ],
    prelims: [],
  },
  {
    slug: "trueboxing-4", brand: "trueboxing", name: "TrueBoxing 4", status: "past",
    date: "2026-09-06T19:00:00-05:00", venue: "Distrito Palmas", city: "Medellín, Colombia",
    tagline: { es: "La casa del verdadero boxeo", en: "The home of true boxing" },
    main: [
      { a: "juan-arango", b: "felipe-ocampo", division: "light", rounds: 10, title: true, result: { winner: "a", method: "KO", round: 4, time: "2:13" } },
      { a: "andres-mosquera", b: "brayan-cuesta", division: "feather", rounds: 10, title: true, result: { winner: "a", method: "DEC", round: 10, time: "3:00" } },
      { a: "carlos-hinestroza", b: "julian-ospina", division: "middle", rounds: 8, result: { winner: "a", method: "TKO", round: 6, time: "1:47" } },
      { a: "wilson-cordoba", b: "hernan-lozano", division: "heavy", rounds: 8, result: { winner: "a", method: "KO", round: 2, time: "0:58" } },
    ],
    prelims: [
      { a: "laura-henao", b: "daniela-usuga", division: "flyw", rounds: 6, result: { winner: "a", method: "DEC", round: 6, time: "2:00" } },
      { a: "cristian-renteria", b: "esteban-quintero", division: "welter", rounds: 6, result: { winner: "a", method: "TKO", round: 3, time: "2:31" } },
    ],
  },
  {
    slug: "trueknuckles-1", brand: "trueknuckles", name: "TrueKnuckles 1", status: "past",
    date: "2026-05-16T20:00:00-05:00", venue: "Por definir", city: "Medellín, Colombia",
    tagline: { es: "Nace el verdadero nudillo", en: "The true knuckle is born" },
    main: [
      { a: "oscar-zapata", b: "julian-ospina", division: "middle", rounds: 5, result: { winner: "a", method: "KO", round: 2, time: "1:20" } },
      { a: "fredy-mena", b: "alexis-bedoya", division: "heavy", rounds: 5, result: { winner: "a", method: "TKO", round: 3, time: "0:44" } },
    ],
    prelims: [
      { a: "sebastian-gil", b: "felipe-ocampo", division: "light", rounds: 3, result: { winner: "a", method: "DEC", round: 3, time: "2:00" } },
    ],
  },
  {
    slug: "trueboxing-3", brand: "trueboxing", name: "TrueBoxing 3", status: "past",
    date: "2026-03-14T19:00:00-05:00", venue: "Por definir", city: "Medellín, Colombia",
    tagline: { es: "Sangre nueva", en: "New blood" },
    main: [
      { a: "jhon-valencia", b: "luis-montoya", division: "welter", rounds: 10, title: true, result: { winner: "a", method: "DEC", round: 10, time: "3:00" } },
      { a: "valentina-cardona", b: "manuela-tabares", division: "flyw", rounds: 10, title: true, result: { winner: "a", method: "TKO", round: 7, time: "1:05" } },
    ],
    prelims: [],
  },
];
