# Mente en Balance — Página web

Sitio de **Mente en Balance** (Psicología & Yoga) construido con **React + TypeScript + Vite**.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (probado con Node 20).

## Cómo trabajar

```bash
npm install      # instala las dependencias (solo la primera vez)
npm run dev      # levanta el sitio en modo desarrollo (http://localhost:5173)
npm run build    # genera la versión de producción en la carpeta dist/
npm run preview  # previsualiza la versión de producción
```

Con `npm run dev` el navegador se actualiza solo cada vez que guardas un cambio.

## Estructura del proyecto

```
src/
  main.tsx              Punto de entrada de la app
  App.tsx               Rutas de las páginas + layout (header/footer)
  data.ts               ← CONTENIDO editable (textos, servicios, agenda, etc.)
  types.ts              Tipos de TypeScript del contenido
  index.css             Estilos y variables de marca (colores, fuentes)
  components/
    Header.tsx          Barra superior con navegación
    Footer.tsx          Pie de página
    Placeholder.tsx     Marcador para imágenes aún no cargadas
  pages/
    Inicio.tsx          Página de inicio
    Sobre.tsx           Sobre nosotras
    Servicios.tsx       Servicios
    Agenda.tsx          Agenda (con filtros)
    Diario.tsx          Diario / artículos
    Contacto.tsx        Contacto (formulario + newsletter)
public/
  logo.svg              Logo del sitio (5 KB, vectorizado desde logo.png)
  logo.png              Original en alta resolución (ya no lo carga el sitio)
  favicon.svg / .ico    Ícono de la pestaña
  apple-touch-icon.png  Ícono para "Agregar a inicio" (iPhone)
  icon-192/512.png      Íconos del acceso directo (site.webmanifest)
```

## Dónde hacer cambios frecuentes

- **Textos, servicios, clases y artículos** → `src/data.ts`
- **Colores y fuentes** → variables al inicio de `src/index.css` (`:root`)
- **Estructura de una página** → el archivo correspondiente en `src/pages/`

## Notas

- Las imágenes son marcadores (`Placeholder`). Cuando tengas las fotos,
  reemplázalos por etiquetas `<img>` en el componente correspondiente.
- El prototipo original (`Mente en Balance.dc.html`, `support.js`, `_ds/`) se
  conserva solo como referencia; el sitio real vive en `src/`.
```

## Formulario de contacto (WhatsApp)

El formulario de `/contacto` pide nombre, interés, modalidad (opcional) y mensaje, y **abre WhatsApp con el mensaje ya escrito** para el número de Mari (`https://wa.me/56943549436?text=…`, armado en `src/pages/Contacto.tsx`). La persona solo toca **Enviar** en WhatsApp: en el celular se abre la app y en el computador WhatsApp Web o de escritorio. No pasa por ningún servidor ni se guarda en el sitio, así que no requiere configuración.

El número y el mensaje de saludo se cambian en `contacto` de `src/data.ts`.

### Envío por correo (desactivado)

El envío por correo con Resend (`api/contact.ts`) sigue en el código, pero el formulario ya no lo usa. Sirve de base si más adelante se quiere guardar una copia de los mensajes en el panel o volver al correo.

**Protecciones incluidas**

- **Rate limit por visitante**, guardado en Upstash Redis:
  - Por navegador (ID anónimo en `localStorage`): 3 envíos cada 10 min y 8 por día.
  - Por IP (guardada anonimizada con SHA-256): 5 cada 10 min y 15 por día.
  - Tope global: 150 mensajes por día.
- **Anti-bots:** un campo trampa invisible y un tiempo mínimo de 3 s para llenar el formulario. Los bots reciben un "ok" falso y no se envía nada.
- **Validación** en el servidor, con errores que aparecen junto a cada campo.

**Configuración (una sola vez)**

1. En Resend, crea una cuenta, verifica el dominio `menteenbalance.com` (registros DNS) y copia la API key.
2. En Vercel, entra a **Storage → Upstash Redis** y conéctalo al proyecto. Esto crea `KV_REST_API_URL` y `KV_REST_API_TOKEN` automáticamente.
3. En Vercel, entra a **Settings → Environment Variables** y agrega `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` y `RATE_LIMIT_SALT`. Ver `.env.example`.
4. Vuelve a desplegar el sitio.

**En desarrollo:** con `npm run dev` el formulario funciona localmente. Sin `RESEND_API_KEY` en `.env.local`, el correo no se envía y se muestra en la consola.

## Panel de administración (/admin)

La administradora entra en **`/admin`** con su correo y contraseña. Desde ahí edita, sin tocar código:

