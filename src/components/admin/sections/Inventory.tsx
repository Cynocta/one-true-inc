"use client";

import { useEffect, useState } from "react";
import { VenueMap } from "@/components/tickets/VenueMap";
import { UNITS } from "@/components/tickets/venue";
import { currentPhaseIndex, PRICE_PHASES } from "@/data/site";
import { Card, Stat } from "../ui";
import { useAdmin } from "../store";
import { cop, type View } from "../useView";
import s from "../admin.module.css";

export function Inventory({ view }: { view: View }) {
  const { state, dispatch, toast } = useAdmin();
  const { zones, data, slug } = view;
  const phase = currentPhaseIndex(data.now);
  const [drafts, setDrafts] = useState<Record<string, [number, number, number]>>({});
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    setDrafts(Object.fromEntries(zones.map((z) => [z.id, [...z.prices] as [number, number, number]])));
    setDates(state.phaseDates[slug] ?? PRICE_PHASES.filter((p) => p.until).map((p) => p.until!.slice(0, 10)));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleUnit = (id: string) => {
    if (data.soldUnits.has(id)) return;
    const was = view.blocked.has(id);
    dispatch({ type: "toggleBlock", key: `${slug}:${id}` });
    const u = UNITS.find((x) => x.id === id)!;
    toast(`${u.zone === "ringside" ? "Silla" : "Palco"} ${u.label} ${was ? "desbloqueado y a la venta" : "bloqueado (no se vende)"}`, was ? "ok" : "warn");
  };

  const savePrices = () => {
    for (const z of zones) {
      const d = drafts[z.id];
      if (!d || d.some((v) => !Number.isFinite(v) || v <= 0)) { toast(`Revisa los precios de ${z.name}`, "err"); return; }
      if (d[0] > d[1] || d[1] > d[2]) { toast(`${z.name}: cada etapa debe costar igual o más que la anterior`, "err"); return; }
    }
    if (dates.length === 2 && dates[0] >= dates[1]) { toast("La Etapa 1 debe terminar antes que la Etapa 2", "err"); return; }
    zones.forEach((z) => dispatch({ type: "setPrices", key: `${slug}:${z.id}`, prices: drafts[z.id] }));
    dispatch({ type: "setPhaseDates", slug, dates });
    toast("Precios y etapas guardados (demo)");
  };

  const persons = (n: number, z: (typeof zones)[number]) => n * z.persons;
  const totalAvail = zones.reduce((a, z) => a + persons(z.available, z), 0);
  const totalHeld = zones.reduce((a, z) => a + persons(z.held, z), 0);
  const totalBlocked = zones.reduce((a, z) => a + persons(z.blocked, z), 0);

  return (
    <>
      <div className={s.kpis4}>
        <Stat label="Aforo total" value={data.totals.capacity.toLocaleString("es-CO")} sub="personas" />
        <Stat label="Disponibles para vender" value={totalAvail.toLocaleString("es-CO")} sub={`${((totalAvail / data.totals.capacity) * 100).toFixed(0)}% del aforo`} delay={0.05} />
        <Stat label="Reservadas en checkout" value={totalHeld} sub="se liberan solas al vencer" delay={0.1} />
        <Stat label="Bloqueadas" value={totalBlocked} sub="cortesías, prensa, producción" delay={0.15} />
      </div>

      <div className={s.grid}>
        <Card title="Mapa del recinto" sub="Toca un palco o silla libre para bloquearlo o desbloquearlo" className={s.span7}>
          <div className={s.mapBox}>
            <VenueMap zone={null} interactive sold={data.soldUnits} blocked={view.blocked} onUnit={toggleUnit} />
          </div>
          <div className={s.legend} style={{ marginTop: 14, marginBottom: 0 }}>
            <span><i style={{ background: "#2a2a30" }} />Vendido (X)</span>
            <span><i style={{ background: "transparent", outline: "2px dashed #c3c2b7", outlineOffset: -2 }} />Bloqueado</span>
            <span><i style={{ background: "#c3c2b7" }} />Libre (color de su zona)</span>
          </div>
        </Card>

        <Card title="Cupos por zona" sub="Unidades de venta de cada localidad" className={s.span5} delay={0.05}>
          <table className={s.table}>
            <thead><tr><th>Zona</th><th className={s.num}>Cap.</th><th className={s.num}>Vend.</th><th className={s.num}>Res.</th><th className={s.num}>Bloq.</th><th className={s.num}>Libres</th><th /></tr></thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}>
                  <td><i className={s.zoneDot} style={{ background: z.color }} />{z.name}</td>
                  <td className={s.num}>{z.capacity}</td>
                  <td className={s.num}>{z.sold}</td>
                  <td className={s.num}>{z.held}</td>
                  <td className={s.num}>{z.blocked}</td>
                  <td className={`${s.num} ${z.available / z.capacity <= 0.15 ? s.warnText : ""}`}><b>{z.available}</b></td>
                  <td>
                    {z.held > 0 && (
                      <button className={s.tinyBtn} onClick={() => { dispatch({ type: "releaseHolds", key: `${slug}:${z.id}` }); toast(`Reservas de ${z.name} liberadas`); }}>Liberar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={s.note}>Palcos se cuentan por palco ({zones[0].persons} personas c/u). Las reservas de checkout vencen solas a los {view.settings.holdMinutes} min.</p>
        </Card>

        <Card title="Precios por etapa" sub="El precio sube solo en la fecha de cada etapa" className={s.span12} delay={0.1}
          action={<button className="btn btn-red btn-sm" onClick={savePrices}>Guardar cambios</button>}>
          <div className={s.tableWrap}>
            <table className={`${s.table} ${s.priceTable}`}>
              <thead>
                <tr>
                  <th>Zona</th>
                  {PRICE_PHASES.map((p, i) => (
                    <th key={p.id} className={i === phase ? s.thNow : ""}>
                      {p.name.es} {i === phase && <em className={s.nowTag}>actual</em>}
                      {i < 2 && (
                        <label className={s.dateIn}>hasta
                          <input type="date" value={dates[i] ?? ""} onChange={(e) => setDates((d) => { const n = [...d]; n[i] = e.target.value; return n; })} />
                        </label>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id}>
                    <td><i className={s.zoneDot} style={{ background: z.color }} />{z.name}{z.kind === "box" && <small className={s.muted}> / palco</small>}</td>
                    {[0, 1, 2].map((i) => (
                      <td key={i}>
                        <div className={s.money}>
                          <span>$</span>
                          <input inputMode="numeric" value={drafts[z.id]?.[i]?.toLocaleString("es-CO") ?? ""} aria-label={`${z.name} ${PRICE_PHASES[i].name.es}`}
                            onChange={(e) => setDrafts((d) => { const v = [...(d[z.id] ?? z.prices)] as [number, number, number]; v[i] = Number(e.target.value.replace(/\D/g, "")) || 0; return { ...d, [z.id]: v }; })} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.note}>Validaciones: ningún precio en cero, cada etapa igual o más cara que la anterior y las fechas en orden. Con backend, los cambios quedan registrados en la auditoría.</p>
        </Card>
      </div>
    </>
  );
}
