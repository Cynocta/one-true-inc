import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVars } from "./fonts";
import "./globals.css";

/** URL pública del sitio (la pone el CI al construir). Hace absolutas las URLs de la tarjeta de WhatsApp. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8787";

const TITLE = "One True · El ring se está armando";
const DESCRIPTION = "La nueva casa del verdadero boxeo en Colombia llega muy pronto. Entra a la lista y entérate primero.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "es_CO", siteName: "One True" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0a0a0b", colorScheme: "dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
