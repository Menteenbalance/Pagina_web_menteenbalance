// Tipos compartidos para el contenido del sitio.
// Al tener el contenido tipado, el editor te avisa si falta un campo.

export interface NavItem {
  /** Texto que se ve en el menú */
  label: string;
  /** Ruta interna, ej: "/servicios" */
  path: string;
}

export interface Servicio {
  /** Identificador interno (no se muestra) */
  id: string;
  title: string;
  /** Color del punto/indicador. Usa las variables de marca. */
  dot: string;
  /** Etiqueta corta, ej: "50 minutos" */
  meta: string;
  /** Descripción breve (tarjeta en Inicio) */
  body: string;
  /** Descripción extendida (página Servicios) */
  largo: string;
}

/** Categoría de un evento de la agenda. Sirve para los filtros. */
export type TipoEvento = "Yoga" | "Meditación" | "Talleres";

export interface Evento {
  /** Identificador interno (no se muestra) */
  id: string;
  /** Fecha en formato AAAA-MM-DD, ej: "2026-06-28" */
  fecha: string;
  hora: string;
  titulo: string;
  tipo: TipoEvento;
  desc: string;
  lugar: string;
  /** Precio en pesos chilenos, sin puntos. 0 = actividad gratuita */
  precio: number;
}

export interface Post {
  /** Identificador interno (no se muestra) */
  id: string;
  /** Parte final de la dirección: /diario/<slug> */
  slug: string;
  cat: string;
  titulo: string;
  /** Resumen que aparece en las tarjetas */
  bajada: string;
  /** Texto completo, con formato simple (ver src/lib/texto.tsx). Vacío = solo tarjeta */
  cuerpo: string;
  /** Imagen principal (URL o ruta /img/...) */
  imagen?: string;
  /** Fecha de publicación AAAA-MM-DD */
  fecha: string;
  /** false = borrador, no aparece en el sitio */
  publicado: boolean;
}

export interface Principio {
  titulo: string;
  desc: string;
}

/** Una tarifa individual dentro de un grupo de aranceles. */
export interface Tarifa {
  /** Nombre de la cita/plan, ej: "Sesión online" */
  nombre: string;
  /** Modalidad opcional, ej: "Online" o "Presencial" */
  modalidad?: string;
  /** Duración opcional, ej: "50 min" */
  duracion?: string;
  /** Precio en pesos chilenos, sin puntos, ej: 37000 */
  precio: number;
}

/** Grupo de tarifas mostrado como una columna (ej: Psicoterapia, Yoga). */
export interface GrupoTarifas {
  categoria: string;
  items: Tarifa[];
}

/** Ajustes generales editables desde el panel. */
export interface Ajustes {
  instagram: {
    /** Mostrar u ocultar el módulo de Instagram en el Inicio */
    visible: boolean;
    /** Frase bajo el título del módulo */
    texto: string;
  };
}

/** Todo el contenido que se puede editar desde el panel /admin. */
export interface Contenido {
  servicios: Servicio[];
  aranceles: GrupoTarifas[];
  agenda: Evento[];
  posts: Post[];
  ajustes: Ajustes;
}
