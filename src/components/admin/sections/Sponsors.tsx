"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { compact, SalesChart } from "../charts";
import { useAdmin, type Sponsor, type Tier } from "../store";
import { Card, downloadCsv, Empty, Stat, Toggle } from "../ui";
import type { View } from "../useView";
import s from "../admin.module.css";

const PLACEMENTS = ["Portada", "Cartelera", "Boleta", "Correo", "Mapa del recinto"];
const TIERS: Tier[] = ["Presentado por", "Oro", "Plata"];
const TIER_WEIGHT: Record<Tier, number> = { "Presentado por": 1, Oro: 0.55, Plata: 0.25 };

/** Audiencia estimada (demo) a partir de las visitas del evento y las ubicaciones del patrocinador */
function audience(sp: Sponsor, view: View) {
  const visits = view.data.funnel[0].value;
  const impressions = sp.active ? Math.round(visits * (0.6 + sp.placements.length * 0.45) * TIER_WEIGHT[sp.tier]) : 0;
  const ctr = 0.9 + sp.placements.length * 0.25 + (sp.tier === "Presentado por" ? 0.8 : 0);
  const clicks = Math.round((impressions * ctr) / 100);
  const emails = sp.placements.includes("Correo") ? view.data.totals.orders : 0;
  const tickets = sp.placements.includes("Boleta") ? view.data.totals.sold : 0;
  return { impressions, clicks, ctr: impressions ? (clicks / impressions) * 100 : 0, emails, tickets };
}

