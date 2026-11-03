// ─────────────────────────────────────────────────────────────
//  FOTOS EDITABLES
//  Catálogo de cada lugar con foto del sitio: dónde aparece, su foto
//  original y su proporción. Mari las cambia desde el panel (pestaña
//  Fotos); lo que sube reemplaza a la original en todo el sitio.
// ─────────────────────────────────────────────────────────────

import { img, type Imagen } from "../images";
import type { FotoEditada } from "../types";
import type { ClaveFoto } from "./clavesFotos";

export type { ClaveFoto } from "./clavesFotos";

export interface LugarFoto {
  clave: ClaveFoto;
  /** Página o bloque donde aparece */
  grupo: string;
  /** Nombre corto para Mari */
  nombre: string;
  /** Dónde se ve exactamente */
  descripcion: string;
  /** Proporción con que se muestra (ancho / alto) */
  proporcion: number;
  /** Foto original del sitio */
  original: Imagen;
  /** Punto de enfoque original (CSS object-position) */
  enfoque?: string;
  /** Decorativa: no la leen los lectores de pantalla (el texto es opcional) */
  decorativa?: boolean;
}

export const LUGARES_FOTOS: LugarFoto[] = [
  {
    clave: "inicio-portada",
    grupo: "Inicio",
    nombre: "Foto principal",
    descripcion: "La foto grande junto al título, lo primero que se ve al entrar.",
    proporcion: 4 / 5,
    original: img.yogaPose,
    enfoque: "50% 35%",
  },
  {
    clave: "inicio-sobre",
    grupo: "Inicio",
    nombre: "Foto de \"Sobre Mente en Balance\"",
    descripcion: "La foto cuadrada junto al texto de presentación.",
    proporcion: 1,
    original: img.meditacionGrupo,
  },
  {
    clave: "sobre-retrato",
    grupo: "Detrás de Mente en Balance",
    nombre: "Retrato de Mari",
    descripcion: "El retrato junto a \"Detrás de Mente en Balance\".",
    proporcion: 714 / 984,
    original: img.mariaIgnacia,
  },
  {
    clave: "sobre-yoga",
    grupo: "Detrás de Mente en Balance",
    nombre: "Foto de yoga",
    descripcion: "La foto de la sección sobre el yoga.",
    proporcion: 4 / 5,
    original: img.claseGuiada,
  },
  {
    clave: "instagram-1",
    grupo: "Módulo de Instagram (Inicio)",
    nombre: "Mosaico · foto alta",
    descripcion: "La foto vertical grande del mosaico.",
    proporcion: 3 / 4,
    original: img.yogaParque,
    enfoque: "50% 30%",
    decorativa: true,
  },
  {
    clave: "instagram-2",
    grupo: "Módulo de Instagram (Inicio)",
    nombre: "Mosaico · foto ancha",
    descripcion: "La foto horizontal del mosaico.",
    proporcion: 3 / 2,
    original: img.retiroGrupo,
    decorativa: true,
  },
  {
    clave: "instagram-3",
    grupo: "Módulo de Instagram (Inicio)",
    nombre: "Mosaico · foto pequeña",
    descripcion: "La tercera foto del mosaico.",
    proporcion: 3 / 4,
    original: img.claseGrupo,
    decorativa: true,
  },
  ...[img.consulta, img.retiro1, img.yogaRestaurativa, img.yogaParque, img.claseGrupo, img.balasana].map(
    (original, i): LugarFoto => ({
      clave: `diario-${i + 1}` as ClaveFoto,
      grupo: "Fotos de ambiente del Diario",
      nombre: `Foto de ambiente ${i + 1}`,
      descripcion: "Se usa en las publicaciones del Diario que no tienen foto propia.",
      proporcion: 4 / 3,
      original,
      decorativa: true,
    })
  ),
  {
    clave: "error-404",
    grupo: "Página no encontrada",
    nombre: "Foto de la página 404",
    descripcion: "Aparece cuando alguien entra a una dirección que no existe.",
    proporcion: 4 / 5.4,
    original: img.balasana,
    enfoque: "50% 62%",
    decorativa: true,
  },
];

export const LUGAR_POR_CLAVE = Object.fromEntries(LUGARES_FOTOS.map((l) => [l.clave, l])) as Record<
  ClaveFoto,
  LugarFoto
>;

export interface FotoVisible extends Imagen {
  /** CSS object-position, si Mari eligió un punto de enfoque */
  posicion?: string;
}

/** Foto que corresponde mostrar: la que subió Mari o la original. */
export function fotoDe(fotos: Partial<Record<ClaveFoto, FotoEditada>> | undefined, clave: ClaveFoto): FotoVisible {
  const editada = fotos?.[clave];
  const lugar = LUGAR_POR_CLAVE[clave];
  if (editada) return { src: editada.src, alt: editada.alt, posicion: editada.posicion };
  return { ...lugar.original, posicion: undefined };
}
