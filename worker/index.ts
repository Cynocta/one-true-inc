/**
 * Worker de la página de Próximamente.
 *  POST /api/registro   guarda WhatsApp y/o correo en Supabase (consentimiento, anti-bots y límite por IP)
 *  GET  /api/registro   cuántas personas hay en la fila (para el contador de la página)
 *  Todo lo demás lo sirven los archivos estáticos (Next.js export en ./out).
 *
 * La tabla public.launch_leads está cerrada con RLS: solo se escribe con las funciones
 * join_launch_list / launch_list_count, y solo con la llave secreta (service_role).
 * SQL: supabase/migrations/0001_lista_lanzamiento.sql
 *
 * Config:  SUPABASE_URL (vars en wrangler.jsonc)
 * Secretos (npx wrangler secret put NOMBRE; en local, archivo .dev.vars):
 *  SUPABASE_SECRET_KEY  llave secreta del proyecto (sb_secret_...). Obligatoria.
 *  TURNSTILE_SECRET     activa la verificación de Cloudflare Turnstile (opcional)
 *  IP_SALT              sal para el hash de IP (opcional)
 */

declare global {
  interface Env {
    SUPABASE_URL: string;
    SUPABASE_SECRET_KEY?: string;
    TURNSTILE_SECRET?: string;
    IP_SALT?: string;
  }
}

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

  if (!env.SUPABASE_SECRET_KEY) return json({ error: "config" }, 503);
  const ipHash = await sha256((req.headers.get("cf-connecting-ip") || "0.0.0.0") + (env.IP_SALT || "onetrue-lanzamiento"));

  const r = await rpc(env, "join_launch_list", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_source: clean(body.source, 60),
    p_utm: body.utm && typeof body.utm === "object" ? body.utm : null,
    p_ip_hash: ipHash,
    p_user_agent: clean(req.headers.get("user-agent") ?? undefined, 300),
  });
  if (!r.ok) {
    const err = (await r.json().catch(() => ({}))) as { message?: string };
    const msg = err.message || "";
    if (msg === "rate") return json({ error: "rate" }, 429);
    if (msg === "contact") return json({ error: "contact" }, 422);
    if (msg.includes("phone_check")) return json({ error: "phone" }, 422);
    if (msg.includes("email_check")) return json({ error: "email" }, 422);
    console.error("supabase join_launch_list", r.status, msg);
    return json({ error: "server" }, 502);
  }
  const rows = (await r.json()) as { queue_position: number; already: boolean }[];
  return json({ ok: true, position: rows[0]?.queue_position ?? null, already: !!rows[0]?.already });
}

async function count(env: Env): Promise<Response> {
  if (!env.SUPABASE_SECRET_KEY) return json({ count: 0 });
  const r = await rpc(env, "launch_list_count", {});
  const n = r.ok ? Number(await r.json()) : 0;
  return new Response(JSON.stringify({ count: Number.isFinite(n) ? n : 0 }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=30" },
  });
}

/** Llama una función de Postgres por la API REST de Supabase con la llave secreta. */
function rpc(env: Env, fn: string, args: Record<string, unknown>): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: env.SUPABASE_SECRET_KEY!, "content-type": "application/json" },
    body: JSON.stringify(args),
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
