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
  /** Solo en fechas generadas por una actividad que se repite: id de la serie */
  serie?: string;
  /** Solo en fechas generadas: texto como "Todos los lunes y miércoles" */
  repeticion?: string;
}

/** Día de la semana: 1 = lunes … 7 = domingo. */
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Actividad que se repite cada semana (ej: Vinyasa lunes y miércoles 20:00).
 * El sitio la muestra como fechas concretas (ver src/lib/recurrentes.ts).
 */
export interface ActividadRecurrente {
  id: string;
  titulo: string;
  tipo: TipoEvento;
  /** Días en que se repite */
  dias: DiaSemana[];
  hora: string;
  /** Primera fecha posible, AAAA-MM-DD */
  desde: string;
  /** Última fecha posible (opcional), AAAA-MM-DD */
  hasta?: string;
  desc: string;
  lugar: string;
  precio: number;
  /** Fechas canceladas puntualmente (AAAA-MM-DD) */
  excepciones: string[];
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
  /** Descripción de la imagen para lectores de pantalla (texto alternativo) */
  imagenAlt?: string;
  /** Fecha de publicación AAAA-MM-DD */
  fecha: string;
  /** false = borrador, no aparece en el sitio */
  publicado: boolean;
  /**
   * Publicación programada: fecha y hora de Santiago (AAAA-MM-DDTHH:mm).
   * Con publicado = true, aparece en el sitio recién a esa hora.
   */
  publicarEl?: string;
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
/** Una evaluación publicada en el perfil de Encuadrado. */
export interface Resena {
  /** Como lo muestra Encuadrado: "Francisca R." o "Usuario anónimo" */
  nombre: string;
  /** Nota de 1 a 5 */
  nota: number;
  /** Mes y año como lo muestra Encuadrado, ej: "Julio 2026" */
  fecha: string;
  texto: string;
}

export interface ResenasEncuadrado {
  /** Promedio general, ej: 5 */
  promedio: number | null;
  /** Cantidad total de evaluaciones en Encuadrado */
  total: number | null;
  resenas: Resena[];
  /** Cuándo se leyeron por última vez desde Encuadrado (ISO) */
  actualizado: string;
}

/** Versión anterior de una sección del panel (historial para deshacer). */
export interface VersionHistorial {
  /** Momento en que fue reemplazada (ISO 8601) */
  fecha: string;
  /** Quién hizo el cambio que la reemplazó */
  autor: string;
  /** true si era el contenido original del sitio (antes de editar en el panel) */
  original?: boolean;
  datos: unknown;
}

export interface Contenido {
  servicios: Servicio[];
  aranceles: GrupoTarifas[];
  agenda: Evento[];
  /** Actividades que se repiten cada semana */
  recurrentes: ActividadRecurrente[];
  posts: Post[];
  ajustes: Ajustes;
}
