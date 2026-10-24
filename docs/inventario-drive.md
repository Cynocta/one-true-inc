# Inventario del Drive "Publicidad" (revisado 2026-10-19)

Carpeta: `Publicidad` (dueño onetrue.incc@gmail.com). Revisión por muestreo de cada carpeta: tipos, tamaños y nombres; no se descargó nada.
Criterio de [base-de-datos.md](base-de-datos.md): **BD** = dato que va a tablas · **Storage** = se sube optimizado (WebP/AVIF, ≤1600 px, <300 KB) · **Drive** = se queda en el Drive como original.

## Resumen

| Carpeta | Qué hay | Peso típico | Destino |
|---|---|---|---|
| `OneTrue_pendientes_tienda.xlsx` | Checklist de la tienda (43 ítems, 28 % listo) | — | **BD** (ya en `seed.sql` lo aprobado) |
| `Logos/OneTrue` | 4 JPEG del logo | 6–24 KB | ⚠️ No sirven para web: muy pequeños. Pedir SVG |
| `Logos/TrueBoxing` | Logo PNG + versión blanca | 240–340 KB | **Storage** (convertir a SVG si existe el original) |
| `Logos/<marca>` (~24 carpetas) | Logos de patrocinadores y aliados (PNG, JPEG, PDF, PSD, PS) | 9 KB – 1,1 MB | **BD** (`sponsors`) + **Storage** solo los activos |
| `Formato mapas/MAPA_BOXEO.ai` | Mapa del recinto en Illustrator | 5,4 MB | **Drive** como fuente; exportar SVG → `venue_units` (geometría) |
| `Fotos peleadores/<A vs B>` (11 peleas) | Fotos por pelea y por peleador (celular) | ~1,2–1,4 MB | **BD** (peleadores y peleas por nombre) + **Storage** 1 foto por peleador |
| `Fotos peleadores/FOTOS PELEADORES AMATEUR` | 4 peleas amateur | — | **BD** con `level = amateur` |
| `Fotos peleadores/Peleas 06 de septiembre` | 5 peleas de TB4 | — | **BD** (`bouts` de TB4) |
| `Fotos y videos/TrueBoxing 3 Abril 27` | ~50 originales de cámara + `Editadas` (~40) + `Las mejores fotos…` | 12–30 MB / 0,6–1,9 MB | **Storage** solo `Editadas` y `Las mejores`; originales en **Drive** |
| `Fotos y videos/TrueBoxing 4 Septiembre 2026` | 9 carpetas por pelea (`PELEAS_…`) | 4–23 MB | ⚠️ **Mal nombrada**: son las fotos de agosto de 2025 (ver abajo) |
| `Fotos y videos/Fotos pelea La Chula Agosto 2025` | 9 carpetas por pelea (serie YAT) | 4–23 MB | Carpeta correcta de la noche del 26 ago 2025. **Storage**: 8 fotos en `/historia` |
| `Fotos y videos/Videos` | 1 video editado (`VIDEO GABO Y CAMILO.mp4`) | 76 MB | **Drive**; publicar en YouTube/IG y enlazar. A lo sumo un loop corto (<5 MB) para el banner |
| `Fotos con carros` + `TOMAS DE APOYO` | ~16 fotos + 11 clips de cámara | 1–4 MB / 67–604 MB | Fotos → **Storage** si son de patrocinador (¿Infiniti Renta Car?); clips → **Drive** |
| `Fotos Sentido Social OneTrue` | ~25 fotos de labor social | 12–21 MB | **Drive**; 3–5 → **Storage** para una noticia |

## Qué sale para la base de datos

