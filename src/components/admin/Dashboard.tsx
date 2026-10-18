"use client";

/**
 * PANEL ONE TRUE — modo demo funcional.
 * Navegación por secciones (la sección queda en la URL: /admin/#puerta), selector de evento,
 * filtro de fechas y estado compartido entre secciones (ver ./store.tsx).
 */
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BrandBadge, Logo } from "@/components/ui/Brand";
import { mustFighter, upcomingEvents } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { RANGES, type RangeId } from "./data";
import { Buyers } from "./sections/Buyers";
import { Door } from "./sections/Door";
import { Fighters } from "./sections/Fighters";
import { Inventory } from "./sections/Inventory";
import { Overview } from "./sections/Overview";
import { Sales } from "./sections/Sales";
import { Settings } from "./sections/Settings";
import { Sponsors } from "./sections/Sponsors";
import { AdminStore, useAdmin } from "./store";
import { downloadCsv, EASE, Segmented } from "./ui";
import { useView } from "./useView";
import s from "./admin.module.css";

const NAV = [
  { id: "resumen", label: "Resumen", icon: "M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z" },
  { id: "ventas", label: "Ventas", icon: "M3 17l6-6 4 4 8-8M15 7h6v6" },
  { id: "inventario", label: "Inventario", icon: "M4 7h16M4 12h16M4 17h10" },
  { id: "compradores", label: "Compradores", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21c1.5-4 5-6 8-6s6.5 2 8 6" },
  { id: "puerta", label: "Puerta", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM15 15h2v2h-2zM19 19h1v1h-1zM14 19h1M19 14h1" },
  { id: "peleadores", label: "Peleadores", icon: "M7 4h10l-1 9H8zM9 13v7h6v-7" },
  { id: "patrocinadores", label: "Patrocinadores", icon: "M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16l-5.4 3.2 1.3-6-4.5-4 6-.6z" },
  { id: "ajustes", label: "Ajustes", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 .5-1.5-1L15 4h-4l-.5 2.5-1.5 1L7 7l-2 4 2 1v1l-2 1 2 4 2-.5 1.5 1 .5 2.5h4l.5-2.5 1.5-1 2 .5 2-4-2-1z" },
] as const;
type SectionId = (typeof NAV)[number]["id"];
const isSection = (v: string): v is SectionId => NAV.some((n) => n.id === v);

/** Secciones donde el filtro de fechas tiene sentido */
const USES_RANGE: SectionId[] = ["resumen", "ventas", "compradores", "peleadores"];

function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Dashboard() {
  return (
    <AdminStore>
      <Panel />
    </AdminStore>
  );
}

function Panel() {
  const events = upcomingEvents();
  const [nav, setNav] = useState<SectionId>("resumen");
  const [slug, setSlug] = useState(events[0].slug);
  const [range, setRange] = useState<RangeId>("all");
  const [menu, setMenu] = useState(false);
  const { toast } = useAdmin();
  const view = useView(slug, range);
  const ev = view.data.event;
  const name = view.settings.name || ev.name;
  const a = mustFighter(ev.main[0].a), b = mustFighter(ev.main[0].b);

  // Sección en la URL (#puerta) para poder compartir el link directo
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1); if (isSection(h)) setNav(h); };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const go = useCallback((id: string) => {
    if (!isSection(id)) return;
    setNav(id);
    setMenu(false);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const exportBuyers = () => {
    downloadCsv(`compradores-${slug}.csv`, [
      ["Orden", "Fecha", "Comprador", "Correo", "Zona", "Personas", "Total COP", "Pago"],
      ...view.data.orders.map((o) => [o.id, new Date(o.at).toISOString(), o.buyer, o.email, view.zones.find((z) => z.id === o.zoneId)!.name, o.people, o.total, o.method]),
    ]);
    toast(`${view.data.orders.length} compradores exportados`);
  };

  const current = NAV.find((n) => n.id === nav)!;

  return (
    <div className={s.app}>
      {/* ---------------- Barra lateral ---------------- */}
      <AnimatePresence>{menu && <motion.div className={s.scrim} onClick={() => setMenu(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}</AnimatePresence>
      <aside className={`${s.side} ${menu ? s.sideOpen : ""}`}>
        <div className={s.sideBrand}><Logo size="sm" /><span>Panel</span></div>
        <div className={s.eventPick}>
          <small>Evento</small>
          <select value={slug} onChange={(e) => { setSlug(e.target.value); toast(`Viendo ${events.find((x) => x.slug === e.target.value)!.name}`); }} aria-label="Evento">
            {events.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
        </div>
        <LayoutGroup id="admin-nav">
          <nav className={s.nav}>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className={`${s.navItem} ${nav === n.id ? s.navOn : ""}`} onClick={(e) => { e.preventDefault(); go(n.id); }} aria-current={nav === n.id ? "page" : undefined}>
                {nav === n.id && <motion.span layoutId="nav-pill" className={s.navPill} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <Icon d={n.icon} />
                <span>{n.label}</span>
                {n.id === "puerta" && <em className={s.navTag}>{fmtDate(ev.date, "es", { day: "numeric", month: "short" })}</em>}
                {n.id === "ajustes" && !view.settings.salesOpen && <em className={`${s.navTag} ${s.navTagWarn}`}>Pausada</em>}
              </a>
            ))}
          </nav>
        </LayoutGroup>
        <div className={s.sideFoot}>
          <div className={s.user}><span>OT</span><div><b>Equipo One True</b><small>Administrador</small></div></div>
          <Link href="/es/" className={s.backSite}>← Ver sitio público</Link>
        </div>
      </aside>

      {/* ---------------- Contenido ---------------- */}
      <main className={s.main}>
        <div className={s.demoBar}>Modo demo · datos de ejemplo, todavía no está conectado a ventas reales. Tus cambios se guardan solo en este navegador.</div>

        <header className={s.top}>
          <button className={s.burger} onClick={() => setMenu(!menu)} aria-label="Menú"><span /><span /><span /></button>
          <div className={s.topTitle}>
            <div className={s.topKicker}>
              <BrandBadge brand={ev.brand} />
              {view.settings.salesOpen ? <span className={s.live}><i />Venta abierta</span> : <span className={`${s.live} ${s.livePaused}`}><i />Venta pausada</span>}
              <span className={s.crumb}>/ {current.label}</span>
            </div>
            <h1>{name} <small>· {a.last} vs {b.last}</small></h1>
            <p>{fmtDate(view.settings.date ? new Date(view.settings.date).toISOString() : ev.date, "es", { weekday: "long", day: "numeric", month: "long" })} · {view.settings.venue || ev.venue}, {ev.city}</p>
          </div>
          <div className={s.topActions}>
            {USES_RANGE.includes(nav) && (
              <Segmented label="Rango de fechas" value={range} onChange={setRange} options={RANGES.map((r) => ({ id: r.id, label: r.label }))} />
            )}
            <button className={s.ghostBtn} onClick={exportBuyers}>⤓ Exportar compradores</button>
          </div>
        </header>

        {/* Sin animación de salida: el cambio de sección es inmediato y nunca queda esperando */}
        <motion.div key={nav + slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }}>
          {nav === "resumen" && <Overview view={view} go={go} />}
          {nav === "ventas" && <Sales view={view} />}
          {nav === "inventario" && <Inventory view={view} />}
          {nav === "compradores" && <Buyers view={view} />}
          {nav === "puerta" && <Door view={view} />}
          {nav === "peleadores" && <Fighters view={view} />}
          {nav === "patrocinadores" && <Sponsors view={view} />}
          {nav === "ajustes" && <Settings view={view} />}
        </motion.div>
      </main>
    </div>
  );
}
