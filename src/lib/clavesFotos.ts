// Lugares del sitio cuya foto se puede cambiar desde el panel (pestaña Fotos).
// Archivo sin dependencias: lo usan la API (validación) y el sitio.

export const CLAVES_FOTOS = [
  "inicio-portada",
  "inicio-sobre",
  "sobre-retrato",
  "sobre-yoga",
  "instagram-1",
  "instagram-2",
  "instagram-3",
  "diario-1",
  "diario-2",
  "diario-3",
  "diario-4",
  "diario-5",
  "diario-6",
  "error-404",
] as const;

export type ClaveFoto = (typeof CLAVES_FOTOS)[number];

export function esClaveFoto(v: unknown): v is ClaveFoto {
  return CLAVES_FOTOS.includes(v as ClaveFoto);
}
