// ─────────────────────────────────────────────────────────────
//  GUARDAR CON HISTORIAL
//  Antes de reemplazar una sección, la versión que había se copia
//  al historial (últimas 15). Así un borrado por error se recupera
//  desde el panel. Restaurar también pasa por aquí, de modo que
//  restaurar se puede deshacer.
// ─────────────────────────────────────────────────────────────

import { contenidoInicial } from "../../src/data.js";
import type { VersionHistorial } from "../../src/types.js";
import { agregarAlHistorial, guardar, leer, leerHistorial } from "./store.js";
import type { Seccion } from "./validar.js";
import { mismoContenido } from "../../src/lib/comparar.js";

export async function guardarConHistorial(seccion: Seccion, datos: unknown, autor: string): Promise<void> {
  const guardado = await leer<unknown>(seccion);
  // Si la sección nunca se había editado, lo anterior es el contenido original del sitio
  const anterior = guardado ?? contenidoInicial[seccion];
  if (!mismoContenido(anterior, datos)) {
    const entrada: VersionHistorial = {
      fecha: new Date().toISOString(),
      autor,
      ...(guardado === null && { original: true }),
      datos: anterior,
    };
    await agregarAlHistorial(seccion, entrada);
  }
  await guardar(seccion, datos);
}

export function historialDe(seccion: Seccion): Promise<VersionHistorial[]> {
  return leerHistorial<VersionHistorial>(seccion);
}
