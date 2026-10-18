"use client";

/**
 * Estado del panel en modo demo. Se guarda en el navegador (localStorage) para que
 * lo que hagas en una sección se vea en las demás y sobreviva a recargar la página.
 * Con backend, cada acción será una llamada al servidor con permisos y auditoría.
 */
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import s from "./admin.module.css";

export type Role = "Administrador" | "Puerta" | "Peleador" | "Solo lectura";
export interface Member { id: string; name: string; email: string; role: Role; mfa: boolean }
export type Tier = "Presentado por" | "Oro" | "Plata";
export interface Sponsor { id: string; name: string; tier: Tier; url: string; active: boolean; placements: string[] }
export interface Checkin { at: number; gate: string; device: string; manual?: string; synced: boolean }
export interface ScanLog { id: string; at: number; code: string; result: "ok" | "dup" | "fake" | "other" | "manual"; holder?: string; zone?: string; gate: string }
export interface EventSettings { name?: string; date?: string; venue?: string; salesOpen: boolean; maxPerOrder: number; holdMinutes: number }
export interface AuditEntry { at: number; who: string; what: string }

interface State {
  checkins: Record<string, Checkin>; // clave: código de boleta
  scans: ScanLog[];
  blocked: string[]; // `${slug}:${unitId}`
  releasedHolds: string[]; // `${slug}:${zoneId}`
  prices: Record<string, [number, number, number]>; // `${slug}:${zoneId}`
  phaseDates: Record<string, string[]>; // slug → fechas de fin de etapa
  team: Member[];
  sponsors: Sponsor[];
  settings: Record<string, EventSettings>;
  notifications: Record<string, boolean>;
  resent: Record<string, number>;
  audit: AuditEntry[];
}

const INITIAL: State = {
  checkins: {}, scans: [], blocked: [], releasedHolds: [], prices: {}, phaseDates: {},
  team: [
    { id: "m1", name: "Equipo One True", email: "admin@onetrue.example", role: "Administrador", mfa: true },
    { id: "m2", name: "Cynocta Soporte", email: "soporte@cynocta.example", role: "Administrador", mfa: true },
    { id: "m3", name: "Puerta 1", email: "puerta1@onetrue.example", role: "Puerta", mfa: false },
    { id: "m4", name: "Puerta 2", email: "puerta2@onetrue.example", role: "Puerta", mfa: false },
  ],
  sponsors: [
    { id: "s1", name: "Patrocinador Principal (ejemplo)", tier: "Presentado por", url: "https://example.com", active: true, placements: ["Portada", "Cartelera", "Boleta", "Correo"] },
    { id: "s2", name: "Bebida Oficial (ejemplo)", tier: "Oro", url: "https://example.com", active: true, placements: ["Cartelera", "Correo"] },
    { id: "s3", name: "Gimnasio Aliado (ejemplo)", tier: "Plata", url: "https://example.com", active: false, placements: ["Cartelera"] },
  ],
  settings: {},
  notifications: { venta: true, resumenDiario: true, stockBajo: true, cambioEtapa: true, puerta: false },
  resent: {},
  audit: [],
};

type Action =
  | { type: "checkin"; code: string; c: Checkin; log: ScanLog }
  | { type: "scan"; log: ScanLog }
  | { type: "sync" }
  | { type: "resetDoor" }
  | { type: "toggleBlock"; key: string }
  | { type: "releaseHolds"; key: string }
  | { type: "setPrices"; key: string; prices: [number, number, number] }
  | { type: "setPhaseDates"; slug: string; dates: string[] }
  | { type: "addMember"; m: Member }
  | { type: "removeMember"; id: string }
  | { type: "setRole"; id: string; role: Role }
  | { type: "addSponsor"; sp: Sponsor }
  | { type: "updateSponsor"; sp: Sponsor }
  | { type: "removeSponsor"; id: string }
  | { type: "setSettings"; slug: string; settings: EventSettings }
  | { type: "setNotif"; key: string; on: boolean }
  | { type: "resent"; orderId: string }
  | { type: "audit"; what: string }
  | { type: "reset" }
  | { type: "hydrate"; state: State };

