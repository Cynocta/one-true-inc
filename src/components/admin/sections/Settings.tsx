"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAdmin, type EventSettings, type Role } from "../store";
import { Card, Toggle } from "../ui";
import { fmtDateTime, type View } from "../useView";
import s from "../admin.module.css";

const ROLES: { id: Role; desc: string }[] = [
  { id: "Administrador", desc: "Todo: ventas, precios, compradores, equipo" },
  { id: "Puerta", desc: "Solo el escáner y la búsqueda manual el día del evento" },
  { id: "Peleador", desc: "Solo ve las ventas de su propio link" },
  { id: "Solo lectura", desc: "Ve los reportes, no puede cambiar nada" },
];

const NOTIFS: { key: string; label: string; desc: string }[] = [
  { key: "venta", label: "Cada venta", desc: "Aviso al instante por cada orden aprobada" },
  { key: "resumenDiario", label: "Resumen diario", desc: "Correo a las 8:00 a. m. con lo vendido ayer" },
  { key: "stockBajo", label: "Pocos cupos", desc: "Cuando una zona baja del 15% disponible" },
  { key: "cambioEtapa", label: "Cambio de etapa", desc: "Un día antes de que suba el precio" },
  { key: "puerta", label: "Alertas de puerta", desc: "Duplicados o boletas falsas el día del evento" },
];

