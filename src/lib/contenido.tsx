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
import { hoyEnSantiago } from "./recurrentes";
import { fotoDe, type ClaveFoto, type FotoVisible } from "./fotos";
import { textoDe, type ClaveTexto } from "./textos";
import { urlContenido } from "./frescura";
import { seVeEnElSitio } from "./tiempo";

interface Estado extends Contenido {
  /** true cuando ya llegó el contenido del servidor */
  listo: boolean;
  /** true si ya se sabe qué fotos mostrar (llegó el contenido, hay copia guardada o se esperó demasiado) */
  fotosListas: boolean;
}

// Las fotos cambiadas desde el panel se recuerdan en el navegador: así, en
// la siguiente visita se muestra de inmediato la foto correcta y no la
// original por un instante.
const CLAVE_FOTOS = "meb:fotos";
/** Si la API tarda más que esto, se muestran las fotos originales. */
const ESPERA_FOTOS_MS = 1500;
/** Al volver a la pestaña, se revisan cambios como máximo cada 20 s. */
const REVISAR_CADA_MS = 20_000;

function fotosGuardadas(): Contenido["fotos"] | null {
  try {
    const t = localStorage.getItem(CLAVE_FOTOS);
    return t ? (JSON.parse(t) as Contenido["fotos"]) : null;
  } catch {
    return null;
  }
}

const guardadas = typeof window !== "undefined" ? fotosGuardadas() : null;

const inicial: Estado = {
  ...contenidoInicial,
  posts: contenidoInicial.posts.filter((p) => seVeEnElSitio(p)),
  fotos: guardadas ?? contenidoInicial.fotos,
  listo: false,
  fotosListas: guardadas !== null,
};

const Ctx = createContext<Estado>(inicial);

export function ContenidoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(inicial);

  useEffect(() => {
    let vivo = true;
    let ultima = 0;

    const cargar = () => {
      ultima = Date.now();
      fetch(urlContenido())
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((c: Contenido) => {
          if (!vivo) return;
          const fotos = c.fotos ?? {};
          setEstado({ ...c, fotos, listo: true, fotosListas: true });
          try {
            localStorage.setItem(CLAVE_FOTOS, JSON.stringify(fotos));
          } catch {
            /* navegador sin almacenamiento: no pasa nada */
          }
        })
        .catch(() => {
          // Sin conexión con la API: se queda con el contenido que tenía
          if (vivo) setEstado((e) => ({ ...e, listo: true, fotosListas: true }));
        });
    };
    cargar();

    // Si la API tarda, no se deja la página sin fotos
    const espera = window.setTimeout(() => {
      if (vivo) setEstado((e) => (e.fotosListas ? e : { ...e, fotosListas: true }));
    }, ESPERA_FOTOS_MS);

    // Al volver a la pestaña se traen los cambios recientes del panel
    // (fotos nuevas, actividades, publicaciones) sin recargar la página.
    const alVolver = () => {
      if (document.visibilityState === "visible" && Date.now() - ultima > REVISAR_CADA_MS) cargar();
    };
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("focus", alVolver);

    return () => {
      vivo = false;
      window.clearTimeout(espera);
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("focus", alVolver);
    };
  }, []);

  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>;
}

export function useContenido(): Estado {
  return useContext(Ctx);
}

/**
 * Foto de un lugar del sitio (la que subió Mari o la original).
 * Mientras no se sabe cuál corresponde, `src` queda vacío para no
 * mostrar la original por un instante y luego cambiarla.
 */
export function useFoto(clave: ClaveFoto): FotoVisible & { cargando: boolean } {
  const { fotos, fotosListas } = useContext(Ctx);
  const foto = fotoDe(fotos, clave);
  return fotosListas ? { ...foto, cargando: false } : { ...foto, src: "", cargando: true };
}

/** Fecha de hoy (AAAA-MM-DD) en Santiago, para separar próximas y pasadas. */
export { hoyEnSantiago };

/** Actividades desde hoy en adelante, ordenadas por fecha. */
export function proximasActividades<T extends { fecha: string }>(agenda: T[]): T[] {
  const hoy = hoyEnSantiago();
  return agenda.filter((e) => e.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Publicaciones de la más nueva a la más antigua. */
export function postsRecientes<T extends { fecha: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Texto de un lugar del sitio (el que editó Mari o el original). */
export function useTexto(clave: ClaveTexto): string {
  return textoDe(useContext(Ctx).textos, clave);
}
