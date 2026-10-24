"use client";

import { MinusIcon, PlusIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { SHOP_WHATSAPP_PHONE, SOCIAL } from "@/data/site";
import type { Lang } from "@/i18n/config";
import { SHIRT } from "./data";
import s from "./gazette.module.css";
import { Rise } from "./parts";

const COPY = {
  es: {
    label: "Clasificados",
    title: "2 años de verdaderos puños, en una camiseta",
    pitch: "Atrás, la portada de The True Times con las cinco noches. Adelante, el logo de la casa. Se vende por preventa: separas la tuya y la reclamas cuando esté lista.",
    size: "Talla",
    qty: "Cantidad",
    less: "Quitar una",
    more: "Agregar una",
    total: "Total",
    order: "Pedir por WhatsApp",
    terms: "El pago y el envío se acuerdan por WhatsApp.",
    needSize: "Elige tu talla para continuar.",
    copied: "Copiamos tu pedido. Pégalo en el chat de WhatsApp que se abrió.",
    manual: "No pudimos copiar el pedido. Cópialo de aquí y envíalo por WhatsApp:",
    view: "Ver la camiseta",
    sides: { back: "Espalda", front: "Frente" },
    alt: {
      back: "Espalda de la camiseta negra con el estampado de periódico The True Times: 2 años de verdaderos puños",
      front: "Frente de la camiseta negra con el logo onetrue en blanco",
    },
    msg: (size: string, qty: number, total: string) =>
      `Hola One True, quiero separar la ${SHIRT.name.es} (ref. ${SHIRT.sku}).\nTalla: ${size}\nCantidad: ${qty}\nTotal: $${total} COP\nLa vi en la página de la historia.`,
  },
  en: {
    label: "Classifieds",
    title: "2 years of true punches, on a tee",
    pitch: "On the back, The True Times front page with all five nights. On the front, the house logo. It's a presale: reserve yours and pick it up when it's ready.",
    size: "Size",
    qty: "Quantity",
    less: "Remove one",
    more: "Add one",
    total: "Total",
    order: "Order on WhatsApp",
    terms: "Payment and shipping are arranged on WhatsApp.",
    needSize: "Pick your size to continue.",
    copied: "We copied your order. Paste it in the WhatsApp chat that just opened.",
    manual: "We couldn't copy your order. Copy it from here and send it on WhatsApp:",
    view: "View the tee",
    sides: { back: "Back", front: "Front" },
    alt: {
      back: "Back of the black tee with The True Times newspaper print: 2 years of true punches",
      front: "Front of the black tee with the white onetrue logo",
    },
    msg: (size: string, qty: number, total: string) =>
      `Hi One True, I'd like to reserve the ${SHIRT.name.en} (ref. ${SHIRT.sku}).\nSize: ${size}\nQuantity: ${qty}\nTotal: $${total} COP\nI saw it on the history page.`,
  },
} as const;

const MAX_QTY = 4;
const cop = (n: number) => n.toLocaleString("es-CO");

export function ShirtOrder({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const reduce = useReducedMotion();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState<"back" | "front">("back");
  const [status, setStatus] = useState<"idle" | "needSize" | "copied" | "manual">("idle");
  const total = cop(SHIRT.price * qty);
  const message = size ? t.msg(size, qty, total) : "";

  async function order() {
    if (!size) { setStatus("needSize"); return; }
    if (SHOP_WHATSAPP_PHONE) {
      window.open(`https://wa.me/${SHOP_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      setStatus("idle");
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setStatus("copied");
      window.open(SOCIAL.whatsapp, "_blank", "noopener");
    } catch {
      setStatus("manual");
    }
  }

  return (
    <section id="camiseta" className={s.ad} aria-labelledby="camiseta-titulo">
      <div className={s.adFrame}>
        <p className={s.adLabel}>{t.label}</p>
        <div className={s.adGrid}>
          <figure className={s.tee}>
            <motion.div
              className={s.teeStage}
              initial={reduce ? false : { opacity: 0, y: 40, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 70, damping: 14 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={side}
                  src={SHIRT.photos[side]}
                  alt={t.alt[side]}
                  loading="lazy"
                  decoding="async"
                  initial={reduce ? false : { rotateY: 90, opacity: 0.4 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={reduce ? undefined : { rotateY: -90, opacity: 0.4 }}
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                />
              </AnimatePresence>
            </motion.div>
            <div className={s.teeSwitch} role="group" aria-label={t.view}>
              {(["back", "front"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={side === k} className={side === k ? s.teeOn : ""} onClick={() => setSide(k)}>
                  {t.sides[k]}
                </button>
              ))}
            </div>
          </figure>

          <Rise className={s.adBody}>
            <h2 id="camiseta-titulo" className={s.adTitle}>{t.title}</h2>
            <p className={s.body}>{t.pitch}</p>
            <ul className={s.specs}>
              <li>{SHIRT.fit[lang]}</li>
              <li>{SHIRT.color[lang]}</li>
              <li>{SHIRT.material[lang]}</li>
              <li>{SHIRT.care[lang]}</li>
            </ul>

            <div className={s.price}>
              <span>${cop(SHIRT.price)}</span>
              <small>COP</small>
            </div>

            <fieldset className={s.sizes}>
              <legend>{t.size}</legend>
              <div className={s.keys}>
                {SHIRT.sizes.map((z) => (
                  <label key={z} className={`${s.key} ${size === z ? s.keyOn : ""}`}>
                    <input type="radio" name="talla" value={z} checked={size === z} onChange={() => { setSize(z); setStatus("idle"); }} />
                    <span>{z}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={s.qtyRow}>
              <span className={s.qtyLabel} id="qty-label">{t.qty}</span>
              <div className={s.qty} role="group" aria-labelledby="qty-label">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t.less} disabled={qty <= 1}><MinusIcon size={16} weight="bold" /></button>
                <output aria-live="polite">{qty}</output>
                <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} aria-label={t.more} disabled={qty >= MAX_QTY}><PlusIcon size={16} weight="bold" /></button>
              </div>
              <span className={s.qtyTotal}>{t.total}: <b>${total}</b></span>
            </div>

            <button type="button" className={s.orderBtn} onClick={order}>
              <WhatsappLogoIcon size={22} weight="bold" aria-hidden />
              {t.order}
            </button>
            <p className={s.terms}>{t.terms}</p>

            <div aria-live="polite">
              {status === "needSize" && <p className={s.formError}>{t.needSize}</p>}
              {status === "copied" && <p className={s.formOk}>{t.copied}</p>}
              {status === "manual" && (
                <div className={s.formManual}>
                  <p>{t.manual}</p>
                  <pre>{message}</pre>
                </div>
              )}
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
