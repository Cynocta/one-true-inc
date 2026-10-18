# One True Inc — Sitio web (base)

Sitio estático en HTML, CSS y JS, sin dependencias. Es bilingüe (ES/EN) y se ve bien en celular.
La estructura de las páginas sigue el estilo de los sitios de deportes de combate, pero el código, los textos y la marca son propios de One True.

## Ver en local
```bash
node serve.js
```
Abrir http://localhost:5500

## Páginas
| Archivo | Contenido |
|---|---|
| `index.html` | Home: nota principal, lo más visto, pelea estelar con cuenta regresiva, carruseles, destacado, próximas carteleras, peleador en la mira |
| `eventos.html` | Próximos y pasados (pestañas) |
| `evento.html?id=…` | Cartelera estelar y preliminares, resultados, cuenta regresiva |
| `peleadores.html` | Roster con filtro por división y búsqueda |
| `peleador.html?id=…` | Perfil, estadísticas, historial, próxima pelea |
| `rankings.html` | Libra por libra y ranking por división |
| `noticias.html` / `noticia.html?id=…` | Noticias y artículo |
| `boletas.html` | Zonas, precios, mapa del recinto y compra por WhatsApp |
| `contacto.html` | Formulario (demo) y canales |

## Dónde cambiar las cosas
- **Contenido** (peleadores, eventos, noticias, boletas, redes): `js/data.js`
- **Textos de la interfaz ES/EN**: `js/i18n.js`
- **Colores y tipografías**: tokens en `:root` de `css/styles.css`
- **Logo**: función `logo()` en `js/layout.js` (es provisional, hecho con CSS). Reemplazar por `<img src="assets/logo.svg">` cuando esté el oficial.
- **Fotos**: los rectángulos con etiqueta (`1600×900`, etc.) y las siluetas son marcadores de posición.

## Pendiente
- Logo oficial en SVG, fotos de peleadores (PNG sin fondo) y fotos de eventos
- Datos reales de peleadores, carteleras y precios
- Conectar boletería (pasarela o ticketera) y el formulario de contacto
- Textos legales (términos y privacidad)
