# One True · Próximamente (rama `main`)

Página de lanzamiento en el dominio de One True: "El ring se está armando".
Recoge WhatsApp y correo para avisar del lanzamiento. El sitio completo vive en la rama **`develop`**.

- Next.js 16 (export estático) + framer-motion
- Cloudflare Workers: archivos estáticos en `./out` + `worker/index.ts` para `/api/*`
- Cloudflare D1 (`onetrue-lanzamiento`) para la lista; migraciones en `migrations/`

```bash
npm install
npm run db:local   # tabla local
npm run preview    # build + wrangler dev → http://localhost:8787
npm run lint       # tipos del sitio y del worker
```

Despliegue, dominio, secretos y exportar la lista: [docs/despliegue.md](docs/despliegue.md).
