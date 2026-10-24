"use client";

import { CheckIcon, CopyIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import s from "./teaser.module.css";

/** Clave pública de Turnstile (opcional). Si no está, el Worker se apoya en el honeypot y el límite por IP. */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const COUNTRIES = [
  { code: "57", label: "CO +57" },
  { code: "1", label: "US +1" },
  { code: "52", label: "MX +52" },
  { code: "34", label: "ES +34" },
  { code: "58", label: "VE +58" },
  { code: "593", label: "EC +593" },
  { code: "51", label: "PE +51" },
  { code: "507", label: "PA +507" },
];

const ERRORS: Record<string, string> = {
  contact: "Déjanos tu WhatsApp o tu correo (mejor los dos).",
  email: "Ese correo no se ve bien. Revísalo.",
  phone: "Ese número de WhatsApp no se ve bien. Revísalo.",
  consent: "Necesitamos tu autorización para escribirte.",
  captcha: "No pudimos verificar que eres humano. Intenta otra vez.",
  rate: "Muchos intentos seguidos. Prueba en unos minutos.",
  network: "No pudimos conectar. Revisa tu internet e intenta otra vez.",
};

type Status = "idle" | "sending" | "done";

export function Signup({ count }: { count: number | null }) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ field?: string; msg: string } | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [already, setAlready] = useState(false);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const meta = useRef<{ source?: string; utm?: Record<string, string> }>({});

  // De dónde viene la persona (?ref=, utm_*) para saber qué enlace funcionó
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    q.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v.slice(0, 80); });
    meta.current = { source: q.get("ref") || q.get("utm_source") || undefined, utm: Object.keys(utm).length ? utm : undefined };
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    if (!email && !phone) return setError({ field: "phone", msg: ERRORS.contact });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setError({ field: "email", msg: ERRORS.email });
    if (phone && phone.replace(/\D/g, "").length < 7) return setError({ field: "phone", msg: ERRORS.phone });
    if (!f.get("consent")) return setError({ field: "consent", msg: ERRORS.consent });

    setError(null);
    setStatus("sending");
    try {
      const r = await fetch("/api/registro", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(f.get("name") || "").trim(),
          email,
          phone,
          country: String(f.get("country") || "57"),
          consent: true,
          website: String(f.get("website") || ""),
          token: String(f.get("cf-turnstile-response") || ""),
          ...meta.current,
        }),
      });
      const data = (await r.json().catch(() => ({}))) as { ok?: boolean; position?: number | null; already?: boolean; error?: string };
      if (!r.ok || !data.ok) {
        setStatus("idle");
        const field = data.error === "contact" ? "phone" : data.error;
        setError({ field, msg: ERRORS[data.error || "network"] || ERRORS.network });
        // Turnstile se usa una sola vez por token
        (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
        return;
      }
      setPosition(data.position ?? null);
      setAlready(!!data.already);
      setStatus("done");
      if (!reduce) ringBell();
    } catch {
      setStatus("idle");
      setError({ msg: ERRORS.network });
    }
  }

  const shareUrl = typeof window !== "undefined" ? `${location.origin}/?ref=amigo` : "";
  const shareText = `Me apunté a la lista de One True, la nueva casa del verdadero boxeo. Apúntate tú también: ${shareUrl}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* sin portapapeles: el enlace de WhatsApp sigue disponible */ }
  }

  const invalid = (name: string) => (error?.field === name ? { "aria-invalid": true, "aria-describedby": "lista-error" } : {});

  return (
    <section id="lista" className={s.list} aria-labelledby="lista-titulo">
      {TURNSTILE_SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />}
      <div className={s.listGrid}>
        <motion.div
          className={s.listIntro}
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="lista-titulo" className={s.listTitle}>
            Tu lugar en la <span className={s.red}>esquina roja</span>
          </h2>
          <p className={s.listText}>
            Déjanos tu WhatsApp y tu correo. El día que abramos, te escribimos antes que a nadie.
          </p>
          {count !== null && count >= 25 && (
            <p className={s.listCount}>
              <b>{count.toLocaleString("es-CO")}</b> personas ya están esperando la campana.
            </p>
          )}
        </motion.div>

        <div className={s.card}>
          <AnimatePresence mode="wait" initial={false}>
            {status !== "done" ? (
              <motion.form
                key="form"
                ref={formRef}
                className={s.form}
                onSubmit={submit}
                noValidate
                exit={reduce ? undefined : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                transition={{ duration: 0.3 }}
              >
                <div className={s.field}>
                  <label htmlFor="f-name">Nombre</label>
                  <input id="f-name" name="name" autoComplete="given-name" maxLength={80} placeholder="Cómo te llamas" />
                </div>

                <div className={s.field}>
                  <label htmlFor="f-phone">WhatsApp</label>
                  <div className={s.phoneRow}>
                    <select name="country" aria-label="Indicativo del país" defaultValue="57">
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={20} placeholder="300 123 4567" {...invalid("phone")} />
                  </div>
                </div>

                <div className={s.field}>
                  <label htmlFor="f-email">Correo</label>
                  <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="tu@correo.com" {...invalid("email")} />
                </div>

                {/* Honeypot: invisible para personas */}
                <div className={s.hp} aria-hidden>
                  <label htmlFor="f-web">No llenar</label>
                  <input id="f-web" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <label className={s.consent}>
                  <input type="checkbox" name="consent" {...invalid("consent")} />
                  <span>
                    Autorizo a One True a usar mis datos para avisarme del lanzamiento y de sus eventos (Ley 1581 de 2012).
                  </span>
                </label>
                <details className={s.policy}>
                  <summary>Cómo usamos tus datos</summary>
                  <p>
                    Usamos tu nombre, WhatsApp y correo solo para avisarte del lanzamiento del sitio y de los eventos de One True.
                    Puedes pedir que los borremos cuando quieras, escribiéndonos por WhatsApp o por Instagram a @onetrue.inc.
                  </p>
                </details>

                {TURNSTILE_SITE_KEY && <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="dark" data-appearance="interaction-only" />}

                <div aria-live="polite">
                  {error && <p id="lista-error" className={s.error}>{error.msg}</p>}
                </div>

                <button type="submit" className={s.submit} disabled={status === "sending"}>
                  <span>{status === "sending" ? "Subiendo al ring..." : "Entrar a la lista"}</span>
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                className={s.done}
                initial={reduce ? false : { opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                role="status"
              >
                <motion.p
                  className={s.ding}
                  initial={reduce ? false : { rotate: -8, scale: 0.4, opacity: 0 }}
                  animate={{ rotate: -4, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.1 }}
                >
                  Ding ding ding
                </motion.p>
                <h3 className={s.doneTitle}>{already ? "Ya estabas en la fila" : "Estás en la fila"}</h3>
                {position !== null && (
                  <p className={s.position}>
                    <span>Tu puesto</span>
                    <b>#{position.toLocaleString("es-CO")}</b>
                  </p>
                )}
                <p className={s.listText}>Te escribimos el día que suene la campana. Mientras tanto, trae a tu esquina.</p>
                <div className={s.shareRow}>
                  <a className={s.submit} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
                    <WhatsappLogoIcon size={20} weight="bold" aria-hidden />
                    <span>Invitar por WhatsApp</span>
                  </a>
                  <button type="button" className={s.ghost} onClick={copy}>
                    {copied ? <CheckIcon size={18} weight="bold" aria-hidden /> : <CopyIcon size={18} weight="bold" aria-hidden />}
                    <span>{copied ? "Enlace copiado" : "Copiar enlace"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/** Campana de inicio de asalto: tres golpes sintetizados con Web Audio (solo tras la acción del usuario). */
function ringBell() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const partials: [number, number][] = [[1, 0.5], [2.01, 0.22], [2.76, 0.18], [4.07, 0.1], [5.4, 0.05]];
    const base = 760;
    [0, 0.34, 0.68].forEach((t0) => {
      const t = ctx.currentTime + t0;
      partials.forEach(([m, gain]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = base * m;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain * 0.6, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / m ** 0.3);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 2);
      });
    });
    setTimeout(() => ctx.close(), 3200);
  } catch { /* sin audio: no pasa nada */ }
}
