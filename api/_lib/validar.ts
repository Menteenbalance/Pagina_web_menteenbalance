// ─────────────────────────────────────────────────────────────
//  VALIDACIÓN DEL CONTENIDO QUE ENVÍA EL PANEL
//  El servidor nunca confía en lo que llega del navegador: cada
//  sección se revisa y se limpia antes de guardarse.
// ─────────────────────────────────────────────────────────────

import type {
  ActividadRecurrente,
  Ajustes,
  DiaSemana,
  Evento,
  FotoEditada,
  MensajeComunidad,
  GrupoTarifas,
  Post,
  Servicio,
  TipoEvento,
} from "../../src/types.js";
import { ErrorHttp } from "./http.js";
import { esClaveFoto } from "../../src/lib/clavesFotos.js";

export const SECCIONES = ["servicios", "aranceles", "agenda", "recurrentes", "posts", "ajustes", "fotos", "comunidad"] as const;
export type Seccion = (typeof SECCIONES)[number];

const TIPOS: TipoEvento[] = ["Yoga", "Meditación", "Talleres"];
const COLORES = ["var(--plum)", "var(--teal)", "var(--amber)", "var(--lime)"];

function falla(msg: string): never {
  throw new ErrorHttp(422, msg);
}

function lista(v: unknown, max: number, nombre: string): unknown[] {
  if (!Array.isArray(v)) falla(`${nombre}: formato inválido.`);
  if (v.length > max) falla(`${nombre}: máximo ${max} elementos.`);
  return v;
}

function obj(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) falla("Formato inválido.");
  return v as Record<string, unknown>;
}

function txt(
  v: unknown,
  campo: string,
  { max = 200, min = 0 }: { max?: number; min?: number } = {}
): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (s.length < min) falla(min === 1 ? `Falta completar: ${campo}.` : `${campo}: muy corto.`);
  if (s.length > max) falla(`${campo}: máximo ${max} caracteres.`);
  return s;
}

function precio(v: unknown, campo: string): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 10_000_000) falla(`${campo}: precio inválido.`);
  return n;
}

function id(v: unknown): string {
  const s = typeof v === "string" ? v : "";
  return /^[a-z0-9-]{1,64}$/i.test(s) ? s : crypto.randomUUID();
}

function urlImagen(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  if (/^https:\/\/[^\s"'<>]+$/.test(s) || /^\/(img|uploads)\/[\w./-]+$/.test(s)) return s;
  falla("La imagen tiene una dirección inválida.");
}

function slugValido(v: unknown, respaldo: string): string {
  const s = typeof v === "string" ? v : "";
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 90) return s;
  return (
    respaldo
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 90) || crypto.randomUUID().slice(0, 8)
  );
}

function fechaIso(v: unknown, campo: string): string {
  const s = typeof v === "string" ? v : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) {
    falla(`${campo}: fecha inválida.`);
  }
  return s;
}

/** "2026-10-26T08:00" o vacío → undefined */
function fechaHora(v: unknown): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) {
    falla("Fecha y hora de publicación inválidas.");
  }
  return s;
}

