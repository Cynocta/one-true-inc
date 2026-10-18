"use client";

/**
 * SIMULADOR DE PUERTA (demo). Reproduce las reglas que tendrá el escáner real:
 * 1) el código debe existir  2) debe ser de ESTE evento  3) entra UNA sola vez (gana el primer escaneo)
 * 4) sin internet se valida contra la lista local y se sincroniza al volver la señal.
 * En producción el QR va firmado (Ed25519) y la regla 3 la garantiza la base de datos (UNIQUE).
 */
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { EVENTS } from "@/data/events";
import { Meter } from "../charts";
import { findTicketAnywhere, getEventData, type Ticket } from "../data";
import { useAdmin, type ScanLog } from "../store";
import { Card, Empty, Toggle } from "../ui";
import { fmtDateTime, type View } from "../useView";
import s from "../admin.module.css";

const GATES = ["Puerta 1 · General", "Puerta 2 · Preferencial", "Puerta VIP · Palcos"];
const DEVICES = ["Celular Puerta 1", "Celular Puerta 2", "Celular VIP", "Tablet supervisor"];
type Result = { kind: "ok" | "dup" | "fake" | "other"; title: string; detail: string; ticket?: Ticket; extra?: string[] } | null;

export function Door({ view }: { view: View }) {
  const { state, dispatch, toast } = useAdmin();
  const { data, zones, slug } = view;
  const [code, setCode] = useState("");
  const [gate, setGate] = useState(GATES[0]);
  const [device, setDevice] = useState(DEVICES[0]);
  const [offline, setOffline] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [seq, setSeq] = useState(0);
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("");
  const [manualFor, setManualFor] = useState<Ticket | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const allTickets = useMemo(() => [...data.tickets.values()], [data]);
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const orderOf = (t: Ticket) => data.orders.find((o) => o.id === t.orderId)!;
  const pending = Object.values(state.checkins).filter((c) => !c.synced).length;
  const byZone = zones.map((z) => {
    const ts = allTickets.filter((t) => t.zoneId === z.id);
    return { z, total: ts.length, inside: ts.filter((t) => state.checkins[t.code]).length };
  });

  const log = (r: ScanLog["result"], c: string, t?: Ticket): ScanLog => ({ id: `${Date.now()}${Math.random()}`, at: Date.now(), code: c, result: r, holder: t?.holder, zone: t ? zoneName(t.zoneId) : undefined, gate });

  const validate = (raw: string) => {
    const c = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!c) return;
    setSeq((n) => n + 1);
    const t = data.tickets.get(c);
    if (!t) {
      const other = findTicketAnywhere(c);
      if (other) {
        const ev = EVENTS.find((e) => e.slug === other.slug)!;
        setResult({ kind: "other", title: "Boleta de otro evento", detail: `Es para ${ev.name}. No puede entrar hoy.` });
        dispatch({ type: "scan", log: log("other", c) });
      } else {
        setResult({ kind: "fake", title: "Boleta no válida", detail: "El código no existe. Puede ser falsa o estar mal escrita: pide la boleta original o busca por nombre." });
        dispatch({ type: "scan", log: log("fake", c) });
      }
    } else if (state.checkins[c]) {
      const prev = state.checkins[c];
      setResult({ kind: "dup", title: "Ya ingresó", detail: `Primer ingreso: ${fmtDateTime(prev.at)} por ${prev.gate} (${prev.device}).`, ticket: t });
      dispatch({ type: "scan", log: log("dup", c, t) });
    } else {
      const o = orderOf(t);
      const extra = t.index === 1 ? o.addons.map((a) => `${a.label} × ${a.qty}`) : [];
      dispatch({ type: "checkin", code: c, c: { at: Date.now(), gate, device, synced: !offline }, log: log("ok", c, t) });
      setResult({ kind: "ok", title: "Bienvenido", detail: `${zoneName(t.zoneId)}${t.unit ? ` · ${t.unit}` : ""} · boleta ${t.index}/${t.of}`, ticket: t, extra });
      try { navigator.vibrate?.(80); } catch {}
    }
    setCode("");
    input.current?.focus();
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); validate(code); };
  const randomValid = () => { const free = allTickets.filter((t) => !state.checkins[t.code]); if (free.length) validate(free[Math.floor(Math.random() * free.length)].code); else toast("Ya ingresaron todas las boletas", "warn"); };
  const randomDup = () => { const used = allTickets.filter((t) => state.checkins[t.code]); if (used.length) validate(used[Math.floor(Math.random() * used.length)].code); else toast("Primero registra un ingreso válido", "warn"); };
  const randomFake = () => validate(Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join(""));
  const randomOther = () => {
    const other = EVENTS.find((e) => e.status === "upcoming" && e.slug !== slug);
    const first = other ? getEventData(other.slug).tickets.keys().next().value : undefined;
    if (first) validate(first);
  };

  const goOnline = (on: boolean) => {
    setOffline(!on);
    if (on && pending) { dispatch({ type: "sync" }); toast(`${pending} ingresos sincronizados con el servidor`); }
    if (!on) toast("Modo sin conexión: se valida con la lista guardada en el celular", "warn");
  };

  const n = q.trim().toLowerCase();
  const matches = n.length < 2 ? [] : allTickets.filter((t) => {
    const o = orderOf(t);
    return `${t.holder} ${o.buyer} ${o.email} ${o.id} ${o.doc} ${t.code}`.toLowerCase().includes(n);
  }).slice(0, 8);

  const manualCheckin = () => {
    if (!manualFor || reason.trim().length < 4) { toast("Escribe el motivo del ingreso manual", "err"); return; }
    dispatch({ type: "checkin", code: manualFor.code, c: { at: Date.now(), gate, device, manual: reason.trim(), synced: !offline }, log: { ...log("manual", manualFor.code, manualFor) } });
    dispatch({ type: "audit", what: `Ingreso manual de ${manualFor.code} (${manualFor.holder}): ${reason.trim()}` });
    toast(`Ingreso manual registrado: ${manualFor.holder}`);
    setManualFor(null); setReason("");
  };

  return (
    <>
      <div className={s.kpis4}>
        <div className={s.kpi}>
          <span className={s.kpiLabel}>Ingresaron</span>
          <b className={s.kpiValue}>{view.checkedIn.toLocaleString("es-CO")} <small>/ {data.totals.sold.toLocaleString("es-CO")}</small></b>
          <Meter value={view.checkedIn} max={data.totals.sold} label="Ingresos" />
        </div>
        <div className={s.kpi}><span className={s.kpiLabel}>Por entrar</span><b className={s.kpiValue}>{(data.totals.sold - view.checkedIn).toLocaleString("es-CO")}</b></div>
        <div className={s.kpi}><span className={s.kpiLabel}>Rechazos</span><b className={s.kpiValue}>{state.scans.filter((x) => x.result !== "ok" && x.result !== "manual").length}</b><span className={s.kpiSub}>duplicadas, falsas u otro evento</span></div>
        <div className={s.kpi}>
          <span className={s.kpiLabel}>Conexión</span>
          <b className={s.kpiValue} style={{ color: offline ? "var(--warning)" : "var(--good)" }}>{offline ? "Sin internet" : "En línea"}</b>
          <span className={s.kpiSub}>{pending ? `${pending} ingresos por sincronizar` : "Todo sincronizado"}</span>
        </div>
      </div>

      <div className={s.grid}>
        <Card title="Escáner" sub="Simulador del celular de la puerta" className={s.span7}
          action={<label className={s.inline}><span>{offline ? "Sin internet" : "En línea"}</span><Toggle on={!offline} onChange={goOnline} label="Conexión" /></label>}>
          <div className={s.scanTop}>
            <select value={gate} onChange={(e) => setGate(e.target.value)} aria-label="Puerta">{GATES.map((g) => <option key={g}>{g}</option>)}</select>
            <select value={device} onChange={(e) => setDevice(e.target.value)} aria-label="Dispositivo">{DEVICES.map((d) => <option key={d}>{d}</option>)}</select>
          </div>
          <form onSubmit={onSubmit} className={s.scanForm}>
            <input ref={input} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Escanea o escribe el código de la boleta" autoComplete="off" aria-label="Código de boleta" />
            <button className="btn btn-red btn-sm" type="submit">Validar</button>
          </form>
          <div className={s.simBtns}>
            <span>Simular:</span>
            <button className={s.tinyBtn} onClick={randomValid}>✓ Boleta válida</button>
            <button className={s.tinyBtn} onClick={randomDup}>⟳ Duplicada</button>
            <button className={s.tinyBtn} onClick={randomFake}>✕ Falsa</button>
            <button className={s.tinyBtn} onClick={randomOther}>↔ Otro evento</button>
          </div>

          {/* Sin esperar animaciones de salida: en la puerta el resultado debe verse al instante */}
          {result ? (
              <motion.div key={seq} className={`${s.scanResult} ${s[`res_${result.kind}`]}`} role="status" aria-live="assertive"
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1, x: result.kind === "ok" ? 0 : [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.4 }}>
                <span className={s.resIcon}>{result.kind === "ok" ? "✓" : result.kind === "dup" ? "⟳" : "✕"}</span>
                <div>
                  <b>{result.title}{result.ticket ? ` · ${result.ticket.holder}` : ""}</b>
                  <p>{result.detail}</p>
                  {result.extra && result.extra.length > 0 && <p className={s.deliver}>🎁 Entregar: {result.extra.join(" · ")}</p>}
                </div>
              </motion.div>
            ) : (
              <div className={s.scanIdle}>
                <span className={s.scanLine} />
                Esperando escaneo…
              </div>
            )}
          <p className={s.note}>Reglas: el código debe existir, ser de este evento y entrar una sola vez. Sin internet, valida con la lista guardada y sincroniza al volver la señal.</p>
        </Card>

        <Card title="Búsqueda manual" sub="Para boletas que no escanean (pantalla rota, sin batería…)" className={s.span5} delay={0.05}>
          <input className={s.search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, documento, correo u orden" />
          <ul className={s.matchList}>
            {matches.map((t) => {
              const c = state.checkins[t.code];
              return (
                <li key={t.code}>
                  <div><b>{t.holder}</b><small>{zoneName(t.zoneId)}{t.unit ? ` · ${t.unit}` : ""} · {t.orderId} · {t.code}</small></div>
                  {c ? <span className={s.badgeOk}>✓ {fmtDateTime(c.at)}</span> : <button className={s.tinyBtn} onClick={() => setManualFor(t)}>Dar ingreso</button>}
                </li>
              );
            })}
            {n.length >= 2 && !matches.length && <li className={s.muted}>Sin resultados</li>}
          </ul>
          <AnimatePresence>
            {manualFor && (
              <motion.div className={s.manualBox} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <b>Ingreso manual: {manualFor.holder}</b>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (obligatorio, queda en auditoría)" />
                <div className={s.actionsRow}>
                  <button className="btn btn-red btn-sm" onClick={manualCheckin}>Confirmar ingreso</button>
                  <button className={s.ghostBtn} onClick={() => { setManualFor(null); setReason(""); }}>Cancelar</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card title="Ingresos por zona" className={s.span5} delay={0.1}>
          <div className={s.hbars}>
            {byZone.map(({ z, total, inside }) => (
              <div key={z.id}>
                <div className={s.hbarTop}><span><i className={s.zoneDot} style={{ background: z.color }} />{z.name}</span><b>{inside} / {total}</b></div>
                <Meter value={inside} max={Math.max(1, total)} label={z.name} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Registro de escaneos" sub="Últimos 30" className={s.span7} delay={0.15}
          action={state.scans.length > 0 && <button className={s.tinyBtn} onClick={() => { dispatch({ type: "resetDoor" }); setResult(null); toast("Ingresos reiniciados (demo)", "warn"); }}>Reiniciar demo</button>}>
          {state.scans.length ? (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Hora</th><th>Resultado</th><th>Titular</th><th>Zona</th><th>Puerta</th><th>Código</th></tr></thead>
                <tbody>
                  {state.scans.slice(0, 30).map((l) => (
                    <tr key={l.id}>
                      <td className={s.muted}>{new Date(l.at).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", second: "2-digit" })}</td>
                      <td>{{ ok: <span className={s.badgeOk}>✓ Ingresó</span>, manual: <span className={s.badgeOk}>✓ Manual</span>, dup: <span className={s.badgeBad}>⟳ Duplicada</span>, fake: <span className={s.badgeBad}>✕ No existe</span>, other: <span className={s.badgeWarn}>↔ Otro evento</span> }[l.result]}</td>
                      <td>{l.holder ?? "—"}</td>
                      <td>{l.zone ?? "—"}</td>
                      <td className={s.muted}>{l.gate}</td>
                      <td className={s.mono}>{l.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty>Todavía no hay escaneos. Prueba con “Simular: Boleta válida”.</Empty>}
        </Card>
      </div>
    </>
  );
}
