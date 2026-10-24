"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/i18n/config";
import { ALBUM, ANNIVERSARY, CHAPTERS, COVER, FIRST_NIGHT, type Chapter, type Fighter } from "./data";
import { gazetteFonts } from "./fonts";
import s from "./gazette.module.css";
import { dateParts, longDate, Print, Rise, Stamp, Tally, Teletype } from "./parts";
import { ShirtOrder } from "./ShirtOrder";

const UI = {
  es: {
    mast: "The True Times",
    mastSub: "El diario del boxeo de One True",
    year: "Año II",
    edition: "Edición conmemorativa",
    country: "Colombia",
    headline: "Dos años de boxeo en cinco noches",
    lead: "Del 24 de noviembre de 2024 a hoy: la historia de One True, contada en papel y tinta.",
    read: "Leer la historia",
    toShirt: "Ver la camiseta",
    inside: "En esta edición",
    classifieds: "Clasificados: la camiseta del aniversario",
    coverCaption: "TrueBoxing 3, 26 de abril de 2026.",
    since: "días desde la primera campana",
    until: "días para el segundo aniversario",
    done: "Dos años de One True",
    breaking: ["Última hora", "TrueBoxing 4", "Distrito Palmas", "Medellín"],
    end: "Fin de la edición",
    top: "Volver a la portada",
    extra: "¡Extra!",
    skip: "Saltar",
  },
  en: {
    mast: "The True Times",
    mastSub: "One True's boxing paper",
    year: "Year II",
    edition: "Anniversary edition",
    country: "Colombia",
    headline: "Two years of boxing in five nights",
    lead: "From November 24, 2024 to today: the One True story, told in paper and ink.",
    read: "Read the story",
    toShirt: "See the tee",
    inside: "In this edition",
    classifieds: "Classifieds: the anniversary tee",
    coverCaption: "TrueBoxing 3, April 26, 2026.",
    since: "days since the first bell",
    until: "days to the second anniversary",
    done: "Two years of One True",
    breaking: ["Breaking", "TrueBoxing 4", "Distrito Palmas", "Medellín"],
    end: "End of edition",
    top: "Back to the front page",
    extra: "Extra!",
    skip: "Skip",
  },
} as const;

const DAY = 86_400_000;

