-- Lista de lanzamiento: quienes dejan WhatsApp y/o correo en la página de Próximamente.
-- Base D1 "onetrue-lanzamiento". Se aplica con: npx wrangler d1 migrations apply onetrue-lanzamiento --remote
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,      -- también es el puesto en la fila
  name        TEXT,
  email       TEXT UNIQUE,                            -- en minúsculas
  phone       TEXT UNIQUE,                            -- formato E.164 (+573001234567)
  consent_at  TEXT NOT NULL,                          -- autorización de datos (Ley 1581)
  source      TEXT,                                   -- ?ref= o utm_source del enlace compartido
  utm         TEXT,                                   -- JSON con utm_*
  ip_hash     TEXT,                                   -- SHA-256 de la IP (no se guarda la IP)
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS leads_ip_time ON leads (ip_hash, created_at);
