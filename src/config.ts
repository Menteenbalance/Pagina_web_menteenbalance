// ─────────────────────────────────────────────────────────────
//  DATOS GENERALES DEL SITIO (lado del navegador)
//  La dirección se calcula al compilar (ver api/_lib/config.ts):
//  no hay que escribir el dominio a mano en ninguna parte.
// ─────────────────────────────────────────────────────────────

/** Dirección pública del sitio, sin "/" final. */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const SITIO = {
  nombre: "Mente en Balance",
  descripcion:
    "Psicología, yoga y mindfulness en Santiago con María Ignacia Canessa, psicóloga clínica y profesora de yoga. Un espacio para volver a ti.",
  /** Imagen de vista previa al compartir (1200×630) */
  imagen: `${SITE_URL}/og/portada.jpg`,
};

/** Dirección absoluta de una ruta del sitio. Ej: url("/agenda") */
export function url(ruta = "/"): string {
  return `${SITE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}
