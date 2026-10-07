import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

/**
 * Estadísticas de visitas con Vercel Web Analytics.
 *
 * - No usa cookies ni guarda datos personales, así que no requiere banner.
 * - No cuenta el panel de administración (/admin), para que las visitas de
 *   Mari no inflen los números.
 * - Quita de la dirección los parámetros que no sirven para medir (deja solo
 *   los utm_* de campañas) para no registrar datos por accidente.
 * - En desarrollo no envía nada; los datos se ven en Vercel → Analytics.
 */
const PARAMETROS_UTILES = /^utm_/i;

export function antesDeEnviar(evento: BeforeSendEvent): BeforeSendEvent | null {
  let url: URL;
  try {
    url = new URL(evento.url);
  } catch {
    return evento;
  }
  if (/^\/admin(\/|$)/i.test(url.pathname)) return null;

  for (const clave of [...url.searchParams.keys()]) {
    if (!PARAMETROS_UTILES.test(clave)) url.searchParams.delete(clave);
  }
  url.hash = "";
  return { ...evento, url: url.toString() };
}

export default function Estadisticas() {
  return (
    <Analytics
      mode={import.meta.env.PROD ? "production" : "development"}
      debug={false}
      beforeSend={antesDeEnviar}
    />
  );
}
