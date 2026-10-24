-- =====================================================================
-- One True Inc · Esquema inicial (BORRADOR v0.2 · 2026-10-19, ajustado con el Drive "Publicidad")
-- Postgres 15+ / Supabase. Todo vive en el esquema `onetrue`.
-- Sale del modelo que hoy está en src/types.ts, src/data/*, checkout y panel admin.
-- No se ha ejecutado contra ninguna base todavía.
-- =====================================================================

create schema if not exists onetrue;
set search_path = onetrue, public;

create extension if not exists citext;

-- Texto bilingüe: {"es": "...", "en": "..."}  (equivale al tipo L10n del front)
create domain l10n as jsonb
  check (value ? 'es' and jsonb_typeof(value -> 'es') = 'string');

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =====================================================================
-- 1. MEDIOS (fotos, videos, logos). La base guarda la referencia, no el archivo.
--    El archivo optimizado vive en Storage (Supabase/R2); el original puede seguir en Drive.
-- =====================================================================
create table media (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('image', 'video', 'logo', 'document')),
  storage_path  text not null unique,          -- ruta en el bucket (versión web)
  drive_file_id text,                          -- origen en el Drive de One True (trazabilidad)
  alt           l10n,
  width         int,
  height        int,
  credit        text,                          -- fotógrafo / dueño de derechos
  rights        text not null default 'own' check (rights in ('own', 'licensed', 'placeholder')),
  curated       boolean not null default false, -- viene de "Editadas" / "Las mejores fotos"
  drive_folder_id text,                        -- carpeta de origen (pelea, evento, marca)
  created_at    timestamptz not null default now()
);

-- =====================================================================
-- 2. CATÁLOGO DEPORTIVO
-- =====================================================================
create table divisions (
  key        text primary key,                 -- flyw, feather, light...
  name       l10n not null,
  limit_kg   numeric(5,1),
  limit_lb   numeric(5,1),
  heavy_open boolean not null default false,   -- "+91 kg" (sin tope)
  women      boolean not null default false,
  sort       int not null default 0
);

create table fighters (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  first_name   text not null,
  last_name    text,                           -- hay peleadores conocidos solo por apodo ("Lobo", "Curry")
  nickname     text,
  level        text not null default 'pro' check (level in ('pro', 'amateur')),
  division_key text references divisions(key),
  country      char(3) not null default 'COL',
  city         text,
  birth_date   date,                           -- la edad se calcula, no se guarda
  height_cm    int,
  reach_cm     int,
  stance       text check (stance in ('orthodox', 'southpaw')),
  bio          l10n,
  -- Récord profesional total (incluye peleas fuera de One True; fuente: BoxRec / la promotora)
  pro_wins     int not null default 0,
  pro_losses   int not null default 0,
  pro_draws    int not null default 0,
  pro_kos      int not null default 0,
  record_source text,
  record_updated_at date,
  photo_id     uuid references media(id),
  cutout_id    uuid references media(id),      -- PNG sin fondo para heros
  instagram    text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger fighters_touch before update on fighters for each row execute function touch_updated_at();

create table venues (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  city       text not null,
  address    text,
  map_svg_id uuid references media(id)
);

-- Marcas de evento: trueboxing, trueknuckles y eventos especiales (p. ej. "La Chula", ago 2025).
create table brands (
  key     text primary key,
  name    text not null,
  logo_id uuid references media(id),
  logo_light_id uuid references media(id)      -- versión blanca para fondos oscuros
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  brand       text not null references brands(key),
  name        text not null,
  starts_at   timestamptz,                     -- null = fecha por definir
  doors_at    timestamptz,
  venue_id    uuid references venues(id),
  tagline     l10n,
  poster_id   uuid references media(id),
  status      text not null default 'draft'
              check (status in ('draft', 'announced', 'on_sale', 'sold_out', 'finished', 'cancelled')),
  sales_open  boolean not null default false,
  max_per_order int not null default 10,
  hold_minutes  int not null default 10,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger events_touch before update on events for each row execute function touch_updated_at();

create table bouts (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  card         text not null check (card in ('main', 'prelim')),
  position     int not null,                   -- 1 = estelar
  fighter_a    uuid not null references fighters(id),
  fighter_b    uuid not null references fighters(id),
  division_key text references divisions(key),
  rounds       int,                            -- null mientras no se confirme
  level        text not null default 'pro' check (level in ('pro', 'amateur')),
  title        boolean not null default false,
  -- Resultado (null mientras no se pelee)
  winner       text check (winner in ('a', 'b', 'draw', 'nc')),
  method       text check (method in ('KO', 'TKO', 'DEC', 'SD', 'MD', 'DQ', 'RTD')),
  end_round    int,
  end_time     interval,
  unique (event_id, card, position),
  check (fighter_a <> fighter_b)
);

-- Galerías: el Drive está organizado por evento → pelea; se conserva esa relación.
alter table media add column event_id uuid references events(id) on delete set null;
alter table media add column bout_id  uuid references bouts(id)  on delete set null;
create table media_fighters (
  media_id   uuid references media(id) on delete cascade,
  fighter_id uuid references fighters(id) on delete cascade,
  primary key (media_id, fighter_id)
);

-- Ranking como "foto" fechada: se puede mostrar la historia de posiciones.
create table rankings (
  id           uuid primary key default gen_random_uuid(),
  division_key text references divisions(key),  -- null = libra por libra
  published_on date not null,
  fighter_id   uuid not null references fighters(id),
  position     int not null,                   -- 0 = campeón
  unique (division_key, published_on, position),
  unique (division_key, published_on, fighter_id)
);

create table news (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  category     text not null,
  published_at timestamptz,
  event_id     uuid references events(id),
  title        l10n not null,
  excerpt      l10n,
  body         l10n,                           -- markdown
  cover_id     uuid references media(id),
  status       text not null default 'draft' check (status in ('draft', 'published'))
);
create table news_fighters (
  news_id    uuid references news(id) on delete cascade,
  fighter_id uuid references fighters(id),
  primary key (news_id, fighter_id)
);

-- Patrocinadores y aliados (el Drive tiene ~25 logos: marcas, gimnasios, restaurantes, medios).
create table sponsors (
  id        uuid primary key default gen_random_uuid(),
  name      text not null unique,
  kind      text not null default 'sponsor' check (kind in ('sponsor', 'ally', 'gym', 'media')),
  url       text,
  instagram text,
  logo_id   uuid references media(id)
);
-- Un patrocinador puede tener distinto nivel en cada evento.
create table event_sponsors (
  event_id   uuid references events(id) on delete cascade,
  sponsor_id uuid references sponsors(id),
  tier       text not null check (tier in ('presenting', 'gold', 'silver')),
  placements text[] not null default '{}',     -- portada, cartelera, boleta, correo, mapa
  active     boolean not null default true,
  primary key (event_id, sponsor_id)
);

-- =====================================================================
-- 3. BOLETERÍA (inventario)
-- =====================================================================
-- Zona por evento (el mismo recinto puede cambiar de layout entre eventos).
create table event_zones (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id) on delete cascade,
  code      text not null,                     -- palco-platino, ringside, vip...
  name      l10n not null,
  kind      text not null check (kind in ('general', 'seat', 'box')),
  persons   int not null default 1,            -- personas por palco
  capacity  int,                               -- solo kind = general; seat/box se cuentan en venue_units
  color     text,
  perks     jsonb,                             -- {"es": [...], "en": [...]}
  featured  boolean not null default false,
  sort      int not null default 0,
  unique (event_id, code)
);

-- Sillas y palcos numerados (geometría del mapa incluida).
create table venue_units (
  id        uuid primary key default gen_random_uuid(),
  zone_id   uuid not null references event_zones(id) on delete cascade,
  code      text not null,                     -- A13, P1, V5, R12
  label     text not null,
  geometry  jsonb,                             -- {x, y, w, h, rot}
  blocked   boolean not null default false,    -- cortesías / producción
  unique (zone_id, code)
);

create table price_phases (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id) on delete cascade,
  position  int not null,                      -- 1, 2, 3
  name      l10n not null,
  ends_at   timestamptz,                       -- null = última etapa
  unique (event_id, position)
);

create table zone_prices (
  zone_id   uuid references event_zones(id) on delete cascade,
  phase_id  uuid references price_phases(id) on delete cascade,
  price_cop int not null check (price_cop >= 0), -- palco: precio del palco completo
  primary key (zone_id, phase_id)
);

-- Adicionales de boletería (parqueadero, foto con peleador) y merch de la tienda.
-- Campos de merch = los que pide la hoja "OneTrue_pendientes_tienda" del Drive.
create table products (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,            -- referencia base, p. ej. CT2A2026
  name        l10n not null,
  description l10n,
  kind        text not null check (kind in ('addon', 'merch')),
  category    text,                            -- camiseta, buso, gorra, accesorio
  collection  text,                            -- "Exclusiva segundo aniversario"
  material    text,                            -- "85% algodón, 11% poliéster, 4% spandex"
  care        l10n,                            -- instrucciones de cuidado
  fit         text check (fit in ('unisex', 'men', 'women', 'kids')),
  size_chart  jsonb,                           -- {"S": {"pecho_cm": .., "largo_cm": ..}, ...}
  sale_mode   text not null default 'stock' check (sale_mode in ('stock', 'preorder', 'on_demand')),
  featured    boolean not null default false,  -- aparece en el home
  image_id    uuid references media(id),
  active      boolean not null default true
);
create table product_media (
  product_id uuid references products(id) on delete cascade,
  media_id   uuid references media(id) on delete cascade,
  color      text,                             -- una serie de fotos por color
  view       text check (view in ('front', 'back', 'detail', 'model', 'video')),
  sort       int not null default 0,
  primary key (product_id, media_id)
);
create table product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku        text not null unique,
  color      text,
  size       text,                             -- S, M, L, XL, XXL
  price_cop  int not null check (price_cop >= 0),
  compare_at_cop int,                          -- precio tachado si hay promoción
  stock      int,                              -- null = sin control de stock
  max_per_order int not null default 4,
  unique (product_id, color, size)
);
-- Qué adicionales se ofrecen en cada evento (y con qué precio, si cambia).
create table event_products (
  event_id   uuid references events(id) on delete cascade,
  variant_id uuid references product_variants(id),
  price_cop  int,                              -- null = precio de la variante
  primary key (event_id, variant_id)
);

-- =====================================================================
-- 4. VENTAS
-- =====================================================================
create table customers (
  id         uuid primary key default gen_random_uuid(),
  auth_user  uuid unique,                      -- auth.users si crea cuenta (opcional)
  email      citext not null unique,
  full_name  text not null,
  phone      text,
  doc_type   text check (doc_type in ('CC', 'CE', 'PA', 'TI', 'NIT')),
  doc_number text,
  marketing_opt_in boolean not null default false,   -- Ley 1581 (habeas data)
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table orders (
  id          uuid primary key default gen_random_uuid(),
  number      text not null unique,            -- OT-2026-123456 (lo que ve el cliente)
  event_id    uuid not null references events(id),
  customer_id uuid not null references customers(id),
  phase_id    uuid references price_phases(id),-- etapa con la que se congeló el precio
  status      text not null default 'pending'
              check (status in ('pending', 'paid', 'declined', 'expired', 'refunded', 'cancelled')),
  channel     text not null default 'web' check (channel in ('web', 'whatsapp', 'box_office', 'courtesy')),
  ref_fighter uuid references fighters(id),    -- "¿a quién vienes a ver?" / link del peleador
  utm         jsonb,
  subtotal_cop int not null,
  fees_cop    int not null default 0,
  total_cop   int not null,
  expires_at  timestamptz not null,            -- fin de la reserva (hold)
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index on orders (event_id, status);

create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  zone_id     uuid references event_zones(id),
  unit_id     uuid references venue_units(id),
  variant_id  uuid references product_variants(id),
  qty         int not null check (qty > 0),
  unit_price_cop int not null,                 -- precio congelado al momento de la compra
  check ((zone_id is not null) <> (variant_id is not null))
);

-- Una silla/palco solo puede estar en UNA orden viva a la vez → evita doble venta.
-- (las órdenes vencidas/rechazadas liberan la unidad al borrar su fila en unit_holds)
create table unit_holds (
  unit_id  uuid primary key references venue_units(id),
  order_id uuid not null references orders(id) on delete cascade
);

create table payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id),
  provider     text not null default 'wompi',
  provider_ref text unique,                    -- id de transacción Wompi
  method       text check (method in ('card', 'pse', 'nequi', 'bancolombia', 'cash')),
  status       text not null check (status in ('pending', 'approved', 'declined', 'voided', 'error')),
  amount_cop   int not null,
  raw          jsonb,                          -- webhook completo (auditoría)
  created_at   timestamptz not null default now()
);

-- Una boleta por persona (un palco de 6 genera 6 boletas).
create table tickets (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,             -- lo que va en el QR (aleatorio, no adivinable)
  order_id   uuid not null references orders(id),
  event_id   uuid not null references events(id),
  zone_id    uuid not null references event_zones(id),
  unit_id    uuid references venue_units(id),
  holder_name text,
  holder_doc  text,
  seq        int not null,                     -- 1 de 6
  status     text not null default 'valid' check (status in ('valid', 'used', 'void')),
  created_at timestamptz not null default now()
);
create index on tickets (event_id);

-- Pedidos de la tienda (fase 1): el carrito se arma en la web y se cierra por WhatsApp.
-- Sin pasarela ni reserva de cupo: el equipo confirma pago y envío a mano.
create table shop_orders (
  id          uuid primary key default gen_random_uuid(),
  number      text not null unique,            -- va en el mensaje de WhatsApp
  customer_name  text,
  customer_phone text,
  city        text,
  status      text not null default 'requested'
              check (status in ('requested', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled')),
  subtotal_cop int not null,
  shipping_cop int,                            -- se acuerda por WhatsApp
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger shop_orders_touch before update on shop_orders for each row execute function touch_updated_at();
create table shop_order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references shop_orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  qty        int not null check (qty > 0),
  unit_price_cop int not null
);

-- Textos editables: políticas (cambios, envíos, términos, privacidad) y preguntas frecuentes.
create table pages (
  slug       text primary key,                 -- cambios-y-devoluciones, envios, terminos, privacidad
  title      l10n not null,
  body       l10n not null,                    -- markdown
  status     text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);
create table faqs (
  id       uuid primary key default gen_random_uuid(),
  topic    text not null check (topic in ('shop', 'tickets', 'general')),
  question l10n not null,
  answer   l10n not null,
  sort     int not null default 0,
  status   text not null default 'draft' check (status in ('draft', 'published'))
);

-- =====================================================================
-- 5. OPERACIÓN (puerta, equipo, auditoría)
-- =====================================================================
create table staff (
  user_id uuid primary key,                    -- auth.users
  name    text not null,
  role    text not null check (role in ('admin', 'door', 'fighter', 'readonly')),
  fighter_id uuid references fighters(id)      -- rol "peleador": ve sus ventas referidas
);

create table scans (
  id        bigint generated always as identity primary key,
  event_id  uuid not null references events(id),
  code      text not null,
  ticket_id uuid references tickets(id),
  result    text not null check (result in ('ok', 'dup', 'fake', 'other_event', 'manual')),
  gate      text,
  device    text,
  staff_id  uuid references staff(user_id),
  scanned_at timestamptz not null default now(),
  synced_at timestamptz                        -- escaneos offline que se suben después
);
-- Solo un ingreso válido por boleta.
create unique index scans_one_ok on scans (ticket_id) where result in ('ok', 'manual');

create table audit_log (
  id       bigint generated always as identity primary key,
  at       timestamptz not null default now(),
  staff_id uuid references staff(user_id),
  action   text not null,
  entity   text,
  entity_id uuid,
  data     jsonb
);

-- =====================================================================
-- 6. VISTAS PARA EL FRONT
-- =====================================================================
-- Récord dentro de One True (sale de las peleas, no se escribe a mano).
create view fighter_onetrue_record as
select f.id as fighter_id,
       count(*) filter (where (b.winner = 'a' and b.fighter_a = f.id) or (b.winner = 'b' and b.fighter_b = f.id)) as wins,
       count(*) filter (where (b.winner = 'b' and b.fighter_a = f.id) or (b.winner = 'a' and b.fighter_b = f.id)) as losses,
       count(*) filter (where b.winner = 'draw') as draws
from fighters f
join bouts b on f.id in (b.fighter_a, b.fighter_b) and b.winner is not null
group by f.id;

-- Disponibilidad por zona (lo que pinta el mapa y la tabla de precios).
create view zone_availability as
select z.id as zone_id, z.event_id, z.code, z.kind,
       case when z.kind = 'general' then z.capacity
            else (select count(*) from venue_units u where u.zone_id = z.id and not u.blocked) end as total,
       case when z.kind = 'general' then
              z.capacity - coalesce((select sum(oi.qty) from order_items oi join orders o on o.id = oi.order_id
                                     where oi.zone_id = z.id and (o.status = 'paid' or (o.status = 'pending' and o.expires_at > now()))), 0)
            else (select count(*) from venue_units u where u.zone_id = z.id and not u.blocked
                  and not exists (select 1 from unit_holds h join orders o on o.id = h.order_id
                                  where h.unit_id = u.id and (o.status = 'paid' or (o.status = 'pending' and o.expires_at > now())))) end as available
from event_zones z;

-- Etapa de precio vigente por evento.
create view current_phase as
select distinct on (event_id) event_id, id as phase_id, position
from price_phases
where ends_at is null or ends_at >= now()
order by event_id, position;

-- =====================================================================
-- 7. SEGURIDAD (RLS). Lectura pública solo de contenido publicado;
--    ventas, clientes y puerta solo por funciones del servidor (service role).
-- =====================================================================
alter table fighters enable row level security;
alter table events enable row level security;
alter table bouts enable row level security;
alter table news enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table tickets enable row level security;
alter table scans enable row level security;
alter table shop_orders enable row level security;
alter table shop_order_items enable row level security;
alter table products enable row level security;
alter table pages enable row level security;
alter table faqs enable row level security;

create policy pub_read on fighters for select using (active);
create policy pub_read on events   for select using (status <> 'draft');
create policy pub_read on bouts    for select using (exists (select 1 from events e where e.id = event_id and e.status <> 'draft'));
create policy pub_read on news     for select using (status = 'published' and published_at <= now());
create policy pub_read on products for select using (active);
create policy pub_read on pages    for select using (status = 'published');
create policy pub_read on faqs     for select using (status = 'published');
-- customers / orders / payments / tickets / scans / shop_orders: sin políticas públicas → solo service role.
