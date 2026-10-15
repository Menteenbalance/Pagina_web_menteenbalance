// ─────────────────────────────────────────────────────────────
//  ACTIVIDADES QUE SE REPITEN
//
//  Mari crea una vez "Vinyasa · lunes y miércoles 20:00" y aquí se
//  convierte en fechas concretas para las próximas semanas. Lo usan
//  la API pública (/api/content) y el panel. No depende de React.
// ─────────────────────────────────────────────────────────────

import type { ActividadRecurrente, DiaSemana, Evento } from "../types";

/** Fecha de hoy (AAAA-MM-DD) en Santiago. */
export function hoyEnSantiago(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
}

/** Semanas hacia adelante que se muestran en el sitio. */
export const SEMANAS_VISIBLES = 4;

export const NOMBRES_DIAS: Record<DiaSemana, string> = {
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
  7: "domingo",
};

/** Suma días a una fecha AAAA-MM-DD (en UTC, sin sorpresas de horario de verano). */
export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Día de la semana de una fecha AAAA-MM-DD: 1 = lunes … 7 = domingo. */
export function diaDeLaSemana(fecha: string): DiaSemana {
  const [a, m, d] = fecha.split("-").map(Number);
  const js = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
  return (js === 0 ? 7 : js) as DiaSemana;
}

/** "Todos los lunes y miércoles" · "Todos los sábados" */
export function textoRepeticion(dias: DiaSemana[]): string {
  const orden = [...dias].sort((a, b) => a - b).map((d) => {
    const n = NOMBRES_DIAS[d];
    return n.endsWith("s") ? n : `${n}s`; // lunes, martes… ya terminan en s
  });
  if (orden.length === 7) return "Todos los días";
  const lista =
    orden.length <= 1 ? orden.join("") : `${orden.slice(0, -1).join(", ")} y ${orden[orden.length - 1]}`;
  return `Todos los ${lista}`;
}

/**
 * Fechas de una serie entre `desde` y `hasta` (incluidas), sin las
 * canceladas a menos que se pida.
 */
export function fechasDeLaSerie(
  serie: ActividadRecurrente,
  desde: string,
  hasta: string,
  { incluirCanceladas = false } = {}
): string[] {
  const inicio = serie.desde > desde ? serie.desde : desde;
  const fin = serie.hasta && serie.hasta < hasta ? serie.hasta : hasta;
  const canceladas = new Set(serie.excepciones);
  const fechas: string[] = [];
  for (let f = inicio; f <= fin; f = sumarDias(f, 1)) {
    if (!serie.dias.includes(diaDeLaSemana(f))) continue;
    if (!incluirCanceladas && canceladas.has(f)) continue;
    fechas.push(f);
  }
  return fechas;
}

/** Convierte las series en actividades normales para las próximas semanas. */
export function expandirRecurrentes(
  series: ActividadRecurrente[],
  hoy: string,
  semanas: number = SEMANAS_VISIBLES
): Evento[] {
  const hasta = sumarDias(hoy, semanas * 7 - 1);
  return series.flatMap((s) =>
    fechasDeLaSerie(s, hoy, hasta).map((fecha) => ({
      id: `${s.id}--${fecha}`,
      fecha,
      hora: s.hora,
      titulo: s.titulo,
      tipo: s.tipo,
      desc: s.desc,
      lugar: s.lugar,
      precio: s.precio,
      serie: s.id,
      repeticion: textoRepeticion(s.dias),
    }))
  );
}
