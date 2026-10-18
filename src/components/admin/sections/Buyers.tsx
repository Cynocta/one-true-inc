"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { fighterName, type Order } from "../data";
import { useAdmin } from "../store";
import { Card, downloadCsv, Drawer, Empty } from "../ui";
import { cop, fmtDateTime, type View } from "../useView";
import s from "../admin.module.css";

const PAGE = 12;
const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Buyers({ view }: { view: View }) {
  const { state, dispatch, toast } = useAdmin();
  const { orders, zones } = view;
  const [q, setQ] = useState("");
  const [zone, setZone] = useState("all");
  const [method, setMethod] = useState("all");
  const [via, setVia] = useState("all");
  const [sort, setSort] = useState<{ key: "at" | "total" | "people"; dir: 1 | -1 }>({ key: "at", dir: -1 });
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const n = norm(q.trim());
    return orders
      .filter((o) => (zone === "all" || o.zoneId === zone) && (method === "all" || o.method === method) && (via === "all" || (via === "direct" ? !o.ref : !!o.ref)))
      .filter((o) => !n || norm(`${o.buyer} ${o.email} ${o.id} ${o.tickets.map((t) => t.code).join(" ")}`).includes(n))
      .sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir);
  }, [orders, q, zone, method, via, sort]);

  useEffect(() => setPage(0), [q, zone, method, via, view.slug, view.range]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const zoneOf = (id: string) => zones.find((z) => z.id === id)!;
  const sortBy = (key: typeof sort.key) => setSort((s0) => ({ key, dir: s0.key === key ? (s0.dir === 1 ? -1 : 1) : -1 }));
  const arrow = (key: typeof sort.key) => (sort.key === key ? (sort.dir === -1 ? " ↓" : " ↑") : "");

  const exportCsv = () => {
    downloadCsv(`compradores-${view.slug}.csv`, [
      ["Orden", "Fecha", "Comprador", "Correo", "Zona", "Unidades", "Personas", "Total COP", "Pago", "Vía", "Códigos de boleta", "Ingresaron"],
      ...filtered.map((o) => [o.id, new Date(o.at).toISOString(), o.buyer, o.email, zoneOf(o.zoneId).name, o.units.join(" ") || "-", o.people, o.total, o.method, fighterName(o.ref), o.tickets.map((t) => t.code).join(" "), o.tickets.filter((t) => state.checkins[t.code]).length]),
    ]);
    toast(`${filtered.length} órdenes exportadas a CSV`);
  };

  return (
    <>
      <Card title="Compradores" sub={`${filtered.length} órdenes · ${filtered.reduce((a, o) => a + o.people, 0)} boletas`}
        action={<button className={s.ghostBtn} onClick={exportCsv}>⤓ Exportar CSV</button>}>
        <div className={s.filters}>
          <input className={s.search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo, orden o código de boleta…" />
          <select value={zone} onChange={(e) => setZone(e.target.value)} aria-label="Zona">
            <option value="all">Todas las zonas</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Medio de pago">
            <option value="all">Todos los pagos</option><option>Tarjeta</option><option>PSE</option><option>Nequi</option>
          </select>
          <select value={via} onChange={(e) => setVia(e.target.value)} aria-label="Vía">
            <option value="all">Toda vía</option><option value="ref">Link de peleador</option><option value="direct">Directo</option>
          </select>
        </div>

        {rows.length ? (
          <div className={s.tableWrap}>
            <table className={`${s.table} ${s.clickRows}`}>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th><button className={s.sortBtn} onClick={() => sortBy("at")}>Fecha{arrow("at")}</button></th>
                  <th>Comprador</th><th>Zona</th>
                  <th className={s.num}><button className={s.sortBtn} onClick={() => sortBy("people")}>Pers.{arrow("people")}</button></th>
                  <th className={s.num}><button className={s.sortBtn} onClick={() => sortBy("total")}>Total{arrow("total")}</button></th>
                  <th>Pago</th><th>Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const inCount = o.tickets.filter((t) => state.checkins[t.code]).length;
                  return (
                    <tr key={o.id} onClick={() => setOpen(o)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(o)}>
                      <td className={s.mono}>{o.id}</td>
                      <td className={s.muted}>{fmtDateTime(o.at)}</td>
                      <td><b>{o.buyer}</b><br /><small className={s.muted}>{o.email}</small></td>
                      <td><i className={s.zoneDot} style={{ background: zoneOf(o.zoneId).color }} />{zoneOf(o.zoneId).name}{o.units.length > 0 && <small className={s.muted}> · {o.units.join(", ")}</small>}</td>
                      <td className={s.num}>{o.people}</td>
                      <td className={s.num}>{cop(o.total)}</td>
                      <td>{o.method}</td>
                      <td>{inCount ? <span className={s.badgeOk}>✓ {inCount}/{o.people}</span> : <span className={s.badgeMuted}>Pendiente</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>No hay órdenes con esos filtros.</Empty>}

        <div className={s.pager}>
          <span>Página {page + 1} de {pages}</span>
          <div>
            <button className={s.tinyBtn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
            <button className={s.tinyBtn} disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
          </div>
        </div>
      </Card>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `Orden ${open.id}` : ""}>
        {open && <OrderDetail order={open} view={view} resent={state.resent[open.id] ?? 0}
          onResend={(via) => { dispatch({ type: "resent", orderId: open.id }); toast(`Boletas reenviadas por ${via} a ${via === "correo" ? open.email : open.phone} (demo)`); }} />}
      </Drawer>
    </>
  );
}

function OrderDetail({ order: o, view, resent, onResend }: { order: Order; view: View; resent: number; onResend: (via: "correo" | "WhatsApp") => void }) {
  const { state } = useAdmin();
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const zone = view.zones.find((z) => z.id === o.zoneId)!;

  useEffect(() => {
    let alive = true;
    Promise.all(o.tickets.map(async (t) => [t.code, await QRCode.toDataURL(JSON.stringify({ v: "DEMO", e: view.slug, t: t.code }), { errorCorrectionLevel: "Q", margin: 1, width: 180 })] as const))
      .then((list) => alive && setQrs(Object.fromEntries(list)));
    return () => { alive = false; };
  }, [o, view.slug]);

  return (
    <div className={s.detail}>
      <dl className={s.dl}>
        <div><dt>Comprador</dt><dd>{o.buyer}</dd></div>
        <div><dt>Correo</dt><dd>{o.email}</dd></div>
        <div><dt>Celular</dt><dd>{o.phone}</dd></div>
        <div><dt>Documento</dt><dd>{o.doc}</dd></div>
        <div><dt>Fecha</dt><dd>{fmtDateTime(o.at)}</dd></div>
        <div><dt>Pago</dt><dd>{o.method} · aprobado</dd></div>
        <div><dt>Vía</dt><dd>{fighterName(o.ref)}</dd></div>
      </dl>

      <div className={s.lines}>
        <div><span>{zone.name} × {o.qty}{o.units.length ? ` (${o.units.join(", ")})` : ""}</span><b>{cop(o.unitPrice * o.qty)}</b></div>
        {o.addons.map((a) => <div key={a.label}><span>{a.label} × {a.qty}</span><b>{cop(a.price * a.qty)}</b></div>)}
        <div className={s.linesTotal}><span>Total</span><b>{cop(o.total)}</b></div>
      </div>

      <div className={s.actionsRow}>
        <button className={s.ghostBtn} onClick={() => onResend("correo")}>✉ Reenviar por correo</button>
        <button className={s.ghostBtn} onClick={() => onResend("WhatsApp")}>💬 Reenviar por WhatsApp</button>
      </div>
      {resent > 0 && <p className={s.note}>Reenviada {resent} {resent === 1 ? "vez" : "veces"} desde el panel.</p>}

      <h4 className={s.miniTitle}>Boletas ({o.tickets.length})</h4>
      <div className={s.ticketGrid}>
        {o.tickets.map((t) => {
          const c = state.checkins[t.code];
          return (
            <div key={t.code} className={`${s.tk} ${c ? s.tkIn : ""}`}>
              {qrs[t.code] ? <img src={qrs[t.code]} alt={`QR ${t.code}`} /> : <div className={s.qrPh} />}
              <code>{t.code}</code>
              <small>{t.holder}{t.unit ? ` · ${t.unit}` : ""}</small>
              {c ? <span className={s.badgeOk}>✓ Ingresó {fmtDateTime(c.at)} · {c.gate}</span> : <span className={s.badgeMuted}>Sin ingresar</span>}
            </div>
          );
        })}
      </div>
      <p className={s.note}>QR de demostración: no son válidos para ingresar a un evento real.</p>
    </div>
  );
}
