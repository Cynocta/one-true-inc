import { Old_Standard_TT, Playfair_Display, Special_Elite, UnifrakturCook } from "next/font/google";

/** Tipografías solo de /historia (periódico antiguo). No se cargan en el resto del sitio. */
const masthead = UnifrakturCook({ subsets: ["latin"], weight: "700", variable: "--f-black", display: "swap" });
const headline = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], style: ["normal", "italic"], variable: "--f-head", display: "swap" });
const text = Old_Standard_TT({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--f-body", display: "swap" });
const typewriter = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--f-type", display: "swap" });

export const gazetteFonts = `${masthead.variable} ${headline.variable} ${text.variable} ${typewriter.variable}`;
