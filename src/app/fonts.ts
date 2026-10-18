import { Barlow, Barlow_Condensed, Montserrat } from "next/font/google";

/** Tipografías compartidas por el sitio público y el panel de administración */
export const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"], style: ["normal", "italic"], variable: "--font-display" });
export const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
export const logoFont = Montserrat({ subsets: ["latin"], weight: ["900"], variable: "--font-logo" });

export const fontVars = `${display.variable} ${body.variable} ${logoFont.variable}`;
