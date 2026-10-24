# Despliegue · One True

## Ramas

| Rama | Qué tiene | Se despliega en |
|---|---|---|
| `main` | Solo la página de **Próximamente** + API de la lista de lanzamiento | Dominio de One True (Worker `onetrue-proximamente`) |
| `develop` | El **sitio completo** (eventos, boletas, /historia, panel, base de datos) | Preview en `onetrue-develop.<cuenta>.workers.dev` |

Cada push a una de las dos ramas despliega solo con GitHub Actions (`.github/workflows/deploy.yml` de cada rama).
Los pull requests corren `lint` + `build` sin desplegar.

**Día del lanzamiento:** se lleva `develop` a `main` (merge reemplazando la página de Próximamente), se agrega el dominio a la config del sitio completo y se exporta la lista para avisar a todos.

## Una sola vez

### Supabase (lista de lanzamiento)
Proyecto `rtaflovadzoanspemxbh` (`https://rtaflovadzoanspemxbh.supabase.co`).

1. **SQL Editor** > pegar `supabase/migrations/0001_lista_lanzamiento.sql` > **Run**. Crea la tabla `launch_leads` (cerrada con RLS) y las funciones `join_launch_list` y `launch_list_count`.
2. **Project Settings > API Keys** > crear una **secret key** (`sb_secret_...`). Va solo en el Worker, nunca en el código ni en el navegador.

La llave publicable (`sb_publishable_...`) no hace falta para esta página: la tabla no se lee ni se escribe desde el navegador.

### Cloudflare
1. **Dominio:** agregar la zona y cambiar los nameservers en el registrador.
2. **Dominio en el Worker:** en `wrangler.jsonc` (rama `main`) descomentar `routes` con el dominio y `www`.
3. **Secretos del Worker:**
   ```bash
   npx wrangler login
   npx wrangler secret put SUPABASE_SECRET_KEY   # la sb_secret_ del paso anterior (obligatorio)
   npx wrangler secret put IP_SALT               # texto aleatorio para el hash de IP (recomendado)
   npx wrangler secret put TURNSTILE_SECRET      # solo si se activa Turnstile
   ```
4. **Token para GitHub:** Cloudflare > My Profile > API Tokens > plantilla "Edit Cloudflare Workers".
5. **GitHub > Settings > Secrets and variables > Actions:**
   - Secretos: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Variables: `SITE_URL` = `https://dominio` (URL absoluta para la tarjeta de WhatsApp) y, opcional, `TURNSTILE_SITE_KEY`

## Lista de lanzamiento (Supabase)

- Tabla `public.launch_leads`: nombre, correo, WhatsApp en formato `+57...`, fecha de autorización (Ley 1581), de dónde vino (`?ref=`/`utm_*`). La IP se guarda solo como hash.
- Solo el Worker escribe, con la llave secreta y a través de `join_launch_list`. La función valida, evita duplicados (completa el dato que faltaba y devuelve el mismo puesto) y limita a 5 registros por IP cada 10 minutos.
- Además, en el Worker: campo trampa invisible y Turnstile si hay llaves.
- **Ver y exportar:** Supabase > Table Editor > `launch_leads` > Export > CSV.
- **Contar:** `select count(*) from launch_leads;` en el SQL Editor.

## Probar en local (rama `main`)

Crear el archivo `.dev.vars` (no se sube a git) con la llave secreta:

```
SUPABASE_SECRET_KEY=sb_secret_...
```

```bash
npm install
npm run preview      # build + wrangler dev en http://localhost:8787
```

En local los registros van a la misma base de Supabase: borrar las pruebas desde el Table Editor.

## Pendientes

- [ ] Correr el SQL en Supabase, crear la llave secreta y cargar los secretos (pasos de arriba).
- [ ] Dominio en Cloudflare.
- [ ] Revisar el texto de tratamiento de datos con One True (razón social, canal oficial para pedir borrado).
- [ ] Logo oficial en SVG (hoy es una reconstrucción).
