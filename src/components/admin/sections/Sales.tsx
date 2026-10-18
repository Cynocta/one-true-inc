"use client";

import { useMemo, useState } from "react";
import { PRICE_PHASES } from "@/data/site";
import { Columns, compact, HBars, SalesChart } from "../charts";
import { Card, downloadCsv, Segmented, Stat } from "../ui";
import { cop, type View } from "../useView";
import s from "../admin.module.css";

export function Sales({ view }: { view: View }) {
  const [metric, setMetric] = useState<"tickets" | "revenue">("revenue");
  const { orders, daily, zones, totals, data } = view;

  const byPhase = useMemo(() => PRICE_PHASES.map((p, i) => {
    const os = orders.filter((o) => o.phase === i);
    return { name: p.name.es, until: p.until, orders: os.length, tickets: os.reduce((a, o) => a + o.people, 0), revenue: os.reduce((a, o) => a + o.total, 0) };
  }), [orders]);

  const hours = useMemo(() => {
    const h = Array(24).fill(0);
    orders.forEach((o) => { h[(new Date(o.at).getUTCHours() + 19) % 24] += metric === "tickets" ? o.people : o.total; });
    return h;
  }, [orders, metric]);

  const addonsRevenue = orders.reduce((a, o) => a + o.addons.reduce((b, x) => b + x.qty * x.price, 0), 0);
  const fmt = metric === "revenue" ? (n: number) => "$" + compact(n) : (n: number) => n.toLocaleString("es-CO");

  const exportDaily = () => {
    downloadCsv(`ventas-${view.slug}.csv`, [
      ["Fecha", "Boletas", "Recaudo (COP)"],
      ...daily.map((d) => [d.date.toISOString().slice(0, 10), d.tickets, d.revenue]),
    ]);
  };

  return (
    <>
      <div className={s.kpis4}>
        <Stat label="Recaudo en el periodo" value={cop(totals.revenue)} sub={`${cop(addonsRevenue)} en adicionales`} />
        <Stat label="Boletas vendidas" value={totals.sold.toLocaleString("es-CO")} sub={`${totals.orders} órdenes`} delay={0.05} />
        <Stat label="Ticket promedio" value={cop(totals.orders ? totals.revenue / totals.orders : 0)} delay={0.1} />
        <Stat label="Promedio diario" value={fmt(Math.round(daily.reduce((a, d) => a + (metric === "tickets" ? d.tickets : d.revenue), 0) / Math.max(1, daily.length)))} sub={metric === "tickets" ? "boletas por día" : "recaudo por día"} delay={0.15} />
      </div>

      <div className={s.grid}>
        <Card title={metric === "tickets" ? "Boletas por día" : "Recaudo por día"} sub="Pasa el mouse para ver cada día" className={s.span12}
          action={<div className={s.cardActions}>
            <Segmented label="Métrica" value={metric} onChange={setMetric} options={[{ id: "revenue", label: "Recaudo" }, { id: "tickets", label: "Boletas" }]} />
            <button className={s.ghostBtn} onClick={exportDaily}>⤓ CSV</button>
          </div>}>
          <SalesChart
            data={daily.map((d) => ({ date: d.date, value: metric === "tickets" ? d.tickets : d.revenue }))}
            markers={data.markers}
            format={metric === "tickets" ? (n) => n.toLocaleString("es-CO") : (n) => cop(n)}
            axisFormat={fmt}
            unit={metric === "tickets" ? "boletas" : ""}
            label={metric === "tickets" ? "Boletas por día" : "Recaudo por día"}
          />
        </Card>

        <Card title="Horas pico" sub="¿A qué hora compra la gente? (hora Colombia)" className={s.span8} delay={0.05}>
          <Columns values={hours} labels={hours.map((_, i) => `${i}:00`)} format={fmt} unit={metric === "tickets" ? "boletas" : ""} />
        </Card>

        <Card title="Por medio de pago" sub="Recaudo por método" className={s.span4} delay={0.1}>
          <HBars rows={(["Tarjeta", "PSE", "Nequi"] as const).map((m) => ({ label: m, value: orders.filter((o) => o.method === m).reduce((a, o) => a + (metric === "tickets" ? o.people : o.total), 0) }))} format={fmt} />
        </Card>

        <Card title="Por etapa de precio" sub="Cuánto se vendió en cada etapa" className={s.span6} delay={0.15}>
          <table className={s.table}>
            <thead><tr><th>Etapa</th><th>Hasta</th><th className={s.num}>Órdenes</th><th className={s.num}>Boletas</th><th className={s.num}>Recaudo</th></tr></thead>
            <tbody>
              {byPhase.map((p) => (
                <tr key={p.name}>
                  <td><b>{p.name}</b></td>
                  <td className={s.muted}>{p.until ? new Date(p.until).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "Evento"}</td>
                  <td className={s.num}>{p.orders || "—"}</td>
                  <td className={s.num}>{p.tickets || "—"}</td>
                  <td className={s.num}>{p.revenue ? cop(p.revenue) : "Aún no inicia"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Por zona" sub={metric === "tickets" ? "Boletas" : "Recaudo"} className={s.span6} delay={0.2}>
          <HBars rows={zones.map((z) => ({ label: z.name, value: orders.filter((o) => o.zoneId === z.id).reduce((a, o) => a + (metric === "tickets" ? o.people : o.total), 0) })).sort((a, b) => b.value - a.value)} format={fmt} />
        </Card>
      </div>
    </>
  );
}
