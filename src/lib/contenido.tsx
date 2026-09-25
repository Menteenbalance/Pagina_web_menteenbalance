// ─────────────────────────────────────────────────────────────
//  CONTENIDO DEL SITIO (servicios, aranceles, agenda, diario, ajustes)
//
//  La página se muestra de inmediato con el contenido inicial
//  (src/data.ts) y, apenas llega, lo reemplaza por lo que Mari
//  editó en el panel (/api/content).
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { contenidoInicial } from "../data";
import type { Contenido } from "../types";

interface Estado extends Contenido {
  /** true cuando ya llegó el contenido del servidor */
  listo: boolean;
}

const inicial: Estado = {
  ...contenidoInicial,
  posts: contenidoInicial.posts.filter((p) => p.publicado),
  listo: false,
};

const Ctx = createContext<Estado>(inicial);

export function ContenidoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(inicial);

  useEffect(() => {
    let vivo = true;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((c: Contenido) => {
        if (vivo) setEstado({ ...c, listo: true });
      })
      .catch(() => {
        // Sin conexión con la API: se queda con el contenido inicial
        if (vivo) setEstado((e) => ({ ...e, listo: true }));
      });
    return () => {
      vivo = false;
    };
  }, []);

  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>;
}

export function useContenido(): Estado {
  return useContext(Ctx);
}

/** Fecha de hoy (AAAA-MM-DD) en Santiago, para separar próximas y pasadas. */
export function hoyEnSantiago(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
  }).format(new Date());
}

/** Actividades desde hoy en adelante, ordenadas por fecha. */
export function proximasActividades<T extends { fecha: string }>(agenda: T[]): T[] {
  const hoy = hoyEnSantiago();
  return agenda.filter((e) => e.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Publicaciones de la más nueva a la más antigua. */
export function postsRecientes<T extends { fecha: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.fecha.localeCompare(a.fecha));
}
