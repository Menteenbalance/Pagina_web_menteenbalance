// ─────────────────────────────────────────────────────────────
//  CONTENIDO DEL SITIO
//  Este es el archivo que editarás con más frecuencia.
//  Cambia textos, servicios, clases y artículos aquí, sin tocar
//  el diseño ni la lógica.
// ─────────────────────────────────────────────────────────────

import type { NavItem, Servicio, Evento, Post, Principio } from "./types";

/** Menú de navegación (header y footer). */
export const nav: NavItem[] = [
  { label: "Sobre", path: "/sobre" },
  { label: "Servicios", path: "/servicios" },
  { label: "Agenda", path: "/agenda" },
  { label: "Diario", path: "/diario" },
  { label: "Contacto", path: "/contacto" },
];

/** Servicios que se muestran en Inicio y en la página Servicios. */
export const servicios: Servicio[] = [
  {
    title: "Psicología",
    dot: "var(--plum)",
    meta: "Adultos y adolescentes",
    body: "Texto placeholder sobre el proceso terapéutico y su encuadre.",
    largo:
      "Descripción placeholder del proceso terapéutico: primera entrevista, frecuencia de las sesiones, enfoque de trabajo y modalidad presencial u online.",
  },
  {
    title: "Terapia individual",
    dot: "var(--teal)",
    meta: "50 minutos",
    body: "Texto placeholder sobre el acompañamiento uno a uno.",
    largo:
      "Descripción placeholder del acompañamiento individual, los objetivos que se trabajan y cómo se define el plan junto a cada persona.",
  },
  {
    title: "Vinyasa Yoga",
    dot: "var(--amber)",
    meta: "Grupos reducidos",
    body: "Texto placeholder sobre la práctica de movimiento y respiración.",
    largo:
      "Descripción placeholder de la clase de Vinyasa: ritmo, niveles, duración, qué llevar y cómo se estructura la secuencia.",
  },
  {
    title: "Meditación",
    dot: "var(--lime)",
    meta: "Sesiones semanales",
    body: "Texto placeholder sobre atención plena y práctica guiada.",
    largo:
      "Descripción placeholder de las sesiones de meditación guiada, técnicas de atención plena y sugerencias para la práctica en casa.",
  },
  {
    title: "Experiencias",
    dot: "var(--plum)",
    meta: "Talleres y retiros",
    body: "Texto placeholder sobre talleres, retiros y encuentros.",
    largo:
      "Descripción placeholder de las experiencias: talleres temáticos, jornadas de día completo y retiros fuera de la ciudad.",
  },
  {
    title: "Comunidad",
    dot: "var(--teal)",
    meta: "Encuentros abiertos",
    body: "Texto placeholder sobre los encuentros abiertos de la comunidad.",
    largo:
      "Descripción placeholder de la comunidad: encuentros abiertos, círculos de conversación y actividades gratuitas.",
  },
];

/** Clases y talleres. Los filtros de la Agenda usan el campo `tipo`. */
export const agenda: Evento[] = [
  {
    fecha: "28/06",
    hora: "11 hrs.",
    titulo: "Sentir Yoga",
    tipo: "Yoga",
    desc: "Reencuentro con nuestro cuerpo a través del movimiento.",
    lugar: "Mariano Sánchez Fontecilla 584, Las Condes",
    valor: "Valor: $5.000",
  },
  {
    fecha: "05/07",
    hora: "19 hrs.",
    titulo: "Meditación guiada",
    tipo: "Meditación",
    desc: "Práctica placeholder de atención plena para cerrar la semana.",
    lugar: "Online · Zoom",
    valor: "Valor: $4.000",
  },
  {
    fecha: "12/07",
    hora: "10 hrs.",
    titulo: "Taller: mente y cuerpo",
    tipo: "Talleres",
    desc: "Taller placeholder que combina psicología y práctica corporal.",
    lugar: "Mariano Sánchez Fontecilla 584, Las Condes",
    valor: "Valor: $18.000",
  },
  {
    fecha: "26/07",
    hora: "09 hrs.",
    titulo: "Círculo de comunidad",
    tipo: "Talleres",
    desc: "Encuentro placeholder abierto para compartir la práctica.",
    lugar: "Parque Bicentenario, Vitacura",
    valor: "Actividad gratuita",
  },
];

/** Opciones de filtro de la Agenda. "Todo" muestra todos los eventos. */
export const filtros = ["Todo", "Yoga", "Meditación", "Talleres"] as const;
export type Filtro = (typeof filtros)[number];

/** Artículos del Diario. */
export const posts: Post[] = [
  {
    cat: "Psicología",
    titulo: "Título placeholder de un artículo del diario",
    bajada:
      "Bajada placeholder de dos líneas que resume el contenido del artículo.",
  },
  {
    cat: "Yoga",
    titulo: "Título placeholder sobre la práctica semanal",
    bajada:
      "Bajada placeholder de dos líneas que resume el contenido del artículo.",
  },
  {
    cat: "Meditación",
    titulo: "Título placeholder sobre atención plena",
    bajada:
      "Bajada placeholder de dos líneas que resume el contenido del artículo.",
  },
];

/** Lista larga de la página Diario (duplica los posts, igual que el prototipo). */
export const postsTodos: Post[] = [
  ...posts,
  ...posts.map((p) => ({ ...p, titulo: `${p.titulo} (2)` })),
];

/** Principios que se muestran en la página Sobre. */
export const principios: Principio[] = [
  {
    titulo: "Autoconocimiento",
    desc: "Texto placeholder que describe este principio del trabajo.",
  },
  {
    titulo: "Compasión",
    desc: "Texto placeholder que describe este principio del trabajo.",
  },
  {
    titulo: "Atención plena",
    desc: "Texto placeholder que describe este principio del trabajo.",
  },
];

/** Datos de contacto, reutilizados en la página Contacto y el footer. */
export const contacto = {
  instagram: {
    label: "@menteenbalance.cl",
    url: "https://www.instagram.com/menteenbalance.cl/",
  },
  whatsapp: "WhatsApp +56 9 0000 0000",
  email: "hola@menteenbalance.cl",
  direccion: ["Mariano Sánchez Fontecilla 584", "Las Condes, Santiago"],
};
