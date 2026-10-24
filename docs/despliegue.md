# Despliegue · One True

## Ramas

| Rama | Qué tiene | Se despliega en |
|---|---|---|
| `main` | Solo la página de **Próximamente** + API de la lista de lanzamiento | Dominio de One True (Worker `onetrue-proximamente`) |
| `develop` | El **sitio completo** (eventos, boletas, /historia, panel, base de datos) | Preview en `onetrue-develop.<cuenta>.workers.dev` |

Cada push a una de las dos ramas despliega solo con GitHub Actions (`.github/workflows/deploy.yml` de cada rama).
Los pull requests corren `lint` + `build` sin desplegar.

**Día del lanzamiento:** se lleva `develop` a `main` (merge reemplazando la página de Próximamente), se agrega el dominio a la config del sitio completo y se exporta la lista para avisar a todos.

## Una sola vez (lo hace alguien con acceso a Cloudflare)

1. **Dominio en Cloudflare:** agregar la zona y cambiar los nameservers en el registrador.
2. **Base de datos de la lista:**
   ```bash
   npx wrangler login
   npx wrangler d1 create onetrue-lanzamiento
   ```
   Copiar el `database_id` que devuelve en `wrangler.jsonc` (rama `main`).
3. **Dominio en el Worker:** en `wrangler.jsonc` (rama `main`) descomentar `routes` y poner el dominio y `www`.
4. **Token para GitHub:** Cloudflare, My Profile, API Tokens, plantilla "Edit Cloudflare Workers" + permiso **D1: Edit**.
5. **GitHub, Settings, Secrets and variables, Actions:**
   - Secretos: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Variables: `SITE_URL` = `https://dominio` (hace que la tarjeta de WhatsApp tenga URL absoluta) y, opcional, `TURNSTILE_SITE_KEY`
6. **Secretos del Worker** (opcionales pero recomendados):
   ```bash
   npx wrangler secret put ADMIN_TOKEN       # contraseña larga para exportar la lista
   npx wrangler secret put IP_SALT           # texto aleatorio para el hash de IP
   npx wrangler secret put TURNSTILE_SECRET  # si se activa Turnstile (anti-bots)
   ```

## Lista de lanzamiento (D1)

- Tabla `leads`: nombre, correo, WhatsApp en formato `+57...`, fecha de autorización (Ley 1581), de dónde vino (`?ref=`/`utm_*`). La IP se guarda solo como hash.
- Anti-bots: campo trampa invisible, máximo 5 registros por IP cada 10 minutos y Turnstile si hay llaves.
- Si alguien se registra dos veces, no se duplica: se completa el dato que faltaba y se le muestra su mismo puesto.
- **Exportar** (Excel abre el CSV directo):
  ```bash
  curl -H "Authorization: Bearer TU_ADMIN_TOKEN" https://dominio/api/leads.csv -o lista-lanzamiento.csv
  ```
- Contar desde la terminal: `npx wrangler d1 execute onetrue-lanzamiento --remote --command "SELECT COUNT(*) FROM leads"`

## Probar en local (rama `main`)

```bash
npm install
npm run db:local     # crea la tabla en la D1 local
npm run preview      # build + wrangler dev en http://localhost:8787
```

## Pendientes

- [ ] Dominio, `database_id` y secretos (pasos de arriba).
- [ ] Revisar el texto de tratamiento de datos con One True (razón social, canal oficial para pedir borrado).
- [ ] Logo oficial en SVG (hoy es una reconstrucción).
