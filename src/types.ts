// Tipos compartidos para el contenido del sitio.
// Al tener el contenido tipado, el editor te avisa si falta un campo.

export interface NavItem {
  /** Texto que se ve en el menú */
  label: string;
  /** Ruta interna, ej: "/servicios" */
  path: string;
}

export interface Servicio {
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
  cat: string;
  titulo: string;
  bajada: string;
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
