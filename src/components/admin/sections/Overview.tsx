"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { VenueMap } from "@/components/tickets/VenueMap";
import { PRICE_PHASES, currentPhaseIndex } from "@/data/site";
import { fmtDate } from "@/lib/format";
import { compact, Funnel, HBars, InventoryBars, Meter, SalesChart, Sparkline } from "../charts";
import { fighterName, type Order } from "../data";
import { Card, EASE } from "../ui";
import { ago, cop, type View } from "../useView";
import s from "../admin.module.css";

export function Overview({ view, go }: { view: View; go: (section: string) => void }) {
  const { data, zones, orders, daily, totals } = view;
  const phase = currentPhaseIndex(data.now);
  const until = PRICE_PHASES[phase].until;
  const daysLeft = until ? Math.max(0, Math.ceil((new Date(until).getTime() - data.now) / 86400000)) : null;
  const today = data.daily[data.daily.length - 1];
  const yesterday = data.daily[data.daily.length - 2];
  const delta = yesterday?.tickets ? ((today.tickets - yesterday.tickets) / yesterday.tickets) * 100 : 0;
  const occupancy = (data.totals.sold / data.totals.capacity) * 100;

  const payments = useMemo(() => (["Tarjeta", "PSE", "Nequi"] as const).map((m) => ({ label: m, value: orders.filter((o) => o.method === m).length })), [orders]);
  const addons = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>();
    orders.forEach((o) => o.addons.forEach((a) => { const c = map.get(a.label) ?? { units: 0, revenue: 0 }; map.set(a.label, { units: c.units + a.qty, revenue: c.revenue + a.qty * a.price }); }));
    return [...map.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.units - a.units);
  }, [orders]);
  const refs = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => o.ref && map.set(o.ref, (map.get(o.ref) ?? 0) + o.people));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [orders]);

  // Feed en vivo: muestra las órdenes más recientes y simula que entran nuevas
  const [feed, setFeed] = useState<Order[]>(() => [...data.orders].slice(-8).reverse());
  const [tick, setTick] = useState(0);
  useEffect(() => { setFeed([...data.orders].slice(-8).reverse()); }, [data]);
  useEffect(() => {
    const pool = data.orders;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setFeed((f) => {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        return [{ ...pick, id: `${pick.id}·${Date.now() % 1000}`, at: Date.now() }, ...f].slice(0, 8);
      });
    }, 8000);
    return () => clearInterval(id);
  }, [data]);

  const zoneOf = (id: string) => zones.find((z) => z.id === id)!;

  return (
    <>
      <div className={s.kpis}>
        <motion.div className={`${s.kpi} ${s.hero}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <span className={s.kpiLabel}>Recaudo {view.range === "all" ? "total" : "en el periodo"}</span>
          <b className={s.heroValue}>{cop(totals.revenue)}</b>
          <div className={s.kpiFoot}>
            <span className={s.up}>▲ {cop(today?.revenue ?? 0)} hoy</span>
            <Sparkline values={data.daily.slice(-14).map((d) => d.revenue)} />
          </div>
        </motion.div>
        <motion.div className={s.kpi} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5, ease: EASE }}>
          <span className={s.kpiLabel}>Boletas vendidas</span>
          <b className={s.kpiValue}>{data.totals.sold.toLocaleString("es-CO")} <small>/ {data.totals.capacity.toLocaleString("es-CO")}</small></b>
          <Meter value={data.totals.sold} max={data.totals.capacity} label="Ocupación" />
          <span className={s.kpiSub}>{occupancy.toFixed(1)}% del aforo · {totals.held} en checkout</span>
        </motion.div>
        <motion.div className={s.kpi} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: EASE }}>
          <span className={s.kpiLabel}>Vendidas hoy</span>
          <b className={s.kpiValue}>{today?.tickets ?? 0}</b>
          <span className={delta >= 0 ? s.up : s.down}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}% vs ayer</span>
        </motion.div>
        <motion.div className={s.kpi} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: EASE }}>
          <span className={s.kpiLabel}>Ticket promedio</span>
          <b className={s.kpiValue}>{cop(totals.orders ? totals.revenue / totals.orders : 0)}</b>
          <span className={s.kpiSub}>{totals.orders} órdenes · {totals.orders ? (totals.sold / totals.orders).toFixed(1) : 0} boletas por orden</span>
        </motion.div>
        <motion.div className={s.kpi} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: EASE }}>
          <span className={s.kpiLabel}>Etapa de precio</span>
          <b className={s.kpiValue}>{PRICE_PHASES[phase].name.es}</b>
          <div className={s.phaseDots}>{PRICE_PHASES.map((p, i) => <i key={p.id} className={i < phase ? s.dotPast : i === phase ? s.dotNow : ""} title={p.name.es} />)}</div>
          <span className={s.kpiSub}>{daysLeft !== null ? `Sube en ${daysLeft} días (${fmtDate(until!, "es", { day: "numeric", month: "short" })})` : "Última etapa"}</span>
        </motion.div>
      </div>

      <div className={s.grid}>
        <Card title="Ventas por día" sub="Boletas vendidas (personas)" className={s.span8} delay={0.05}
          action={<button className={s.linkBtn} onClick={() => go("ventas")}>Ver ventas →</button>}>
          <SalesChart data={daily.map((d) => ({ date: d.date, value: d.tickets }))} markers={data.markers} />
        </Card>

        <Card title="Medios de pago" sub={`${totals.orders} órdenes aprobadas`} className={s.span4} delay={0.1}>
          <HBars rows={payments.map((p) => ({ label: p.label, value: p.value, sub: totals.orders ? `${Math.round((p.value / totals.orders) * 100)}%` : "" }))} format={(n) => `${n} órdenes`} />
          <div className={s.divider} />
          <h4 className={s.miniTitle}>Adicionales vendidos</h4>
          <ul className={s.addons}>
            {addons.length ? addons.map((a) => <li key={a.label}><span>{a.label}</span><b>{a.units}</b><small>{cop(a.revenue)}</small></li>) : <li><span>Sin adicionales en el periodo</span></li>}
          </ul>
        </Card>

        <Card title="Inventario por zona" sub="Lo que queda de cada localidad" className={s.span7} delay={0.15}
          action={<button className={s.linkBtn} onClick={() => go("inventario")}>Gestionar →</button>}>
          <InventoryBars rows={zones.map((z) => ({
            id: z.id, label: z.name, swatch: z.color, sold: z.sold, held: z.held + z.blocked, capacity: z.capacity,
            unit: z.kind === "box" ? "palcos" : z.kind === "seat" ? "sillas" : "boletas",
            extra: `${cop(z.prices[phase])}${z.kind === "box" ? " / palco" : ""}`,
          }))} />
        </Card>

        <Card title="Mapa de ocupación" sub="X = vendido · borde punteado = bloqueado" className={s.span5} delay={0.2}>
          <div className={s.mapBox}><VenueMap zone={null} interactive={false} sold={data.soldUnits} blocked={view.blocked} /></div>
        </Card>

        <Card title="Recaudo por zona" sub="Ingresos brutos en el periodo" className={s.span4} delay={0.25}>
          <HBars rows={zones.map((z) => ({ label: z.name, value: orders.filter((o) => o.zoneId === z.id).reduce((a, o) => a + o.total, 0) })).sort((a, b) => b.value - a.value)} format={(n) => "$" + compact(n)} />
        </Card>

        <Card title="Ventas por peleador" sub="Boletas vendidas con el link de cada uno" className={s.span4} delay={0.3}
          action={<button className={s.linkBtn} onClick={() => go("peleadores")}>Links →</button>}>
          <ol className={s.ranking}>
            {refs.map(([slug, n], i) => (
              <li key={slug}>
                <span className={s.rank}>{i + 1}</span>
                <div><b>{fighterName(slug)}</b></div>
                <div className={s.rankBar}><motion.span style={{ width: `${(n / refs[0][1]) * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.7, ease: EASE }} /></div>
                <em>{n}</em>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Embudo de compra" sub="Toda la venta" className={s.span4} delay={0.35}>
          <Funnel steps={data.funnel} />
        </Card>

        <Card title="Órdenes recientes" sub="Se actualiza sola cuando entra una venta" className={s.span8} delay={0.4}
          action={<span className={s.live}><i />En vivo</span>}>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Orden</th><th>Comprador</th><th>Zona</th><th className={s.num}>Pers.</th><th className={s.num}>Total</th><th>Pago</th><th>Vía</th><th className={s.num}>Hace</th></tr></thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {feed.map((o) => (
                    <motion.tr key={o.id} layout initial={{ opacity: 0, backgroundColor: "rgba(57,135,229,.25)" }} animate={{ opacity: 1, backgroundColor: "rgba(57,135,229,0)" }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
                      <td className={s.mono}>{o.id.split("·")[0]}</td>
                      <td>{o.buyer}</td>
                      <td><i className={s.zoneDot} style={{ background: zoneOf(o.zoneId).color }} />{zoneOf(o.zoneId).name}</td>
                      <td className={s.num}>{o.people}</td>
                      <td className={s.num}>{cop(o.total)}</td>
                      <td>{o.method}</td>
                      <td className={s.muted}>{fighterName(o.ref)}</td>
                      <td className={s.num} data-tick={tick}>{ago(o.at, o.at > data.now ? Date.now() : data.now)}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Puerta" sub="Control de ingreso" className={s.span4} delay={0.45}
          action={<button className={s.linkBtn} onClick={() => go("puerta")}>Abrir →</button>}>
          <div className={s.door}>
            <div className={s.doorNum}><b>{view.checkedIn}</b><span>/ {data.totals.sold.toLocaleString("es-CO")} ingresos</span></div>
            <Meter value={view.checkedIn} max={data.totals.sold} label="Ingresos" />
            <p className={s.doorNote}>Usa el simulador de escáner en la sección Puerta para probar el control de ingreso.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
