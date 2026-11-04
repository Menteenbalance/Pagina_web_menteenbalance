// Que Mari vea al tiro lo que acaba de guardar en el panel.
//
// /api/content se guarda unos segundos en la caché de Vercel. Al guardar
// en el panel se anota la hora en este navegador; durante los minutos
// siguientes, el sitio (en ese mismo navegador) pide el contenido con
// ?v=<hora>, que la caché no tiene, y recibe la versión recién guardada.
// El resto de los visitantes la ve en menos de un minuto.

const CLAVE = "meb:ultimo-cambio";
const VIGENCIA_MS = 10 * 60 * 1000;

/** Llamar después de guardar o restaurar algo en el panel. */
export function marcarCambio(): void {
  try {
    localStorage.setItem(CLAVE, String(Date.now()));
  } catch {
    /* sin almacenamiento: se usa la caché normal */
  }
}

/** Dirección del contenido público, saltando la caché si hubo un cambio reciente aquí. */
export function urlContenido(): string {
  try {
    const t = Number(localStorage.getItem(CLAVE));
    if (t && Date.now() - t < VIGENCIA_MS) return `/api/content?v=${t}`;
  } catch {
    /* sin almacenamiento */
  }
  return "/api/content";
}
