// Compara dos contenidos sin importar el orden de las propiedades de cada
// objeto (el orden de las listas sí importa). Lo usan la API y el panel.

function canonico(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonico);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>)
        .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
        .sort()
        .map((k) => [k, canonico((v as Record<string, unknown>)[k])])
    );
  }
  return v;
}

/** Texto estable de un contenido, para comparar versiones. */
export function huella(v: unknown): string {
  return JSON.stringify(canonico(v));
}

export function mismoContenido(a: unknown, b: unknown): boolean {
  return huella(a) === huella(b);
}