**Peleas y peleadores (nombres tal como están en las carpetas; falta confirmar nombre completo, división y récord):**
- Steven "Gato" vs Juan Pablo Sanmartín · Brayan González vs José Pinto · Daniel Vernaza vs Steven Salazar · Yodany Jiménez vs Cristian Daniel Ocampo · Hendy Castillo vs Giulian Pérez · Sara Monsalve vs Michelle "Barbie" · Danny Vega vs Pestaña · Nicolás "Pólvora" vs Alexis Gutiérrez · Lobo vs Luis · David Pineda vs (rival sin nombre) · Daniel Betancur "Come" vs (rival sin nombre)
- TB4 (06 sep): Juan Pablo Sanmartín vs Ronald Vásquez · Hendy "La Presión" vs Cristian Díaz · José Pinto vs Eugenio Bernal · Yonandry Betorrean vs "El Gallo" Pestaña · Samuel Gutiérrez vs Yonde José
- TB4 por carpeta de fotos: Carlitos vs Deimer · El Gory · Hendy · Juanjo · Curry · Diego vs Carlos · Pestaña vs Carlos · Valentina · Dany vs Angola
- Amateur: Marlon Kroitblat vs Jean Pierre · Alex Moreno vs Carlos Gutiérrez · Nelson Quest vs Santiago Riviera · Rangel Millán vs Juliana Padilla

**Eventos (afiche oficial + metadatos de las fotos, revisado 2026-10-24):** 24 nov 2024 · 27 abr 2025 · 26 ago 2025 · TrueBoxing 3 el **26 abr 2026** (EXIF de las fotos DSC; la carpeta dice "Abril 27") · TrueBoxing 4 el 6 sep 2026.

**Cómo se fecharon las fotos:** EXIF `DateTimeOriginal` en las DSC de TB3; en las series ONCE_By_Yates y YAT no hay EXIF, pero sí `xmp:MetadataDate` (última edición en Lightroom): ONCE_By_Yates = 3 may 2026 (TB3) y YAT = 29 ago 2025. Por eso la serie YAT es de agosto de 2025 y no puede ser de TB4. En el Drive **no hay fotos** de las noches de nov 2024 ni abr 2025, ni fotos de TB4 en el ring (solo los retratos de su cartelera).

**Patrocinadores/aliados (carpetas de Logos):** 101 Boxing, AM Vision, BOXXERA, BoraBora, Beast Bites, Boxeo Torres, Bracarli, Cordental, Hood Fights, Infiniti Renta Car, Jamaiquita, King's Sparring Club, Lethal, MMA Colombia, Nite Boxing, Nocaut, Nya 94, Once by Yates, Sweet Georgia Café, Vibe Gastrobar, Vibenix, VitalFort, WarTape. Falta saber cuáles son patrocinadores actuales y de qué nivel.

**Tienda (aprobado en la hoja):** Camiseta TrueBoxing 2do aniversario · ref. CT2A2026 · 140.000 COP · S–XXL · unisex · negra · preventa.

## Cambios al esquema que salieron del Drive
- `brands` como tabla (TrueBoxing, TrueKnuckles, evento especial) en vez de lista fija.
- `fighters.level` / `bouts.level` (pro o amateur); `last_name` opcional (hay peleadores conocidos solo por apodo).
- `media` enlazada a evento, pelea y peleadores (`media_fighters`) + `curated` y `drive_folder_id`, para reflejar la estructura evento → pelea del Drive.
- Tienda: `products` con categoría, colección, material, cuidado, horma, tabla de medidas, preventa y destacado; variantes por color y talla; `product_media` (frente/espalda/detalle/modelo).
- `shop_orders`: pedido armado en la web y cerrado por WhatsApp (sin pasarela en la fase 1).
- `pages` y `faqs` para políticas y las 12 preguntas frecuentes de la hoja.
- `sponsors.kind` (patrocinador, aliado, gimnasio, medio).

## Para pedirle a One True
1. Logo oficial en **SVG o AI** (los JPEG del Drive pesan 6–24 KB y se ven mal en pantalla).
2. Fotos de las noches del 24 nov 2024, 27 abr 2025 y de TB4 en el ring (no están en el Drive). Renombrar la carpeta "TrueBoxing 4 Septiembre 2026", que tiene fotos de agosto de 2025.
3. Confirmar TB3 = 26 abr 2026 (las fotos lo dicen; la carpeta dice "Abril 27").
4. Por peleador: nombre completo, apodo, división, récord con fuente, ciudad, Instagram y **una foto de retrato** (ideal sin fondo).
5. Lista de patrocinadores vigentes y nivel.
6. Lo que falta de la hoja de la tienda: tabla de medidas, fotos del producto, stock por talla, número de WhatsApp de pedidos.
7. Confirmar derechos de uso de las fotos del fotógrafo (prefijo `YAT…`) y su crédito.
