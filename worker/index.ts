/**
 * Worker de la página de Próximamente.
 *  POST /api/registro   guarda WhatsApp y/o correo en D1 (con consentimiento, anti-bots y límite por IP)
 *  GET  /api/registro   cuántas personas hay en la fila (para el contador de la página)
 *  GET  /api/leads.csv  exporta la lista (requiere Authorization: Bearer ADMIN_TOKEN)
 *  Todo lo demás lo sirven los archivos estáticos (Next.js export en ./out).
 *
 * Secretos opcionales (npx wrangler secret put NOMBRE):
 *  TURNSTILE_SECRET  activa la verificación de Cloudflare Turnstile
 *  ADMIN_TOKEN       habilita la exportación CSV
 *  IP_SALT           sal para el hash de IP (si falta se usa una fija)
 */

declare global {
  interface Env {
    TURNSTILE_SECRET?: string;
    ADMIN_TOKEN?: string;
    IP_SALT?: string;
  }
}

const MAX_PER_IP_10_MIN = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  country?: string; // indicativo sin "+", p. ej. "57"
  consent?: boolean;
  website?: string; // honeypot: los humanos no lo ven
  token?: string; // Turnstile
  source?: string;
  utm?: Record<string, string>;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/api/registro") {
      if (req.method === "POST") return signup(req, env);
      if (req.method === "GET") return count(env);
      return json({ error: "method" }, 405);
    }
    if (url.pathname === "/api/leads.csv") return exportCsv(req, env);
    if (url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;

/* ---------------------------------------------------------------------- */

async function signup(req: Request, env: Env): Promise<Response> {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return json({ error: "content_type" }, 415);
  let body: Payload;
  try { body = await req.json(); } catch { return json({ error: "json" }, 400); }

  // Bots que llenan todo: respondemos "ok" sin guardar nada
  if (body.website) return json({ ok: true, position: null });

  if (body.consent !== true) return json({ error: "consent" }, 422);

  const name = clean(body.name, 80);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone, body.country);
  if (body.email && !email) return json({ error: "email" }, 422);
  if (body.phone && !phone) return json({ error: "phone" }, 422);
  if (!email && !phone) return json({ error: "contact" }, 422);

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, body.token, req.headers.get("cf-connecting-ip"));
    if (!ok) return json({ error: "captcha" }, 403);
  }

  const ipHash = await sha256((req.headers.get("cf-connecting-ip") || "0.0.0.0") + (env.IP_SALT || "onetrue-lanzamiento"));
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > ?").bind(ipHash, since).first<{ n: number }>();
  if ((recent?.n ?? 0) >= MAX_PER_IP_10_MIN) return json({ error: "rate" }, 429);

  // ¿Ya estaba en la fila? Completamos el dato que falte y devolvemos su puesto
  const existing = await env.DB.prepare("SELECT id, email, phone FROM leads WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?) LIMIT 1")
    .bind(email, phone)
    .first<{ id: number; email: string | null; phone: string | null }>();
  if (existing) {
    await env.DB.prepare("UPDATE leads SET email = COALESCE(email, ?), phone = COALESCE(phone, ?), name = COALESCE(name, ?) WHERE id = ?")
      .bind(email, phone, name, existing.id)
      .run()
      .catch(() => null); // si el dato nuevo ya pertenece a otra fila, se deja como estaba
    return json({ ok: true, position: existing.id, already: true });
  }

  const row = await env.DB.prepare(
    "INSERT INTO leads (name, email, phone, consent_at, source, utm, ip_hash, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
  )
    .bind(name, email, phone, new Date().toISOString(), clean(body.source, 60), body.utm ? JSON.stringify(body.utm).slice(0, 500) : null, ipHash, clean(req.headers.get("user-agent") ?? undefined, 300))
    .first<{ id: number }>();

  return json({ ok: true, position: row?.id ?? null });
}

async function count(env: Env): Promise<Response> {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM leads").first<{ n: number }>();
  return new Response(JSON.stringify({ count: r?.n ?? 0 }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=30" },
  });
}

async function exportCsv(req: Request, env: Env): Promise<Response> {
  if (!env.ADMIN_TOKEN || req.headers.get("authorization") !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: "not_found" }, 404);
  const { results } = await env.DB.prepare("SELECT id, name, email, phone, source, consent_at, created_at FROM leads ORDER BY id").all<Record<string, string | number | null>>();
  const cols = ["id", "name", "email", "phone", "source", "consent_at", "created_at"];
  const esc = (v: unknown) => (v == null ? "" : `"${String(v).replace(/"/g, '""')}"`);
  const csv = [cols.join(","), ...results.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  return new Response("﻿" + csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="lista-lanzamiento.csv"', "cache-control": "no-store" },
  });
}

/* ---------------------------------------------------------------------- */

function clean(v: string | undefined, max: number): string | null {
  const s = (v ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return s ? s.slice(0, max) : null;
}

function normalizeEmail(v?: string): string | null {
  const s = (v ?? "").trim().toLowerCase();
  return s && s.length <= 254 && EMAIL_RE.test(s) ? s : null;
}

/** Devuelve el número en formato E.164. Colombia por defecto: 10 dígitos que empiezan por 3. */
function normalizePhone(v?: string, country = "57"): string | null {
  let digits = (v ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const cc = (country || "57").replace(/\D/g, "") || "57";
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (!(v ?? "").trim().startsWith("+") && !digits.startsWith(cc)) digits = cc + digits;
  if (cc === "57" && digits.startsWith("57") && !/^573\d{9}$/.test(digits)) return null;
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
}

async function verifyTurnstile(secret: string, token: string | undefined, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = (await r.json()) as { success?: boolean };
  return data.success === true;
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