export function Sponsors({ view }: { view: View }) {
  const { state, dispatch, toast } = useAdmin();
  const [form, setForm] = useState<{ name: string; tier: Tier; url: string }>({ name: "", tier: "Oro", url: "" });
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<string | null>(state.sponsors[0]?.id ?? null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) { toast("Escribe el nombre del patrocinador", "err"); return; }
    if (form.url && !/^https?:\/\/\S+\.\S+/.test(form.url)) { toast("El link debe empezar por https://", "err"); return; }
    if (form.tier === "Presentado por" && state.sponsors.some((x) => x.tier === "Presentado por" && x.active)) { toast("Ya hay un “Presentado por” activo; pausa el actual primero", "warn"); return; }
    const sp: Sponsor = { id: `s${Date.now()}`, name: form.name.trim(), tier: form.tier, url: form.url.trim(), active: true, placements: ["Cartelera"] };
    dispatch({ type: "addSponsor", sp });
    setSelected(sp.id); setAdding(false); setForm({ name: "", tier: "Oro", url: "" });
    toast(`${sp.name} agregado`);
  };

  const update = (sp: Sponsor) => dispatch({ type: "updateSponsor", sp });
  const sel = state.sponsors.find((x) => x.id === selected);
  const totals = state.sponsors.reduce((acc, sp) => { const a = audience(sp, view); return { imp: acc.imp + a.impressions, clicks: acc.clicks + a.clicks }; }, { imp: 0, clicks: 0 });

  const report = (sp: Sponsor) => {
    const a = audience(sp, view);
    downloadCsv(`reporte-${sp.name.replace(/\W+/g, "-").toLowerCase()}-${view.slug}.csv`, [
      ["Patrocinador", sp.name], ["Evento", view.data.event.name], ["Nivel", sp.tier], ["Ubicaciones", sp.placements.join(" · ")],
      ["Impresiones", a.impressions], ["Clics", a.clicks], ["CTR %", a.ctr.toFixed(2)], ["Correos con su logo", a.emails], ["Boletas con su logo", a.tickets],
    ]);
    toast("Reporte descargado");
  };

  return (
    <>
      <div className={s.kpis4}>
        <Stat label="Patrocinadores activos" value={state.sponsors.filter((x) => x.active).length} sub={`${state.sponsors.length} en total`} />
        <Stat label="Impresiones (estimadas)" value={compact(totals.imp)} delay={0.05} />
        <Stat label="Clics a sus sitios" value={totals.clicks.toLocaleString("es-CO")} delay={0.1} />
        <Stat label="CTR promedio" value={`${totals.imp ? ((totals.clicks / totals.imp) * 100).toFixed(2) : 0}%`} delay={0.15} />
      </div>

      <div className={s.grid}>
        <Card title="Patrocinadores" sub={view.data.event.name} className={s.span5}
          action={<button className="btn btn-red btn-sm" onClick={() => setAdding((v) => !v)}>{adding ? "Cancelar" : "+ Agregar"}</button>}>
          <AnimatePresence>
            {adding && (
              <motion.form className={s.inlineForm} onSubmit={add} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <input placeholder="Nombre de la marca" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as Tier })}>{TIERS.map((t) => <option key={t}>{t}</option>)}</select>
                <input placeholder="https://sitio-de-la-marca.com" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                <button className="btn btn-red btn-sm" type="submit">Guardar</button>
              </motion.form>
            )}
          </AnimatePresence>
          {state.sponsors.length ? (
            <ul className={s.sponsorList}>
              {state.sponsors.map((sp) => (
                <li key={sp.id} className={`${selected === sp.id ? s.sponsorOn : ""} ${!sp.active ? s.faded : ""}`} onClick={() => setSelected(sp.id)}>
                  <span className={s.logoPh}>{sp.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}</span>
                  <div><b>{sp.name}</b><small>{sp.tier} · {sp.placements.length} ubicaciones</small></div>
                  <span onClick={(e) => e.stopPropagation()}>
                    <Toggle on={sp.active} label={`Activar ${sp.name}`} onChange={(on) => {
                      if (on && sp.tier === "Presentado por" && state.sponsors.some((x) => x.id !== sp.id && x.tier === "Presentado por" && x.active)) { toast("Solo puede haber un “Presentado por” activo", "warn"); return; }
                      update({ ...sp, active: on }); toast(`${sp.name} ${on ? "activado" : "pausado"}`, on ? "ok" : "warn");
                    }} />
                  </span>
                </li>
              ))}
            </ul>
          ) : <Empty>No hay patrocinadores todavía.</Empty>}
        </Card>

        {sel ? (
          <Card title={sel.name} sub={`${sel.tier} · ${sel.active ? "Activo" : "Pausado"}`} className={s.span7} delay={0.05}
            action={<div className={s.cardActions}>
              <button className={s.ghostBtn} onClick={() => report(sel)}>⤓ Reporte</button>
              <button className={s.tinyBtn} onClick={() => { dispatch({ type: "removeSponsor", id: sel.id }); setSelected(null); toast("Patrocinador quitado", "warn"); }}>Quitar</button>
            </div>}>
            {(() => {
              const a = audience(sel, view);
              const base = view.data.daily;
              const series = base.map((d, i) => ({ date: d.date, value: Math.round((a.impressions / Math.max(1, base.length)) * (0.5 + (d.tickets / Math.max(1, ...base.map((x) => x.tickets))) * 1.2) * (1 + (i % 3) * 0.05)) }));
              return (
                <>
                  <div className={s.miniStats}>
                    <div><span>Impresiones</span><b>{a.impressions.toLocaleString("es-CO")}</b></div>
                    <div><span>Clics</span><b>{a.clicks.toLocaleString("es-CO")}</b></div>
                    <div><span>CTR</span><b>{a.ctr.toFixed(2)}%</b></div>
                    <div><span>Boletas con su logo</span><b>{a.tickets.toLocaleString("es-CO")}</b></div>
                  </div>
                  <SalesChart data={series} unit="impresiones" label="Impresiones por día" axisFormat={(n) => compact(n)} />
                  <h4 className={s.miniTitle}>Dónde aparece</h4>
                  <div className={s.checks}>
                    {PLACEMENTS.map((p) => (
                      <label key={p} className={s.check}>
                        <input type="checkbox" checked={sel.placements.includes(p)} onChange={(e) => update({ ...sel, placements: e.target.checked ? [...sel.placements, p] : sel.placements.filter((x) => x !== p) })} />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                  <p className={s.note}>Cifras estimadas para el diseño. Con backend salen de la analítica real (PostHog + UTM).</p>
                </>
              );
            })()}
          </Card>
        ) : (
          <Card title="Detalle" className={s.span7}><Empty>Elige un patrocinador para ver su reporte.</Empty></Card>
        )}
      </div>
    </>
  );
}
