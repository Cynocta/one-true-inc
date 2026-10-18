# One True Inc — Sitio web

Next.js 16 (App Router) + React 19 + TypeScript + framer-motion. Bilingüe ES/EN y exportable como sitio estático.

## Comandos
```bash
npm install        # primera vez
npm run dev        # desarrollo → http://localhost:3000
npm run build      # genera /out (HTML estático, se sube a cualquier hosting: Vercel, Netlify, cPanel…)
npm run lint       # chequeo de tipos
```

## Estructura
```
src/
  app/
    (root)/page.tsx            "/" → redirige a /es/ o /en/
    [lang]/                    todas las páginas, por idioma
      layout.tsx               fuentes, header, footer
      template.tsx             transición entre páginas
      page.tsx                 home
      eventos/ · eventos/[slug]/
      peleadores/ · peleadores/[slug]/
      rankings/ · noticias/ · noticias/[slug]/
      boletas/ · contacto/
    globals.css                tokens de marca (colores, fuentes) y utilidades
  components/
    layout/                    Header (menú, idioma, búsqueda), Footer, SearchOverlay
    ui/                        animaciones (motion.tsx), Countdown, Carousel, Stats, PageHero, Ticker, Media, Brand (logo)
    fighters/                  FighterArt (foto o ilustración), FighterCard, FighterGrid
    events/                    EventCard, FightRow, VersusHero, Tabs
    news/ · home/ · tickets/ · contact/ · pages/
  data/                        ← CONTENIDO (editar aquí)
    fighters.ts  events.ts  news.ts  divisions.ts  site.ts (redes, boletas)  photos.ts
  i18n/                        textos de interfaz es.ts / en.ts
  lib/                         consultas (data.ts) y formatos (format.ts)
legacy/                        versión anterior en HTML/JS plano (referencia)
```

## Fotos de peleadores
Las fotos actuales son **de ejemplo**, de [Unsplash](https://unsplash.com/license) (uso comercial libre). Son atletas anónimos, **no** los peleadores de One True.
Están en `src/data/photos.ts`, cada una con el nombre de su fotógrafo.

Para poner la foto real de un peleador:
1. Copia la imagen a `public/fighters/<slug>.jpg` (vertical, ~1200×1500; idealmente PNG sin fondo).
2. En `src/data/photos.ts` cambia su `url` por `"/fighters/<slug>.jpg"`.

Si se borra la entrada, se muestra automáticamente la ilustración generada (`FighterArt`).

## Pendiente
- Logo oficial en SVG (hoy es una aproximación en CSS: `components/ui/Brand.tsx`)
- Fotos y datos reales de peleadores, carteleras y precios
- Conectar boletería (hoy abre WhatsApp) y el formulario de contacto
- Textos legales
