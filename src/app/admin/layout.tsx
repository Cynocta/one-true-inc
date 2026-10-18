import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { fontVars } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Panel · One True",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#08080a" };

/** Layout propio del panel: sin el header/footer del sitio público, solo en español */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={fontVars}>
      <body style={{ background: "#0d0d0f" }}>
        <I18nProvider lang="es">{children}</I18nProvider>
      </body>
    </html>
  );
}
