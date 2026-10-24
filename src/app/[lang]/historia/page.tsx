import type { Metadata } from "next";
import { Gazette } from "@/components/historia/Gazette";
import type { Lang } from "@/i18n/config";

/** Página temporal del 2do aniversario: historia de One True + preventa de la camiseta conmemorativa. */
type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const en = (await params).lang === "en";
  return {
    title: en ? "Our story" : "La historia",
    description: en
      ? "Two years of One True in five nights, from November 2024 to TrueBoxing 4. Presale of the anniversary tee."
      : "Dos años de One True en cinco noches, de noviembre de 2024 a TrueBoxing 4. Preventa de la camiseta del aniversario.",
  };
}

export default async function HistoriaPage({ params }: P) {
  return <Gazette lang={(await params).lang} />;
}
