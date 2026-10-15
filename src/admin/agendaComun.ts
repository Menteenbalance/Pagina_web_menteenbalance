// Piezas compartidas por los editores de la Agenda (fechas únicas y clases que se repiten).

import type { TipoEvento } from "../types";

export const TIPOS: TipoEvento[] = ["Yoga", "Meditación", "Talleres"];

/** "11 hrs." / "19:30 hrs." → "11:00" / "19:30" para el campo de hora */
export function aHoraInput(hora: string): string {
  const m = hora.match(/(\d{1,2})(?::(\d{2}))?/);
  return m ? `${m[1].padStart(2, "0")}:${m[2] ?? "00"}` : "";
}

/** "09:00" → "09 hrs." · "19:30" → "19:30 hrs." (mismo estilo del sitio) */
export function aHoraTexto(valor: string): string {
  const [h, m] = valor.split(":");
  return m === "00" ? `${h} hrs.` : `${h}:${m} hrs.`;
}