const validadores: Record<Seccion, (datos: unknown) => unknown> = {
  servicios: (datos): Servicio[] =>
    lista(datos, 20, "Servicios").map((x) => {
      const s = obj(x);
      const titulo = txt(s.title, "Nombre del servicio", { min: 1, max: 60 });
      return {
        id: id(s.id),
        title: titulo,
        dot: COLORES.includes(String(s.dot)) ? String(s.dot) : COLORES[0],
        meta: txt(s.meta, "Etiqueta", { max: 40 }),
        body: txt(s.body, "Descripción breve", { min: 1, max: 200 }),
        largo: txt(s.largo, "Descripción extendida", { min: 1, max: 900 }),
      };
    }),

  aranceles: (datos): GrupoTarifas[] =>
    lista(datos, 8, "Aranceles").map((x) => {
      const g = obj(x);
      return {
        categoria: txt(g.categoria, "Nombre del grupo", { min: 1, max: 60 }),
        items: lista(g.items, 30, "Valores").map((y) => {
          const t = obj(y);
          return {
            nombre: txt(t.nombre, "Nombre del valor", { min: 1, max: 90 }),
            modalidad: txt(t.modalidad, "Modalidad", { max: 40 }) || undefined,
            duracion: txt(t.duracion, "Duración", { max: 40 }) || undefined,
            precio: precio(t.precio, "Precio"),
          };
        }),
      };
    }),

  agenda: (datos): Evento[] =>
    lista(datos, 200, "Agenda").map((x) => {
      const e = obj(x);
      const tipo = String(e.tipo) as TipoEvento;
      if (!TIPOS.includes(tipo)) falla("Tipo de actividad inválido.");
      return {
        id: id(e.id),
        titulo: txt(e.titulo, "Título de la actividad", { min: 1, max: 80 }),
        tipo,
        fecha: fechaIso(e.fecha, "Fecha"),
        hora: txt(e.hora, "Hora", { min: 1, max: 20 }),
        desc: txt(e.desc, "Descripción", { min: 1, max: 280 }),
        lugar: txt(e.lugar, "Lugar", { min: 1, max: 140 }),
        precio: precio(e.precio, "Valor"),
      };
    }),

  recurrentes: (datos): ActividadRecurrente[] =>
    lista(datos, 30, "Actividades que se repiten").map((x) => {
      const r = obj(x);
      const tipo = String(r.tipo) as TipoEvento;
      if (!TIPOS.includes(tipo)) falla("Tipo de actividad inválido.");
      const dias = [...new Set(lista(r.dias, 7, "Días").map(Number))]
        .filter((d): d is DiaSemana => Number.isInteger(d) && d >= 1 && d <= 7)
        .sort((a, b) => a - b);
      if (dias.length === 0) falla("Elige al menos un día de la semana.");
      const desde = fechaIso(r.desde, "Desde");
      const hasta = r.hasta ? fechaIso(r.hasta, "Hasta") : undefined;
      if (hasta && hasta < desde) falla("La fecha de término es anterior a la de inicio.");
      const excepciones = [
        ...new Set(lista(r.excepciones ?? [], 400, "Fechas canceladas").map((f) => fechaIso(f, "Fecha cancelada"))),
      ].sort();
      return {
        id: id(r.id),
        titulo: txt(r.titulo, "Título de la actividad", { min: 1, max: 80 }),
        tipo,
        dias,
        hora: txt(r.hora, "Hora", { min: 1, max: 20 }),
        desde,
        hasta,
        desc: txt(r.desc, "Descripción", { min: 1, max: 280 }),
        lugar: txt(r.lugar, "Lugar", { min: 1, max: 140 }),
        precio: precio(r.precio, "Valor"),
        excepciones,
      };
    }),

  posts: (datos): Post[] => {
    const posts = lista(datos, 300, "Diario").map((x) => {
      const p = obj(x);
      const titulo = txt(p.titulo, "Título", { min: 1, max: 120 });
      const imagen = urlImagen(p.imagen) || undefined;
      return {
        id: id(p.id),
        slug: slugValido(p.slug, titulo),
        titulo,
        cat: txt(p.cat, "Categoría", { min: 1, max: 30 }),
        bajada: txt(p.bajada, "Bajada", { min: 1, max: 280 }),
        cuerpo: txt(p.cuerpo, "Texto de la publicación", { max: 40_000 }),
        imagen,
        // La descripción solo tiene sentido si hay foto; vacía = no se guarda
        imagenAlt: (imagen && txt(p.imagenAlt, "Descripción de la foto", { max: 200 })) || undefined,
        fecha: fechaIso(p.fecha, "Fecha de publicación"),
        publicado: p.publicado === true,
        publicarEl: fechaHora(p.publicarEl),
      };
    });
    const slugs = new Set<string>();
    for (const p of posts) {
      if (slugs.has(p.slug)) falla(`Hay dos publicaciones con la misma dirección (${p.slug}). Cambia el título de una.`);
      slugs.add(p.slug);
    }
    return posts;
  },

  comunidad: (datos): MensajeComunidad[] =>
    lista(datos, 200, "Mensajes de la comunidad").map((x) => {
      const m = obj(x);
      const enviado = typeof m.enviadoEl === "string" && !Number.isNaN(Date.parse(m.enviadoEl)) ? m.enviadoEl : undefined;
      return {
        id: id(m.id),
        titulo: txt(m.titulo, "Nombre del mensaje", { max: 80 }),
        texto: txt(m.texto, "Texto del mensaje", { min: 1, max: 4000 }),
        programadoEl: fechaHora(m.programadoEl),
        enviadoEl: enviado,
      };
    }),

  fotos: (datos): Record<string, FotoEditada> => {
    const f = obj(datos);
    const limpio: Record<string, FotoEditada> = {};
    for (const [clave, valor] of Object.entries(f)) {
      if (!esClaveFoto(clave)) continue; // lugares que ya no existen se ignoran
      const v = obj(valor);
      const src = urlImagen(v.src);
      if (!src) falla("Falta la foto.");
      const posicion = typeof v.posicion === "string" ? v.posicion.trim() : "";
      if (posicion && !/^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(posicion)) falla("Punto de enfoque inválido.");
      limpio[clave] = {
        src,
        alt: txt(v.alt, "Descripción de la foto", { max: 200 }),
        ...(posicion && { posicion }),
      };
    }
    return limpio;
  },

  ajustes: (datos): Ajustes => {
    const a = obj(datos);
    const ig = obj(a.instagram ?? {});
    return {
      instagram: {
        visible: ig.visible !== false,
        texto: txt(ig.texto, "Frase del módulo de Instagram", { max: 160 }),
      },
    };
  },
};

export function esSeccion(v: unknown): v is Seccion {
  return SECCIONES.includes(v as Seccion);
}

export function validar(seccion: Seccion, datos: unknown): unknown {
  return validadores[seccion](datos);
}