const withAudit = (st: State, what: string): State => ({ ...st, audit: [{ at: Date.now(), who: "Equipo One True", what }, ...st.audit].slice(0, 200) });

function reducer(st: State, a: Action): State {
  switch (a.type) {
    case "hydrate": return a.state;
    case "reset": return INITIAL;
    case "checkin": return { ...st, checkins: { ...st.checkins, [a.code]: a.c }, scans: [a.log, ...st.scans].slice(0, 300) };
    case "scan": return { ...st, scans: [a.log, ...st.scans].slice(0, 300) };
    case "sync": return { ...st, checkins: Object.fromEntries(Object.entries(st.checkins).map(([k, v]) => [k, { ...v, synced: true }])) };
    case "resetDoor": return withAudit({ ...st, checkins: {}, scans: [] }, "Reinició los ingresos de puerta (demo)");
    case "toggleBlock": {
      const on = st.blocked.includes(a.key);
      return withAudit({ ...st, blocked: on ? st.blocked.filter((k) => k !== a.key) : [...st.blocked, a.key] }, `${on ? "Desbloqueó" : "Bloqueó"} ${a.key.split(":")[1]}`);
    }
    case "releaseHolds": return withAudit({ ...st, releasedHolds: [...new Set([...st.releasedHolds, a.key])] }, `Liberó reservas de ${a.key.split(":")[1]}`);
    case "setPrices": return withAudit({ ...st, prices: { ...st.prices, [a.key]: a.prices } }, `Cambió precios de ${a.key.split(":")[1]}`);
    case "setPhaseDates": return withAudit({ ...st, phaseDates: { ...st.phaseDates, [a.slug]: a.dates } }, "Cambió fechas de etapas");
    case "addMember": return withAudit({ ...st, team: [...st.team, a.m] }, `Invitó a ${a.m.email} como ${a.m.role}`);
    case "removeMember": return withAudit({ ...st, team: st.team.filter((m) => m.id !== a.id) }, "Quitó un miembro del equipo");
    case "setRole": return withAudit({ ...st, team: st.team.map((m) => (m.id === a.id ? { ...m, role: a.role } : m)) }, `Cambió un rol a ${a.role}`);
    case "addSponsor": return withAudit({ ...st, sponsors: [...st.sponsors, a.sp] }, `Agregó patrocinador ${a.sp.name}`);
    case "updateSponsor": return { ...st, sponsors: st.sponsors.map((x) => (x.id === a.sp.id ? a.sp : x)) };
    case "removeSponsor": return withAudit({ ...st, sponsors: st.sponsors.filter((x) => x.id !== a.id) }, "Quitó un patrocinador");
    case "setSettings": return withAudit({ ...st, settings: { ...st.settings, [a.slug]: a.settings } }, "Guardó ajustes del evento");
    case "setNotif": return { ...st, notifications: { ...st.notifications, [a.key]: a.on } };
    case "resent": return withAudit({ ...st, resent: { ...st.resent, [a.orderId]: (st.resent[a.orderId] ?? 0) + 1 } }, `Reenvió boletas de ${a.orderId}`);
    case "audit": return withAudit(st, a.what);
    default: return st;
  }
}

const KEY = "ot-admin-demo-v1";

interface Ctx {
  state: State;
  dispatch: (a: Action) => void;
  toast: (msg: string, kind?: "ok" | "warn" | "err") => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function AdminStore({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  // Solo se guarda DESPUÉS de cargar lo guardado; si no, el estado vacío inicial
  // pisaría los datos (pasa en desarrollo, donde React monta los efectos dos veces).
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: string }[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: { ...INITIAL, ...JSON.parse(raw) } });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, ready]);

  const toast = useCallback((msg: string, kind: "ok" | "warn" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <StoreCtx.Provider value={{ state, dispatch, toast }}>
      {children}
      <div className={s.toasts} aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} className={`${s.toast} ${s[`toast_${t.kind}`]}`} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }}>
              {t.kind === "ok" ? "✓" : t.kind === "warn" ? "!" : "✕"} {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreCtx.Provider>
  );
}

export function useAdmin() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useAdmin must be used inside <AdminStore>");
  return c;
}