| Pestaña | Qué se edita |
|---|---|
| **Servicios** | Nombre, color, etiqueta y textos de cada servicio (y su orden). Grupos de aranceles con sus valores. |
| **Agenda** | Crear, editar, duplicar y eliminar actividades, con su tipo (Yoga / Meditación / Talleres, los mismos filtros del sitio). Las pasadas se ocultan solas. **Clases que se repiten**: se crean una vez (días de la semana, hora, desde/hasta) y el sitio muestra solas las fechas de las próximas 4 semanas; se puede cancelar una fecha puntual. |
| **Diario** | Publicaciones tipo blog: título, categoría, bajada, foto, texto con formato simple, borrador, publicado o **programado** (fecha y hora de Chile: aparece sola a esa hora). Cada una tiene su página `/diario/<titulo>`. |
| **Instagram** | Mostrar u ocultar el módulo "Síguenos en Instagram" del Inicio y editar su frase. |
| **Fotos** | Todas las fotos del sitio (portada, Detrás de Mente en Balance, mosaico de Instagram, fotos de ambiente del Diario y la 404): cambiar, describir, elegir el punto de enfoque o volver a la original. |
| **Comunidad** | Mensajes para la comunidad de WhatsApp: escribir con el formato de WhatsApp y emojis, vista previa, programar fecha y hora, recordatorio en el calendario y envío en dos toques. |

Los cambios se ven en el sitio en menos de un minuto.

**Publicaciones programadas:** no usan tareas programadas. `/api/content` filtra al momento de leer (`src/lib/tiempo.ts`, hora de Santiago), así que la publicación aparece en el sitio en cuanto llega su hora (hasta ~30 s por la caché).

**Historial y deshacer:** cada pestaña tiene un botón **Historial**. Cada vez que se guarda, la versión anterior queda ahí (las últimas 15 por sección, con fecha y quién hizo el cambio). Cada versión explica qué pasaría al restaurarla ("Vuelve…", "Se quita…", "Cambia…") y se recupera con dos clics. Restaurar también queda en el historial, así que se puede deshacer. En Redis se guarda en `meb:historial:<sección>`; en local, en `.data/historial/`.

**Cómo funciona**

- Las clases que se repiten se guardan como una serie (`recurrentes`) y `/api/content` las convierte en fechas al momento de servirlas (`src/lib/recurrentes.ts`; cambia `SEMANAS_VISIBLES` para mostrar más o menos semanas). En Inicio cada serie aparece solo con su fecha más próxima.
- El contenido se guarda en **Upstash Redis** (el mismo del formulario). Mientras no se edite nada, el sitio usa el contenido inicial de `src/data.ts`.
- Las fotos del Diario se comprimen en el navegador (WebP, máx. 1600 px) y se guardan en **Vercel Blob**.
- La sesión es una cookie firmada, `HttpOnly` y `SameSite=Strict`, que dura 7 días. El login permite 8 intentos cada 15 minutos por IP.
- El servidor valida todo lo que llega del panel; el texto de las publicaciones nunca se inserta como HTML.
- El código del panel se descarga solo al entrar a `/admin`: no pesa en el sitio público.

**Configuración en Vercel (una sola vez)**

1. **Storage → Upstash Redis**: conectado para el formulario (crea `KV_REST_API_URL` y `KV_REST_API_TOKEN`).
2. **Storage → Blob** (acceso **público**): créalo y conéctalo al proyecto. Crea `BLOB_STORE_ID`; la autenticación es automática (OIDC).
3. **Settings → Environment Variables**: agrega `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `SESSION_SECRET` (ver `.env.example`).
4. Vuelve a desplegar.

**Instagram:** el módulo del Inicio es una tarjeta de perfil con un mosaico de fotos propias del sitio (`src/components/InstagramModulo.tsx`) y un botón a @menteenbalance.cl. No usa servicios externos ni la API de Instagram, así que no requiere configuración. Para cambiar las fotos del mosaico, edita la lista `mosaico` en ese archivo.

**En desarrollo:** con `npm run dev` (o `iniciar-local.bat`) el panel funciona en `http://localhost:5175/admin` con `admin@local` / `balance-local`. El contenido se guarda en `.data/` y las fotos en `public/uploads/` (ambas carpetas ignoradas por git).

## Dirección del sitio y vista previa al compartir

