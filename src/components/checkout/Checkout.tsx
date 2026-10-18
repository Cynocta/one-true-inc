"use client";

/**
 * CHECKOUT SIMULADO — demuestra el flujo completo de compra sin pasarela real.
 * Al integrar Wompi: el paso "Pago" se reemplaza por el widget de la pasarela y
 * el resultado llega por webhook firmado al servidor (nunca se decide en el navegador).
 */
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { BrandBadge, Logo } from "@/components/ui/Brand";
import { TICKETS, zonePrice } from "@/data/site";
import { PhaseTable } from "@/components/tickets/PhaseTable";
import { VenueLegend, VenueMap } from "@/components/tickets/VenueMap";
import { availability } from "@/components/tickets/venue";
import { mustFighter, upcomingEvents } from "@/lib/data";
import { fmtDate, fmtMoney, href, tx } from "@/lib/format";
import { CHECKOUT_COPY } from "./copy";
import {
  ADDONS, cardBrand, cardOutcome, digits, expValid, formatCard, formatExp, HOLD_SECONDS,
  luhn, NEQUI_DECLINE_PHONE, orderNumber, PSE_BANKS, TEST_CARDS, ticketCode, type Method, type Outcome,
} from "./demo";
import s from "./checkout.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Buyer = { name: string; docType: string; doc: string; email: string; phone: string; consent: boolean; terms: boolean; news: boolean };
type Phase = "form" | "processing" | "result";
type Issued = { order: string; tickets: { code: string; qr: string }[] };