export function Settings({ view }: { view: View }) {
  const { state, dispatch, toast } = useAdmin();
  const ev = view.data.event;
  const [form, setForm] = useState<EventSettings>(view.settings);
  const [invite, setInvite] = useState<{ name: string; email: string; role: Role }>({ name: "", email: "", role: "Puerta" });
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => setForm(view.settings), [view.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (form.maxPerOrder < 1 || form.maxPerOrder > 20) { toast("Máximo por orden: entre 1 y 20", "err"); return; }
    if (form.holdMinutes < 5 || form.holdMinutes > 30) { toast("La reserva debe durar entre 5 y 30 minutos", "err"); return; }
    dispatch({ type: "setSettings", slug: view.slug, settings: form });
    toast(form.salesOpen ? "Ajustes guardados (demo)" : "Ajustes guardados · la venta quedó PAUSADA", form.salesOpen ? "ok" : "warn");
  };

  const addMember = (e: FormEvent) => {
    e.preventDefault();
    if (invite.name.trim().length < 2) { toast("Escribe el nombre", "err"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(invite.email)) { toast("Correo no válido", "err"); return; }
    if (state.team.some((m) => m.email.toLowerCase() === invite.email.toLowerCase())) { toast("Ese correo ya está en el equipo", "warn"); return; }
    dispatch({ type: "addMember", m: { id: `m${Date.now()}`, name: invite.name.trim(), email: invite.email.trim(), role: invite.role, mfa: false } });
    toast(`Invitación enviada a ${invite.email} (demo)`);
    setInvite({ name: "", email: "", role: "Puerta" });
  };

  const admins = state.team.filter((m) => m.role === "Administrador").length;

  return (
    <div className={s.grid}>
      <Card title="Evento" sub={ev.name} className={s.span7}>
        <form className={s.formGrid} onSubmit={save}>
          <label className={s.full}><span>Nombre público</span><input value={form.name ?? ev.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span>Fecha y hora</span><input type="datetime-local" value={form.date ?? ev.date.slice(0, 16)} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label><span>Lugar</span><input value={form.venue ?? ev.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
          <label><span>Máximo de boletas por orden</span><input type="number" min={1} max={20} value={form.maxPerOrder} onChange={(e) => setForm({ ...form, maxPerOrder: Number(e.target.value) })} /></label>
          <label><span>Minutos de reserva en checkout</span><input type="number" min={5} max={30} value={form.holdMinutes} onChange={(e) => setForm({ ...form, holdMinutes: Number(e.target.value) })} /></label>
          <div className={`${s.full} ${s.switchRow}`}>
            <div><b>Venta abierta</b><small>Si la pausas, la página muestra “Venta pausada” y nadie puede comprar.</small></div>
            <Toggle on={form.salesOpen} onChange={(v) => setForm({ ...form, salesOpen: v })} label="Venta abierta" />
          </div>
          <div className={s.full}><button className="btn btn-red btn-sm" type="submit">Guardar ajustes</button></div>
        </form>
      </Card>

      <Card title="Pasarela de pagos" sub="Estado de la integración" className={s.span5} delay={0.05}>
        <div className={s.gateway}>
          <span className={s.badgeWarn}>● Sin conectar</span>
          <b>Wompi</b>
          <p>Pendiente: cuenta de One True y llaves de sandbox. Mientras tanto, el checkout del sitio funciona en modo demostración.</p>
          <ul className={s.checklist}>
            <li className={s.done}>Checkout simulado (tarjeta, PSE, Nequi)</li>
            <li>Llaves de sandbox en variables de entorno</li>
            <li>Webhook firmado verificado</li>
            <li>Pruebas de pago de punta a punta</li>
            <li>Llaves de producción</li>
          </ul>
        </div>
      </Card>

      <Card title="Equipo" sub="Quién puede entrar al panel" className={s.span7} delay={0.1}>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Nombre</th><th>Rol</th><th>2FA</th><th /></tr></thead>
            <tbody>
              {state.team.map((m) => (
                <tr key={m.id}>
                  <td><b>{m.name}</b><br /><small className={s.muted}>{m.email}</small></td>
                  <td>
                    <select value={m.role} aria-label={`Rol de ${m.name}`} onChange={(e) => {
                      const role = e.target.value as Role;
                      if (m.role === "Administrador" && role !== "Administrador" && admins <= 1) { toast("Debe quedar al menos un administrador", "err"); return; }
                      dispatch({ type: "setRole", id: m.id, role }); toast(`${m.name} ahora es ${role}`);
                    }}>{ROLES.map((r) => <option key={r.id}>{r.id}</option>)}</select>
                  </td>
                  <td>{m.mfa ? <span className={s.badgeOk}>Activo</span> : <span className={s.badgeWarn}>Pendiente</span>}</td>
                  <td>
                    {confirmRemove === m.id ? (
                      <span className={s.confirm}>
                        ¿Quitar?
                        <button className={s.tinyBtn} onClick={() => {
                          if (m.role === "Administrador" && admins <= 1) { toast("Debe quedar al menos un administrador", "err"); setConfirmRemove(null); return; }
                          dispatch({ type: "removeMember", id: m.id }); setConfirmRemove(null); toast(`${m.name} ya no tiene acceso`, "warn");
                        }}>Sí</button>
                        <button className={s.tinyBtn} onClick={() => setConfirmRemove(null)}>No</button>
                      </span>
                    ) : <button className={s.tinyBtn} onClick={() => setConfirmRemove(m.id)}>Quitar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className={s.inlineForm} onSubmit={addMember}>
          <input placeholder="Nombre" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
          <input placeholder="correo@ejemplo.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
          <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as Role })}>{ROLES.map((r) => <option key={r.id}>{r.id}</option>)}</select>
          <button className="btn btn-red btn-sm" type="submit">Invitar</button>
        </form>
        <ul className={s.roleHelp}>{ROLES.map((r) => <li key={r.id}><b>{r.id}:</b> {r.desc}</li>)}</ul>
      </Card>

      <Card title="Notificaciones" sub="Qué le avisamos al equipo de One True" className={s.span5} delay={0.15}>
        <div className={s.notifList}>
          {NOTIFS.map((n) => (
            <div key={n.key} className={s.switchRow}>
              <div><b>{n.label}</b><small>{n.desc}</small></div>
              <Toggle on={!!state.notifications[n.key]} onChange={(v) => { dispatch({ type: "setNotif", key: n.key, on: v }); toast(`${n.label}: ${v ? "activado" : "desactivado"}`); }} label={n.label} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Auditoría" sub="Todo lo que se cambia en el panel queda registrado" className={s.span7} delay={0.2}>
        {state.audit.length ? (
          <ul className={s.auditList}>
            {state.audit.slice(0, 15).map((a, i) => <li key={i}><span className={s.muted}>{fmtDateTime(a.at)}</span><b>{a.who}</b><span>{a.what}</span></li>)}
          </ul>
        ) : <p className={s.note}>Aún no hay cambios registrados.</p>}
      </Card>

      <Card title="Datos de demostración" sub="Solo para este diseño" className={s.span5} delay={0.25}>
        <p className={s.note} style={{ marginTop: 0 }}>Los cambios de esta demo (ingresos, bloqueos, precios, equipo…) se guardan en este navegador.</p>
        {confirmReset ? (
          <div className={s.actionsRow}>
            <button className="btn btn-red btn-sm" onClick={() => { dispatch({ type: "reset" }); setConfirmReset(false); toast("Demo restablecida", "warn"); }}>Sí, borrar todo</button>
            <button className={s.ghostBtn} onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        ) : <button className={s.ghostBtn} onClick={() => setConfirmReset(true)}>Restablecer datos de demo</button>}
      </Card>
    </div>
  );
}
