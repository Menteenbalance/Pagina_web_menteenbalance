// Compara una versión del historial con el contenido actual y explica,
// en palabras, qué cambiaría al restaurarla.

import { formatearFecha } from "../lib/formato";
import type { Seccion } from "./api";
import { huella } from "../lib/comparar";
import { LUGAR_POR_CLAVE, type ClaveFoto } from "../lib/fotos";

type Elemento = Record<string, unknown>;

/** Nombre legible de un elemento según la sección. */
function nombre(seccion: Seccion, e: Elemento): string {
  switch (seccion) {
    case "servicios":
      return String(e.title ?? "Servicio");
    case "aranceles":
      return String(e.categoria ?? "Grupo de aranceles");
    case "agenda":
      return `${e.titulo ?? "Actividad"} (${typeof e.fecha === "string" ? formatearFecha(e.fecha).corta : "sin fecha"})`;
    case "comunidad":
      return String(e.titulo || String(e.texto ?? "").slice(0, 40) || "Mensaje");
    default:
      return String(e.titulo ?? "Elemento");
  }
}

/** Clave para reconocer el mismo elemento en dos versiones. */
function clave(seccion: Seccion, e: Elemento): string {
  if (typeof e.id === "string") return e.id;
  if (seccion === "aranceles") return String(e.categoria);
  return huella(e);
}

export interface Diferencias {
  /** Elementos que vuelven al restaurar */
  vuelven: string[];
  /** Elementos que desaparecen al restaurar */
  salen: string[];
  /** Elementos que cambian de contenido */
  cambian: string[];
  /** true si la versión es idéntica a la actual */
  igual: boolean;
}

export function compararVersiones(seccion: Seccion, version: unknown, actual: unknown): Diferencias {
  const igual = huella(version) === huella(actual);
  if (seccion === "fotos") {
    // Objeto { lugar: foto }: "vuelve" = foto propia que se recupera; "sale" = vuelve la original
    const antes = (version ?? {}) as Record<string, unknown>;
    const ahora = (actual ?? {}) as Record<string, unknown>;
    const n = (k: string) => LUGAR_POR_CLAVE[k as ClaveFoto]?.nombre ?? k;
    const vuelven: string[] = [];
    const salen: string[] = [];
    const cambian: string[] = [];
    for (const k of new Set([...Object.keys(antes), ...Object.keys(ahora)])) {
      if (huella(antes[k]) === huella(ahora[k])) continue;
      if (!ahora[k]) vuelven.push(n(k));
      else if (!antes[k]) salen.push(`${n(k)} (vuelve la original)`);
      else cambian.push(n(k));
    }
    return { vuelven, salen, cambian, igual };
  }
  if (!Array.isArray(version) || !Array.isArray(actual)) {
    return { vuelven: [], salen: [], cambian: igual ? [] : ["Ajustes de la sección"], igual };
  }
  const antes = new Map(version.map((e: Elemento) => [clave(seccion, e), e]));
  const ahora = new Map(actual.map((e: Elemento) => [clave(seccion, e), e]));
  const vuelven: string[] = [];
  const salen: string[] = [];
  const cambian: string[] = [];
  for (const [k, e] of antes) {
    const hoy = ahora.get(k);
    if (!hoy) vuelven.push(nombre(seccion, e));
    else if (huella(hoy) !== huella(e)) cambian.push(nombre(seccion, e));
  }
  for (const [k, e] of ahora) if (!antes.has(k)) salen.push(nombre(seccion, e));
  // Mismo contenido pero en otro orden
  if (!igual && !vuelven.length && !salen.length && !cambian.length) cambian.push("El orden de los elementos");
  return { vuelven, salen, cambian, igual };
}

/** "3 actividades" · "1 publicación" */
export function cantidad(seccion: Seccion, datos: unknown): string {
  if (seccion === "fotos") {
    const n = Object.keys((datos ?? {}) as object).length;
    return n === 0 ? "todas las fotos originales" : `${n} ${n === 1 ? "foto cambiada" : "fotos cambiadas"}`;
  }
  if (!Array.isArray(datos)) return "Ajustes";
  const n = datos.length;
  const [uno, varios] = {
    servicios: ["servicio", "servicios"],
    aranceles: ["grupo de aranceles", "grupos de aranceles"],
    agenda: ["actividad", "actividades"],
    recurrentes: ["clase que se repite", "clases que se repiten"],
    posts: ["publicación", "publicaciones"],
    ajustes: ["ajuste", "ajustes"],
    fotos: ["foto", "fotos"],
    comunidad: ["mensaje", "mensajes"],
  }[seccion];
  return `${n} ${n === 1 ? uno : varios}`;
}