export function Gazette({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const [today, setToday] = useState<string | null>(null);
  const [days, setDays] = useState<{ since: number; until: number } | null>(null);

  // Fechas del lado del cliente (el sitio es estático: en el build no sabemos qué día lo leen)
  useEffect(() => {
    const now = new Date();
    setToday(now.toLocaleDateString(lang === "es" ? "es-CO" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    // Días de calendario (medianoche local), no horas transcurridas
    // (se toma solo la fecha "AAAA-MM-DD" para que la zona horaria del visitante no corra el día)
    const localDay = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d).getTime(); };
    const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    setDays({
      since: Math.round((day0 - localDay(FIRST_NIGHT)) / DAY),
      until: Math.round((localDay(ANNIVERSARY) - day0) / DAY),
    });
  }, [lang]);

  return (
    <div className={`${s.root} ${gazetteFonts}`} id="portada">
      <PressIntro title={t.mast} extra={t.extra} skip={t.skip} />
      <div aria-hidden className={s.grain} />

      <div className={s.sheet}>
        {/* ---------- Cabezote ---------- */}
        <header className={s.mast}>
          <div className={s.mastBar}>
            <span>{t.year}</span>
            <span className={s.mastDate}>{today ?? t.edition}</span>
            <span>{t.country}</span>
          </div>
          <h1 className={s.mastTitle} aria-label={t.mast}>
            {Array.from(t.mast).map((ch, i) => (
              <span key={i} aria-hidden style={{ animationDelay: `${2.15 + i * 0.05}s` }}>{ch}</span>
            ))}
          </h1>
          <p className={s.mastSub}>{t.mastSub}</p>
        </header>

        {/* ---------- Portada ---------- */}
        <section className={s.front} aria-labelledby="titular">
          <h2 id="titular" className={s.frontHead}>
            {t.headline.split(" ").map((w, i) => (
              <span key={i} style={{ animationDelay: `${2.75 + i * 0.07}s` }}>{w} </span>
            ))}
          </h2>
          <div className={s.frontGrid}>
            <Print photo={COVER} lang={lang} className={s.frontPhoto} eager caption={t.coverCaption} />
            <div className={s.frontSide}>
              <p className={s.frontLead}>{t.lead}</p>
              <div className={s.frontCtas}>
                <a href="#historia" className={s.btnInk}>{t.read}</a>
                <a href="#camiseta" className={s.btnLine}>{t.toShirt}</a>
              </div>
              <nav className={s.index} aria-label={t.inside}>
                <h3>{t.inside}</h3>
                <ol>
                  {CHAPTERS.map((c) => (
                    <li key={c.id}>
                      <a href={`#${c.id}`}>
                        <span>{c.title[lang]}</span>
                        <i>{longDate(c.date, lang)}</i>
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="#camiseta"><span>{t.classifieds}</span></a>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </section>

        {/* ---------- Línea de tiempo ---------- */}
        <Timeline lang={lang} breaking={t.breaking} />

        {/* ---------- Álbum ---------- */}
        <Album lang={lang} />

        {/* ---------- Contador ---------- */}
        <section className={s.tally} aria-label={t.since}>
          <Rise className={s.tallyCell}>
            <Tally value={days?.since ?? null} className={s.tallyNum} />
            <span className={s.tallyLabel}>{t.since}</span>
          </Rise>
          <Rise className={s.tallyCell} delay={0.12}>
            {days && days.until <= 0 ? (
              <span className={s.tallyDone}>{t.done}</span>
            ) : (
              <>
                <Tally value={days?.until ?? null} className={`${s.tallyNum} ${s.tallyRed}`} />
                <span className={s.tallyLabel}>{t.until}</span>
              </>
            )}
          </Rise>
        </section>

        {/* ---------- Clasificados: camiseta ---------- */}
        <ShirtOrder lang={lang} />

        <footer className={s.colophon}>
          <span>{t.end}</span>
          <a href="#portada">{t.top}</a>
        </footer>
      </div>
    </div>
  );
}

/* ====================================================================== */

/** Periódico que llega girando, como en el cine. Es CSS puro (no tapa la página si falla el JS) y se puede saltar. */
function PressIntro({ title, extra, skip }: { title: string; extra: string; skip: string }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className={s.intro} aria-hidden onClick={() => setGone(true)} onAnimationEnd={(e) => { if (e.target === e.currentTarget) setGone(true); }}>
      <div className={s.introSheet}>
        <span className={s.introMast}>{title}</span>
        <span className={s.introExtra}>{extra}</span>
        <span className={s.introCols}><i /><i /><i /></span>
      </div>
      <button type="button" className={s.introSkip} tabIndex={-1}>{skip}</button>
    </div>
  );
}

/* ====================================================================== */

function Timeline({ lang, breaking }: { lang: Lang; breaking: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 55%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  // Capítulo activo: solo cambia de estado al cruzar un capítulo, no en cada frame
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement)); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const current = dateParts(CHAPTERS[active].date, lang);

  return (
    <div ref={ref} className={s.timeline} id="historia">
      {/* Riel lateral (escritorio) */}
      <aside className={s.rail} aria-hidden>
        <div className={s.railTrack}>
          <motion.span className={s.railInk} style={{ scaleY: reduce ? 1 : progress }} />
        </div>
        <ol className={s.railDates}>
          {CHAPTERS.map((c, i) => {
            const d = dateParts(c.date, lang);
            return (
              <li key={c.id} className={i === active ? s.railOn : i < active ? s.railPast : ""}>
                <b>{d.year}</b>
                <span>{d.day} {d.month}</span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Barra superior (móvil) */}
      <div className={s.mobileRail} aria-hidden>
        <span>{current.day} {current.month} {current.year}</span>
        <motion.i style={{ scaleX: reduce ? 1 : progress }} />
      </div>

      <div className={s.chapters}>
        {CHAPTERS.map((c, i) => (
          <ChapterView key={c.id} c={c} lang={lang} breaking={breaking} index={CHAPTERS.slice(0, i).filter((x) => x.layout === "brief").length} />
        ))}
      </div>
    </div>
  );
}

function ChapterView({ c, lang, breaking, index }: { c: Chapter; lang: Lang; breaking: readonly string[]; index: number }) {
  const reduce = useReducedMotion();
  const caption = [longDate(c.date, lang), c.venue?.[lang]].filter(Boolean).join(". ") + ".";
  const [first, ...rest] = c.body[lang].split(/(?<=\.)\s+/);
  const d = dateParts(c.date, lang);

  switch (c.layout) {
    case "brief":
      // Noches sin fotos en el archivo: nota tipográfica (par = gran fecha, impar = telegrama)
      return index % 2 === 0 ? (
        <article id={c.id} className={`${s.ch} ${s.chBrief}`}>
          <motion.div
            className={s.briefDate}
            aria-hidden
            initial={reduce ? false : { opacity: 0, scale: 1.25 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={s.briefDay}>{d.day}</span>
            <span className={s.briefMonth}>{d.month} {d.year}</span>
          </motion.div>
          <div className={s.briefText}>
            <Rise><h2 className={s.h2xl}>{c.title[lang]}</h2></Rise>
            <Rise delay={0.1}><p className={`${s.body} ${s.dropcap} ${s.cols2}`}>{c.body[lang]}</p></Rise>
            {c.quote && <Rise delay={0.2}><blockquote className={s.pull}>“{c.quote[lang]}”</blockquote></Rise>}
          </div>
        </article>
      ) : (
        <article id={c.id} className={`${s.ch} ${s.chTelegram}`}>
          <motion.div
            className={s.telegram}
            initial={reduce ? false : { opacity: 0, y: 60, rotate: 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            <header className={s.telegramHead}>
              <span>{lang === "es" ? "Telegrama" : "Telegram"}</span>
              <span>{d.day} {d.month} {d.year}</span>
            </header>
            <Teletype text={c.title[lang]} as="h2" className={s.telegramTitle} />
            <p className={`${s.body} ${s.typed}`}>{c.body[lang]}</p>
            {c.quote && (
              <motion.p
                className={s.telegramStamp}
                initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -20 }}
                whileInView={{ scale: 1, opacity: 1, rotate: -8 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.5 }}
              >
                {c.quote[lang]}
              </motion.p>
            )}
          </motion.div>
        </article>
      );

    case "torn":
      return (
        <article id={c.id} className={`${s.ch} ${s.chTorn}`}>
          <Rise><h2 className={`${s.h2xl} ${s.italic}`}>{c.title[lang]}</h2></Rise>
          <div className={s.tornGrid}>
            <Rise className={s.tornCol}><p className={`${s.body} ${s.dropcap}`}>{first}</p></Rise>
            <div className={s.tornMid}>
              <Stamp iso={c.date} lang={lang} className={s.tornStamp} />
              <motion.div
                className={s.torn}
                initial={reduce ? false : { y: 60, rotate: 3, opacity: 0 }}
                whileInView={{ y: 0, rotate: -1.5, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              >
                <Print photo={c.photos[0]} lang={lang} caption={c.photos[0].alt[lang] + "."} className={s.wide} />
              </motion.div>
            </div>
            <Rise className={s.tornCol} delay={0.15}><p className={s.body}>{rest.join(" ")}</p></Rise>
          </div>
          {/* Tablero de recortes con el resto de la noche */}
          <div className={s.pinboard}>
            {c.photos.slice(1).map((ph, i) => (
              <motion.div
                key={ph.src}
                className={s.pin}
                style={{ ["--tilt" as string]: `${[-2.5, 1.8, -1.2, 2.4, -1.8, 1.2, -2][i % 7]}deg` }}
                initial={reduce ? false : { opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 90, damping: 16, delay: (i % 4) * 0.08 }}
              >
                <Print photo={ph} lang={lang} className={s.wide} />
              </motion.div>
            ))}
          </div>
          <p className={s.cap}>{caption}</p>
        </article>
      );

    case "contact":
      return (
        <article id={c.id} className={`${s.ch} ${s.chContact}`}>
          <div className={s.contactHead}>
            <Stamp iso={c.date} lang={lang} />
            <Rise><h2 className={s.h2xl}>{c.title[lang]}</h2></Rise>
          </div>
          <div className={s.film}>
            <div className={s.filmStrip}>
              {c.photos.map((ph, i) => (
                <motion.div
                  key={ph.src}
                  className={s.frame}
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: (i % 4) * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Print photo={ph} lang={lang} />
                  {i === 0 && (
                    <svg className={s.grease} viewBox="0 0 200 260" aria-hidden preserveAspectRatio="none">
                      <motion.path
                        d="M104 8 C 40 6, 6 60, 10 132 C 14 210, 70 254, 112 250 C 170 246, 196 190, 192 120 C 188 52, 150 12, 92 14"
                        initial={reduce ? false : { pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 1.1, delay: 0.6, ease: "easeInOut" }}
                      />
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          <Rise className={s.contactText}>
            <p className={s.body}>{c.body[lang]}</p>
            <p className={s.cap}>{caption}</p>
          </Rise>
        </article>
      );

    case "wire":
      return (
        <article id={c.id} className={`${s.ch} ${s.chWire}`}>
          <div className={s.ticker} aria-label={breaking.join(", ")}>
            <div className={s.tickerTrack} aria-hidden>
              {[0, 1].map((k) => (
                <span key={k}>{breaking.map((b) => <b key={b}>{b}</b>)}</span>
              ))}
            </div>
          </div>
          <Teletype text={c.title[lang]} className={s.wireHead} />
          <div className={s.wireGrid}>
            <div className={s.cardBox}>
              <h3 className={s.cardTitle}>{lang === "es" ? "La cartelera" : "The fight card"}</h3>
              <ol className={s.card}>
                {c.card?.map(([a, b], i) => (
                  <motion.li
                    key={a.name}
                    initial={reduce ? false : { opacity: 0, x: i % 2 ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Corner f={a} lang={lang} />
                    <span className={s.vs}>vs</span>
                    <Corner f={b} lang={lang} right />
                  </motion.li>
                ))}
              </ol>
            </div>
            <div className={s.wireSide}>
              <Stamp iso={c.date} lang={lang} />
              <Rise delay={0.2}><p className={`${s.body} ${s.typed}`}>{c.body[lang]}</p></Rise>
              <p className={s.cap}>{caption}</p>
            </div>
          </div>
        </article>
      );
  }
}

/** Esquina de la cartelera: retrato si existe en el Drive; si no, solo las iniciales. */
function Corner({ f, lang, right = false }: { f: Fighter; lang: Lang; right?: boolean }) {
  const initials = f.name.replace(/[“”"]/g, "").split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
  return (
    <span className={`${s.corner} ${right ? s.cornerR : ""}`}>
      {f.photo ? <Print photo={f.photo} lang={lang} className={s.face} /> : <span className={s.faceEmpty} aria-hidden>{initials}</span>}
      <b>{f.name}</b>
    </span>
  );
}

const ALBUM_COPY = {
  es: { title: "Desde la tribuna", sub: "Más noches de la casa, vistas por sus fotógrafos." },
  en: { title: "From the stands", sub: "More nights at the house, through the eyes of its photographers." },
};

/** Álbum de la casa: muro de fotos en columnas, cada una se imprime al entrar. */
function Album({ lang }: { lang: Lang }) {
  const t = ALBUM_COPY[lang];
  return (
    <section className={s.album} aria-labelledby="album-titulo">
      <Rise className={s.albumHead}>
        <h2 id="album-titulo" className={s.h2xl}>{t.title}</h2>
        <p className={s.body}>{t.sub}</p>
      </Rise>
      <div className={s.albumGrid}>
        {ALBUM.map((a, i) => (
          <Print key={a.photo.src} photo={a.photo} lang={lang} className={`${s.albumItem} ${i % 3 === 1 ? s.albumTall : ""}`} caption={longDate(a.date, lang) + "."} />
        ))}
      </div>
    </section>
  );
}