export function Checkout() {
  const { lang } = useI18n();
  const c = CHECKOUT_COPY[lang];
  const params = useSearchParams();
  const events = upcomingEvents();

  const [eventSlug, setEventSlug] = useState(() => events.find((e) => e.slug === params.get("evento"))?.slug ?? events[0].slug);
  const [zoneId, setZoneId] = useState(() => TICKETS.find((z) => z.id === params.get("zona"))?.id ?? "ringside");
  const [units, setUnits] = useState<string[]>([]);
  const [qty, setQty] = useState(2);
  const [addons, setAddons] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [buyer, setBuyer] = useState<Buyer>({ name: "", docType: "CC", doc: "", email: "", phone: "", consent: false, terms: false, news: false });
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "", installments: "1" });
  const [cvcFocus, setCvcFocus] = useState(false);
  const [pse, setPse] = useState({ person: "natural", bank: "" });
  const [nequi, setNequi] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [processingMsg, setProcessingMsg] = useState("");
  const [nequiCount, setNequiCount] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [left, setLeft] = useState(HOLD_SECONDS);
  const [expired, setExpired] = useState(false);

  const ev = events.find((e) => e.slug === eventSlug)!;
  const zone = TICKETS.find((z) => z.id === zoneId)!;
  const stock = availability(zoneId).left;
  const picks = zone.kind !== "general";
  const maxQty = picks ? (zone.kind === "box" ? 4 : 10) : Math.min(10, stock);
  const count = picks ? units.length : qty; // sillas/palcos elegidos o cantidad
  const unitPrice = zonePrice(zone);
  const ticketsTotal = unitPrice * count;
  const people = zone.kind === "box" ? count * (zone.persons ?? 1) : count;
  const addonsTotal = ADDONS.reduce((sum, a) => sum + (addons[a.id] ?? 0) * a.price, 0);
  const total = ticketsTotal + addonsTotal;
  const headliner = `${mustFighter(ev.main[0].a).last} vs ${mustFighter(ev.main[0].b).last}`;

  // Reserva de cupo: corre mientras no se haya emitido la orden
  const done = phase === "result" && outcome === "approved";
  useEffect(() => {
    if (done || expired) return;
    const id = setInterval(() => setLeft((v) => {
      if (v <= 1) { setExpired(true); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [done, expired]);

  useEffect(() => { if (qty > maxQty) setQty(Math.max(1, maxQty)); }, [maxQty, qty]);

  const chooseZone = (id: string) => { if (id !== zoneId) { setZoneId(id); setUnits([]); } };
  const toggleUnit = (id: string) => setUnits((u) => (u.includes(id) ? u.filter((x) => x !== id) : u.length >= maxQty ? u : [...u, id]));
  const canContinue = count > 0;

  const go = (to: number) => { setDir(to > step ? 1 : -1); setStep(to); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const restart = () => {
    setStep(0); setPhase("form"); setOutcome(null); setIssued(null); setLeft(HOLD_SECONDS); setExpired(false); setErrors({});
  };

  /* ---------- Validaciones ---------- */
  const validateBuyer = () => {
    const e: Record<string, boolean> = {};
    if (buyer.name.trim().split(/\s+/).length < 2) e.name = true;
    if (digits(buyer.doc).length < 5) e.doc = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyer.email)) e.email = true;
    if (digits(buyer.phone).length !== 10) e.phone = true;
    if (!buyer.consent) e.consent = true;
    if (!buyer.terms) e.terms = true;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validatePayment = () => {
    const e: Record<string, boolean> = {};
    if (method === "card") {
      if (!luhn(card.number) || !cardBrand(card.number)) e.number = true;
      if (card.name.trim().length < 3) e.cardName = true;
      if (!expValid(card.exp)) e.exp = true;
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = true;
    } else if (method === "pse") {
      if (!pse.bank) e.bank = true;
    } else if (digits(nequi).length !== 10 || !digits(nequi).startsWith("3")) e.nequi = true;
    setErrors(e);
    return !Object.keys(e).length;
  };

  /* ---------- Pago simulado ---------- */
  const pay = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;
    setPhase("processing");
    let result: Outcome = "approved";

    if (method === "card") {
      setProcessingMsg(c.processing);
      await wait(2200);
      result = cardOutcome(card.number);
    } else if (method === "pse") {
      setProcessingMsg(c.redirecting);
      await wait(1600);
      setProcessingMsg(c.processing);
      await wait(1400);
      result = PSE_BANKS.find((b) => b.id === pse.bank)!.outcome;
    } else {
      setProcessingMsg(c.nequiPush);
      for (let i = 5; i > 0; i--) { setNequiCount(i); await wait(1000); }
      result = digits(nequi) === NEQUI_DECLINE_PHONE ? "declined" : "approved";
    }

    if (result === "pending") {
      setOutcome("pending");
      setPhase("result");
      await wait(4500); // el banco confirma después (en real: llega por webhook / conciliación)
      result = "approved";
    }

    if (result === "approved") {
      const order = orderNumber();
      const tickets = await Promise.all(Array.from({ length: people }, async () => {
        const code = ticketCode();
        const payload = JSON.stringify({ v: "DEMO", o: order, t: code, e: ev.slug, z: zone.id, u: units.join(",") || undefined });
        const qr = await QRCode.toDataURL(payload, { errorCorrectionLevel: "Q", margin: 2, width: 320, color: { dark: "#0a0a0b", light: "#ffffff" } });
        return { code, qr };
      }));
      setIssued({ order, tickets });
    }
    setOutcome(result);
    setPhase("result");
    setDir(1);
    setStep(3);
  };

  const mmss = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  const brand = cardBrand(card.number);

  /* ---------- Render ---------- */
  const stepVariants = {
    enter: (d: number) => ({ x: d * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -60, opacity: 0 }),
  };

  const fieldCtx = useMemo(() => ({ errors, invalid: c.invalid }), [errors, c.invalid]);

  return (
    <FieldCtx.Provider value={fieldCtx}>
    <div className={s.wrap}>
      <div className={s.demo}>⚠ {c.demo}</div>

      {/* Stepper */}
      <ol className={s.stepper}>
        {c.steps.map((label, i) => (
          <li key={label} className={`${i <= step ? s.stepOn : ""} ${i === step ? s.stepNow : ""}`}>
            <span className={s.stepDot}>{i < step ? "✓" : i + 1}</span>
            <span className={s.stepLabel}>{label}</span>
          </li>
        ))}
        <motion.span className={s.stepBar} animate={{ scaleX: step / (c.steps.length - 1) }} transition={{ duration: 0.6, ease: EASE }} />
      </ol>

      <div className={s.grid}>
        <div className={s.main}>
          <AnimatePresence mode="wait" custom={dir}>
            {/* ---------------- PASO 1: BOLETAS ---------------- */}
            {step === 0 && (
              <motion.section key="s0" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: EASE }}>
                {events.length > 1 && (
                  <LayoutGroup id="co-events">
                    <div className={s.events}>
                      {events.map((e) => (
                        <button key={e.slug} type="button" className={`${s.eventBtn} ${e.slug === eventSlug ? s.eventOn : ""}`} onClick={() => setEventSlug(e.slug)}>
                          {e.slug === eventSlug && <motion.span layoutId="co-ev" className={s.eventBg} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                          <BrandBadge brand={e.brand} />
                          <b>{e.name}</b>
                          <small>{fmtDate(e.date, lang, { day: "numeric", month: "short", year: "numeric" })}</small>
                        </button>
                      ))}
                    </div>
                  </LayoutGroup>
                )}

                <h2 className={s.h2}>{c.zone}</h2>
                <VenueMap zone={zoneId} onZone={chooseZone} units={units} onUnit={toggleUnit} />
                <VenueLegend zone={zoneId} onZone={chooseZone} />

                <AnimatePresence mode="wait">
                  <motion.div key={zoneId} className={s.pick} style={{ ["--zc" as string]: zone.color }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                    <div className={s.pickInfo}>
                      <i />
                      <div>
                        <b>{tx(zone.name, lang)}</b>
                        <small>{zone.perks[lang].join(" · ")}</small>
                      </div>
                      <span className={s.pickPrice}>{fmtMoney(unitPrice)}<small>{zone.kind === "box" ? c.perBox : c.perPerson}</small></span>
                    </div>
                    {picks ? (
                      <p className={s.pickHint}>
                        {units.length
                          ? <>✓ {units.length} {zone.kind === "box" ? c.boxesChosen : c.seatsChosen} · <button type="button" onClick={() => setUnits([])}>{c.clear}</button></>
                          : zone.kind === "box" ? c.pickBox : c.pickSeat}
                        <small> ({c.max} {maxQty})</small>
                      </p>
                    ) : (
                      <div className={s.qtyRow}>
                        <span className={s.qtyLabel}>{c.qty} <small className={stock <= 10 ? s.hot : ""}>{c.left} {stock}</small></span>
                        <div className={s.stepperNum}>
                          <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} disabled={qty <= 1} aria-label="-">−</button>
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.b key={qty} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}>{qty}</motion.b>
                          </AnimatePresence>
                          <button type="button" onClick={() => setQty((v) => Math.min(maxQty, v + 1))} disabled={qty >= maxQty} aria-label="+">+</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <PhaseTable zone={zoneId} onZone={chooseZone} />

                <h2 className={s.h2}>{c.addons}</h2>
                <p className={s.sub}>{c.addonsSub}</p>
                <div className={s.addons}>
                  {ADDONS.map((a) => {
                    const n = addons[a.id] ?? 0;
                    return (
                      <div key={a.id} className={`${s.addon} ${n ? s.addonOn : ""}`}>
                        <div><b>{a.name[lang]}</b><small>{a.desc[lang]} · {fmtMoney(a.price)}</small></div>
                        <div className={s.stepperNum}>
                          <button type="button" onClick={() => setAddons({ ...addons, [a.id]: Math.max(0, n - 1) })} disabled={!n} aria-label="-">−</button>
                          <b>{n}</b>
                          <button type="button" onClick={() => setAddons({ ...addons, [a.id]: Math.min(a.max, n + 1) })} disabled={n >= a.max} aria-label="+">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={s.actions}>
                  <button type="button" className="btn btn-red" onClick={() => go(1)} disabled={!canContinue}>{c.next} →</button>
                </div>
              </motion.section>
            )}

            {/* ---------------- PASO 2: DATOS ---------------- */}
            {step === 1 && (
              <motion.form key="s1" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: EASE }}
                onSubmit={(e) => { e.preventDefault(); if (validateBuyer()) go(2); }} noValidate>
                <div className={s.form}>
                  <div className={s.full}><Field id="name" label={c.name}><input value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} autoComplete="name" /></Field></div>
                  <Field id="docType" label={c.docType}>
                    <select value={buyer.docType} onChange={(e) => setBuyer({ ...buyer, docType: e.target.value })}>
                      <option value="CC">CC</option><option value="CE">CE</option><option value="TI">TI</option><option value="PP">Pasaporte</option>
                    </select>
                  </Field>
                  <Field id="doc" label={c.doc}><input value={buyer.doc} inputMode="numeric" onChange={(e) => setBuyer({ ...buyer, doc: digits(e.target.value).slice(0, 12) })} /></Field>
                  <Field id="email" label={c.email} hint={c.emailHint}><input type="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value.trim() })} autoComplete="email" /></Field>
                  <Field id="phone" label={c.phone}><input inputMode="tel" value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: digits(e.target.value).slice(0, 10) })} placeholder="3001234567" autoComplete="tel" /></Field>
                  {(["consent", "terms", "news"] as const).map((k) => (
                    <label key={k} className={`${s.check} ${s.full} ${errors[k] ? s.checkErr : ""}`}>
                      <input type="checkbox" checked={buyer[k]} onChange={(e) => setBuyer({ ...buyer, [k]: e.target.checked })} />
                      <span>{c[k]}</span>
                    </label>
                  ))}
                </div>
                <div className={s.actions}>
                  <button type="button" className="btn btn-outline" onClick={() => go(0)}>← {c.back}</button>
                  <button type="submit" className="btn btn-red">{c.next} →</button>
                </div>
              </motion.form>
            )}

            {/* ---------------- PASO 3: PAGO ---------------- */}
            {step === 2 && (
              <motion.form key="s2" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: EASE }} onSubmit={pay} noValidate>
                <h2 className={s.h2}>{c.method}</h2>
                <LayoutGroup id="co-methods">
                  <div className={s.methods}>
                    {(["card", "pse", "nequi"] as const).map((m) => (
                      <button key={m} type="button" className={`${s.method} ${method === m ? s.methodOn : ""}`} onClick={() => { setMethod(m); setErrors({}); }}>
                        {method === m && <motion.span layoutId="co-method" className={s.methodBg} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                        <span className={s.methodIcon}>{m === "card" ? "💳" : m === "pse" ? "🏦" : "📱"}</span>
                        <b>{c[m]}</b>
                      </button>
                    ))}
                  </div>
                </LayoutGroup>

                <AnimatePresence mode="wait">
                  {method === "card" && (
                    <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={s.cardWrap}>
                      {/* Tarjeta animada */}
                      <div className={s.cardScene}>
                        <motion.div className={s.card3d} animate={{ rotateY: cvcFocus ? 180 : 0 }} transition={{ duration: 0.6, ease: EASE }}>
                          <div className={`${s.cardFace} ${s[`brand_${brand ?? "none"}`]}`}>
                            <div className={s.cardTop}><span className={s.chip} /><span className={s.cardBrand}>{brand ? brand.toUpperCase() : "—"}</span></div>
                            <div className={s.cardNum}>{card.number || "•••• •••• •••• ••••"}</div>
                            <div className={s.cardBottom}><span>{card.name || c.cardName}</span><span>{card.exp || "MM/AA"}</span></div>
                          </div>
                          <div className={`${s.cardFace} ${s.cardBack} ${s[`brand_${brand ?? "none"}`]}`}>
                            <div className={s.stripe} />
                            <div className={s.cvcBox}><span>{card.cvc.replace(/./g, "•") || "CVC"}</span></div>
                          </div>
                        </motion.div>
                      </div>
                      <div className={s.form}>
                        <div className={s.full}><Field id="number" label={c.cardNumber}><input inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} placeholder="0000 0000 0000 0000" /></Field></div>
                        <div className={s.full}><Field id="cardName" label={c.cardName}><input autoComplete="off" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase().slice(0, 26) })} /></Field></div>
                        <Field id="exp" label={c.exp}><input inputMode="numeric" autoComplete="off" value={card.exp} onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })} placeholder="MM/AA" /></Field>
                        <Field id="cvc" label={c.cvc}><input inputMode="numeric" autoComplete="off" value={card.cvc} onFocus={() => setCvcFocus(true)} onBlur={() => setCvcFocus(false)} onChange={(e) => setCard({ ...card, cvc: digits(e.target.value).slice(0, 4) })} placeholder="123" /></Field>
                        <Field id="installments" label={c.installments}>
                          <select value={card.installments} onChange={(e) => setCard({ ...card, installments: e.target.value })}>
                            {[1, 2, 3, 6, 12, 24, 36].map((n) => <option key={n}>{n}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div className={s.testBox}>
                        <b>{c.testCards}:</b>
                        <button type="button" onClick={() => setCard({ number: TEST_CARDS.approved, name: "ONE TRUE DEMO", exp: "12/30", cvc: "123", installments: "1" })}>{TEST_CARDS.approved} → {c.approvedCard}</button>
                        <button type="button" onClick={() => setCard({ number: TEST_CARDS.declined, name: "ONE TRUE DEMO", exp: "12/30", cvc: "123", installments: "1" })}>{TEST_CARDS.declined} → {c.declinedCard}</button>
                      </div>
                    </motion.div>
                  )}

                  {method === "pse" && (
                    <motion.div key="pse" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={s.form}>
                      <Field id="person" label={c.personType}>
                        <select value={pse.person} onChange={(e) => setPse({ ...pse, person: e.target.value })}>
                          <option value="natural">{c.natural}</option><option value="juridica">{c.juridica}</option>
                        </select>
                      </Field>
                      <Field id="bank" label={c.bank}>
                        <select value={pse.bank} onChange={(e) => setPse({ ...pse, bank: e.target.value })}>
                          <option value="">{c.chooseBank}</option>
                          {PSE_BANKS.map((b) => <option key={b.id} value={b.id}>{b.name[lang]}</option>)}
                        </select>
                      </Field>
                    </motion.div>
                  )}

                  {method === "nequi" && (
                    <motion.div key="nequi" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={s.form}>
                      <div className={s.full}>
                        <Field id="nequi" label={c.nequiPhone} hint={c.nequiHint}>
                          <input inputMode="tel" value={nequi} onChange={(e) => setNequi(digits(e.target.value).slice(0, 10))} placeholder="3001234567" />
                        </Field>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={s.actions}>
                  <button type="button" className="btn btn-outline" onClick={() => go(1)}>← {c.back}</button>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} className={`btn btn-red ${s.payBtn}`}>🔒 {c.pay} {fmtMoney(total)}</motion.button>
                </div>
              </motion.form>
            )}

            {/* ---------------- PASO 4: RESULTADO ---------------- */}
            {step === 3 && outcome && (
              <motion.section key="s3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                {outcome === "approved" && issued ? (
                  <div className={s.result}>
                    <Burst />
                    <motion.div className={`${s.resIcon} ${s.ok}`} initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>✓</motion.div>
                    <h2>{c.approved}</h2>
                    <p>{c.approvedSub} <b>{buyer.email}</b></p>
                    <div className={s.orderNo}>{c.order} <b>{issued.order}</b></div>

                    <h3 className={s.h2}>{c.yourTickets}</h3>
                    <div className={s.tickets}>
                      {issued.tickets.map((tk, i) => (
                        <motion.div key={tk.code} className={s.ticket} initial={{ opacity: 0, y: 30, rotateX: -20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: EASE }}>
                          <div className={s.tkMain}>
                            <div className={s.tkHead}><Logo size="sm" /><BrandBadge brand={ev.brand} /></div>
                            <b className={s.tkEvent}>{ev.name}</b>
                            <span className={s.tkFight}>{headliner}</span>
                            <dl>
                              <div><dt>{c.event}</dt><dd>{fmtDate(ev.date, lang, { day: "numeric", month: "short", year: "numeric" })}</dd></div>
                              <div><dt>Zona</dt><dd>{tx(zone.name, lang)}</dd></div>
                              <div><dt>{c.holder}</dt><dd>{buyer.name}</dd></div>
                              <div><dt>#</dt><dd>{i + 1}/{issued.tickets.length}</dd></div>
                            </dl>
                          </div>
                          <div className={s.tkStub}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={tk.qr} alt={`QR ${tk.code}`} />
                            <code>{tk.code}</code>
                            <small>{c.demoQr}</small>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className={s.actions}>
                      <Link className="btn btn-dark" href={href(lang, `eventos/${ev.slug}`)}>{c.backEvent}</Link>
                    </div>
                  </div>
                ) : outcome === "pending" ? (
                  <div className={s.result}>
                    <motion.div className={`${s.resIcon} ${s.wait}`} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>⟳</motion.div>
                    <h2>{c.pending}</h2>
                    <p>{c.pendingSub}</p>
                  </div>
                ) : (
                  <div className={s.result}>
                    <motion.div className={`${s.resIcon} ${s.bad}`} initial={{ scale: 0 }} animate={{ scale: 1, x: [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.6 }}>✕</motion.div>
                    <h2>{c.declined}</h2>
                    <p>{c.declinedSub}</p>
                    <div className={s.actions}>
                      <button type="button" className="btn btn-red" onClick={() => { setOutcome(null); setPhase("form"); go(2); }}>{c.retry}</button>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------- RESUMEN ---------------- */}
        <aside className={s.summary}>
          {!done && (
            <div className={`${s.hold} ${left < 120 ? s.holdLow : ""}`}>
              <span>{c.hold}</span>
              <b>{mmss}</b>
              <motion.i style={{ scaleX: left / HOLD_SECONDS }} />
            </div>
          )}
          <div className={s.sumBox}>
            <div className={s.sumEvent}>
              <BrandBadge brand={ev.brand} />
              <b>{ev.name}</b>
              <span>{headliner}</span>
              <small>{fmtDate(ev.date, lang, { weekday: "short", day: "numeric", month: "short" })} · {ev.venue}</small>
            </div>
            <h4>{c.summary}</h4>
            <div className={s.line}><span>{tx(zone.name, lang)} × {count}{zone.kind === "box" ? ` (${people} ${c.people})` : ""}</span><b>{fmtMoney(ticketsTotal)}</b></div>
            {picks && units.length > 0 && <div className={s.unitChips}>{units.map((u) => <span key={u}>{u.replace(/^[RPV]/, "#")}</span>)}</div>}
            {ADDONS.filter((a) => addons[a.id]).map((a) => (
              <div key={a.id} className={s.line}><span>{a.name[lang]} × {addons[a.id]}</span><b>{fmtMoney(a.price * addons[a.id])}</b></div>
            ))}
            <div className={`${s.line} ${s.totalLine}`}>
              <span>{c.total}</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.b key={total} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{fmtMoney(total)}</motion.b>
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </div>

      {/* Procesando */}
      <AnimatePresence>
        {phase === "processing" && (
          <motion.div className={s.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={s.modal} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
              {method === "nequi" && nequiCount > 0 ? (
                <div className={s.phone}><motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1 }}>📲</motion.span><b>{nequiCount}</b></div>
              ) : (
                <div className={s.spinner}><span /><span /><span /></div>
              )}
              <p>{processingMsg}</p>
              <small>{fmtMoney(total)}</small>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reserva vencida */}
      <AnimatePresence>
        {expired && !done && (
          <motion.div className={s.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={s.modal} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <div className={`${s.resIcon} ${s.bad}`}>⏱</div>
              <p>{c.holdExpired}</p>
              <button type="button" className="btn btn-red" onClick={restart}>{c.restart}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </FieldCtx.Provider>
  );
}

/**
 * Campo de formulario. Vive FUERA de <Checkout> para que React no lo vuelva a montar
 * en cada render (si no, el input pierde el foco con cada letra). Los errores llegan por contexto.
 */
const FieldCtx = createContext<{ errors: Record<string, boolean>; invalid: string }>({ errors: {}, invalid: "" });

function Field({ id, label, children, hint }: { id: string; label: string; children: ReactNode; hint?: string }) {
  const { errors, invalid } = useContext(FieldCtx);
  return (
    <label className={`${s.field} ${errors[id] ? s.fieldErr : ""}`}>
      <span>{label}</span>
      {children}
      {errors[id] ? <small className={s.err}>{invalid}</small> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

/** Explosión de partículas al aprobar el pago */
function Burst() {
  const parts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    a: (i / 28) * Math.PI * 2, d: 90 + Math.random() * 120, c: ["#d7141e", "#e3b341", "#ffffff", "#0a0a0b"][i % 4], r: Math.random() * 360,
  })), []);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={s.burst} ref={ref} aria-hidden>
      {parts.map((p, i) => (
        <motion.i key={i} style={{ background: p.c }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d + 60, opacity: 0, rotate: p.r }}
          transition={{ duration: 1.4, ease: "easeOut" }} />
      ))}
    </div>
  );
}
