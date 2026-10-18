import type { Metadata } from "next";
import { Suspense } from "react";
import { Checkout } from "@/components/checkout/Checkout";
import { CHECKOUT_COPY } from "@/components/checkout/copy";
import type { Lang } from "@/i18n/config";

type P = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: CHECKOUT_COPY[(await params).lang].title, robots: { index: false } };
}

export default async function CheckoutPage({ params }: P) {
  const { lang } = await params;
  return (
    <section className="sec sec-gray" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <h1 style={{ fontSize: "clamp(44px, 7vw, 84px)", fontWeight: 800, marginBottom: 24 }}>{CHECKOUT_COPY[lang].title}</h1>
        <Suspense>
          <Checkout />
        </Suspense>
      </div>
    </section>
  );
}
