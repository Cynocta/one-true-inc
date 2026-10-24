-- Datos semilla REALES (solo lo confirmado). Fuente de cada bloque al lado.
set search_path = onetrue, public;

-- Marcas (carpetas Logos/TrueBoxing y Fotos y videos del Drive "Publicidad")
insert into brands (key, name) values
  ('trueboxing', 'TrueBoxing'),
  ('trueknuckles', 'TrueKnuckles'),
  ('special', 'Evento especial');

-- Divisiones (las que ya usa el sitio; límites oficiales de peso)
insert into divisions (key, name, limit_kg, limit_lb, heavy_open, women, sort) values
  ('flyw',    '{"es":"Mosca femenino","en":"Women''s Flyweight"}', 51, 112, false, true, 1),
  ('feather', '{"es":"Pluma","en":"Featherweight"}',               57, 126, false, false, 2),
  ('light',   '{"es":"Ligero","en":"Lightweight"}',                61, 135, false, false, 3),
  ('welter',  '{"es":"Wélter","en":"Welterweight"}',               67, 147, false, false, 4),
  ('middle',  '{"es":"Mediano","en":"Middleweight"}',              73, 160, false, false, 5),
  ('heavy',   '{"es":"Pesado","en":"Heavyweight"}',                91, 200, true,  false, 6);

-- Tienda · hoja "OneTrue_pendientes_tienda.xlsx" (Drive, 2026-10-19), solo filas en estado "Aprobado".
-- Pendiente: tabla de medidas, fotos, stock por talla (hoy "30 camisetas", en revisión), destacados.
insert into products (code, name, description, kind, category, collection, material, care, fit, sale_mode)
values ('CT2A2026',
  '{"es":"Camiseta TrueBoxing 2do aniversario"}',
  '{"es":"Camiseta oversize estampada para amantes del boxeo. Negra, con estampado adelante y atrás."}',
  'merch', 'camiseta', 'Exclusiva segundo aniversario',
  '85% algodón, 11% poliéster, 4% spandex',
  '{"es":"Secar a la sombra, con plancha tibia"}',
  'unisex', 'preorder');

insert into product_variants (product_id, sku, color, size, price_cop)
select p.id, 'CT2A2026-NEG-' || s, 'negro', s, 140000
from products p, unnest(array['S', 'M', 'L', 'XL', 'XXL']) as s
where p.code = 'CT2A2026';
