// Fecha y hora "de Santiago" como texto comparable (AAAA-MM-DDTHH:mm),
// para programar publicaciones sin depender de la zona del servidor
// ni del navegador. Lo usan la API y el panel.

import type { Post } from "../types";

/** Ahora en Santiago, ej: "2026-10-26T08:00". */
export function ahoraEnSantiago(fecha: Date = new Date()): string {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value])
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}

export type EstadoPost = "borrador" | "programado" | "publicado";

/** Borrador, programado (publicado pero con hora futura) o publicado. */
export function estadoPost(p: Pick<Post, "publicado" | "publicarEl">, ahora: string = ahoraEnSantiago()): EstadoPost {
  if (!p.publicado) return "borrador";
  return p.publicarEl && p.publicarEl > ahora ? "programado" : "publicado";
}

/** true si la publicación ya se ve en el sitio. */
export function seVeEnElSitio(p: Pick<Post, "publicado" | "publicarEl">, ahora?: string): boolean {
  return estadoPost(p, ahora) === "publicado";
}
