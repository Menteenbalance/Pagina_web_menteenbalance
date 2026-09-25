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
  logo.png              Logo del sitio
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

## Formulario de contacto

El formulario de `/contacto` envía un correo a través de una función de Vercel (`api/contact.ts`) usando [Resend](https://resend.com).

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
| **Agenda** | Crear, editar y eliminar actividades, con su tipo (Yoga / Meditación / Talleres, los mismos filtros del sitio). Las pasadas se ocultan solas. |
| **Diario** | Publicaciones tipo blog: título, categoría, bajada, foto, texto con formato simple, borrador o publicado. Cada una tiene su página `/diario/<titulo>`. |
| **Instagram** | Mostrar u ocultar el módulo "Síguenos en Instagram" del Inicio y editar su frase. |

Los cambios se ven en el sitio en menos de un minuto.

**Cómo funciona**

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
