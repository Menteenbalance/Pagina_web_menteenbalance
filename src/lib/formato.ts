// Formatos de fecha, precio y URL en español de Chile.
// Centralizados aquí para que todo el sitio muestre lo mismo.

const fechaCorta = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  timeZone: "America/Santiago",
});
const diaSemana = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  timeZone: "America/Santiago",
});
const fechaLarga = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Santiago",
});
const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

/** "2026-06-28" → Date al mediodía de Santiago (evita saltos de día por zona horaria). */
function aFecha(iso: string): Date {
  return new Date(`${iso}T12:00:00-04:00`);
}

/** "2026-06-28" → { corta: "28 jun", dia: "domingo", larga: "domingo, 28 de junio de 2026" } */
export function formatearFecha(iso: string) {
  const d = aFecha(iso);
  return {
    corta: fechaCorta.format(d).replace(".", ""),
    dia: diaSemana.format(d),
    larga: fechaLarga.format(d),
  };
}

/** 37000 → "$37.000" · 0 → "Gratuita" */
export function formatearPrecio(valor: number): string {
  return valor === 0 ? "Gratuita" : clp.format(valor);
}

/** "Ansiedad: cuando la mente se adelanta" → "ansiedad-cuando-la-mente-se-adelanta" */
export function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