- La dirección pública se define en **un solo lugar** (`api/_lib/config.ts`): usa `VITE_SITE_URL` si existe; si no, la que Vercel entrega en cada build (`VERCEL_PROJECT_PRODUCTION_URL`, que pasa a ser el dominio propio apenas se conecta). En local: `http://localhost:5175`.
- En el navegador se usa desde `src/config.ts` (`SITE_URL`, `url("/ruta")`).
- `index.html` incluye las etiquetas Open Graph y de Twitter; la imagen es `public/og/portada.jpg` (1200×630).
- Cada página declara su dirección oficial (`<link rel="canonical">`) en minúsculas y sin "/" final; las páginas 404 no la llevan.
- Si se cambia la imagen de vista previa, WhatsApp y Facebook pueden tardar en actualizarla: se fuerza con el [Depurador de Facebook](https://developers.facebook.com/tools/debug/) ("Volver a extraer").


## Estadísticas de visitas

El sitio usa **Vercel Web Analytics** (`src/Estadisticas.tsx`): sin cookies y sin
datos personales, por lo que no necesita banner de consentimiento.

- **Activar:** en Vercel → proyecto → pestaña **Analytics** → **Enable**. Hasta
  activarlo, el sitio funciona igual pero no se registra nada.
- **Qué se ve:** visitas por página, de dónde llegan (Instagram, Google,
  WhatsApp…), país y tipo de dispositivo.
- **Qué no se cuenta:** el panel `/admin`. De la dirección solo se conservan los
  parámetros `utm_*` (útiles para campañas); el resto se quita antes de enviar.
- **En local** no se envía nada.

## Encabezados de seguridad

`vercel.json` agrega a todas las respuestas:

| Encabezado | Para qué |
|---|---|
| `Content-Security-Policy` | Solo se ejecutan scripts del propio sitio; fuentes de Google Fonts; imágenes de cualquier `https:` (fotos del Diario en Vercel Blob). Nadie puede meter el sitio dentro de otra página (`frame-ancestors 'none'`). |
| `X-Frame-Options: DENY` | Lo mismo para navegadores antiguos (evita *clickjacking*). |
| `X-Content-Type-Options: nosniff` | El navegador no "adivina" tipos de archivo. |
| `Referrer-Policy` | Al salir a otro sitio solo se informa el dominio, no la página. |
| `Permissions-Policy` | Cámara, micrófono, ubicación y pagos desactivados. |
| `Cross-Origin-Opener-Policy` | Aísla la pestaña de ventanas abiertas por otros sitios. |

`/admin` y `/api` llevan además `X-Robots-Tag: noindex, nofollow` (Google no los indexa) y `/admin` no se guarda en caché.

**Si se agrega un servicio externo** (un video de YouTube, un mapa, un script de terceros), hay que sumarlo a la directiva que corresponda de `Content-Security-Policy` en `vercel.json` (`frame-src`, `script-src`, `connect-src`…); si no, el navegador lo bloquea. Los errores aparecen en la consola del navegador como "Refused to…".

## Reseñas de Encuadrado (Inicio)

Después del Diario, el Inicio muestra las evaluaciones del perfil de Encuadrado (`src/components/Resenas.tsx`).

- **De dónde salen:** `GET /api/resenas` lee la página pública del perfil (`api/_lib/encuadrado.ts`) como máximo cada 6 horas y guarda la última copia buena (Redis en producción, `.data/` en local). Encuadrado no tiene API pública: se usan sus datos estructurados si los publica o, si no, el HTML de la sección "Evaluaciones".
- **Si Encuadrado falla o cambia su página:** se sigue mostrando la última copia buena; si nunca hubo una, la copia de respaldo `resenasRespaldo` de `src/data.ts`. El bloque nunca queda vacío por un error externo.
- **Qué se muestra:** promedio, total de evaluaciones y hasta 6 comentarios, con el nombre tal como lo muestra Encuadrado ("Usuario anónimo", "Francisca R.") y un enlace a todas las evaluaciones.
- Encuadrado muestra en su página solo las evaluaciones más recientes (5); las demás quedan en el enlace "Ver todas en Encuadrado".

## Fotos del sitio (pestaña Fotos)

- **Catálogo:** `src/lib/fotos.ts` lista cada lugar con foto (página, nombre, proporción y foto original de `src/images.ts`). Para hacer editable una foto nueva, agrega su clave en `src/lib/clavesFotos.ts`, su entrada en el catálogo y usa `<FotoSitio clave="…" />`.
- **Guardado:** sección `fotos` del contenido (`{ clave: { src, alt, posicion } }`), con historial. Las fotos se suben comprimidas a Vercel Blob en `fotos/`.
- **En el sitio:** aparecen en menos de un minuto. Una pestaña ya abierta se actualiza sola al volver a ella. El navegador recuerda las fotos elegidas, así que no se ve la original por un instante antes de la nueva.

## Mensajes de la comunidad (pestaña Comunidad)

- **Qué hace:** Mari escribe el mensaje (negrita, cursiva, tachado, listas, citas y emojis, con vista previa tipo WhatsApp), lo programa y agrega un recordatorio a su calendario (Google Calendar o archivo `.ics` para iPhone/Outlook). A la hora, el aviso trae el enlace al mensaje en el panel; **Abrir WhatsApp** abre la app con el texto listo para elegir la comunidad y enviarlo. Luego lo marca como enviado.
- **Por qué no se envía solo:** WhatsApp no ofrece una forma oficial de publicar en una comunidad existente (la API de grupos solo sirve para grupos creados por la API, de hasta 8 personas) y prohíbe los envíos automáticos desde cuentas normales: un bot podría bloquear el número de Mari. Por eso el envío lo hace siempre ella.
- **Privacidad:** los mensajes se guardan en la sección `comunidad` (con historial) y `/api/content` nunca los entrega al sitio público.
- Cuando WhatsApp active su función de mensajes programados, se puede usar **Copiar texto** y programarlo dentro de la app.
