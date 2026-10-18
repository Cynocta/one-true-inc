import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { isLang, LANGS } from "@/i18n/config";
import { fontVars } from "../fonts";
import "../globals.css";


export const dynamicParams = false;
export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const en = lang === "en";
  return {
    title: { default: "One True — " + (en ? "The home of true boxing" : "La casa del verdadero boxeo"), template: "%s | One True" },
    description: en
      ? "One True Inc — professional boxing events in Colombia. TrueBoxing and TrueKnuckles."
      : "One True Inc — eventos de boxeo profesional en Colombia. TrueBoxing y TrueKnuckles.",
    alternates: { languages: { es: "/es/", en: "/en/" } },
  };
}

export const viewport: Viewport = { themeColor: "#0a0a0b" };

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} className={fontVars}>
      <body>
        <I18nProvider lang={lang}>
          <Header />
          <main>{children}</main>
          <Footer lang={lang} />
        </I18nProvider>
      </body>
    </html>
  );
}
