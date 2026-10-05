// ─────────────────────────────────────────────────────────────
//  DIRECCIÓN DEL SITIO (un solo lugar para todo lo que depende del dominio)
//
//  Orden de prioridad:
//   1. VITE_SITE_URL (o SITE_URL): se define a mano en Vercel si se quiere
//      forzar una dirección.
//   2. VERCEL_PROJECT_PRODUCTION_URL: Vercel la entrega sola en cada build;
//      es el dominio propio más corto del proyecto o, si no hay, el
//      .vercel.app. Al conectar el dominio nuevo se actualiza sola.
//   3. En desarrollo local: http://localhost:5175
// ─────────────────────────────────────────────────────────────

type Entorno = Record<string, string | undefined>;

export function resolverUrlDelSitio(env: Entorno): string {
  const crudo = (
    env.VITE_SITE_URL ||
    env.SITE_URL ||
    env.VITE_VERCEL_PROJECT_PRODUCTION_URL ||
    env.VERCEL_PROJECT_PRODUCTION_URL ||
    ""
  ).trim();
  if (!crudo) return "http://localhost:5175";
  const conProtocolo = /^https?:\/\//i.test(crudo) ? crudo : `https://${crudo}`;
  return conProtocolo.replace(/\/+$/, "");
}

/** Dirección pública del sitio, sin "/" final. Ej: https://menteenbalance.cl */
export const SITE_URL = resolverUrlDelSitio(process.env);
