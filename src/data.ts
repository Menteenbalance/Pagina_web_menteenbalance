// ─────────────────────────────────────────────────────────────
//  CONTENIDO DEL SITIO
//  Este es el archivo que editarás con más frecuencia.
//  Cambia textos, servicios, clases y artículos aquí, sin tocar
//  el diseño ni la lógica.
// ─────────────────────────────────────────────────────────────

import type {
  Ajustes,
  Contenido,
  NavItem,
  Servicio,
  Evento,
  Post,
  Principio,
  GrupoTarifas,
} from "./types";

/** Menú de navegación (header y footer). */
export const nav: NavItem[] = [
  { label: "Detrás de Mente en Balance", path: "/detras-de-mente-en-balance" },
  { label: "Servicios", path: "/servicios" },
  { label: "Agenda", path: "/agenda" },
  { label: "Diario", path: "/diario" },
  { label: "Contacto", path: "/contacto" },
];

/** Servicios que se muestran en Inicio y en la página Servicios. */
export const servicios: Servicio[] = [
  {
    id: "psicoterapia-individual",
    title: "Psicoterapia individual",
    dot: "var(--plum)",
    meta: "Online y presencial",
    body: "Un espacio individual para comprender lo que estás viviendo, conocerte con mayor profundidad y desarrollar herramientas para tu día a día.",
    largo:
      "Un espacio individual para comprender lo que estás viviendo, conocerte con mayor profundidad y desarrollar herramientas que te permitan relacionarte contigo y con tu entorno de una manera más consciente y amable. Modalidad online o presencial en Casa Lunay.",
  },
  {
    id: "vinyasa-yoga-y-meditacion",
    title: "Vinyasa Yoga y Meditación",
    dot: "var(--teal)",
    meta: "Grupales y particulares",
    body: "Clases grupales los lunes y miércoles a las 20:00 hrs en Casa Lunay, y clases particulares.",
    largo:
      "Clases de Vinyasa Yoga y meditación para moverte, respirar y volver al presente. Grupales: lunes y miércoles a las 20:00 hrs en Casa Lunay. También clases particulares, adaptadas a lo que necesitas.",
  },
  {
    id: "encuentros-talleres-y-experiencias",
    title: "Encuentros, talleres y experiencias",
    dot: "var(--amber)",
    meta: "Uno al mes",
    body: "Un encuentro mensual para pausar, compartir y aprender en comunidad, además de experiencias especiales.",
    largo:
      "Un encuentro mensual para pausar, compartir experiencias, aprender y conectar con otros desde un lugar seguro. Además, experiencias especiales y actividades en colaboración a lo largo del año.",
  },
  {
    id: "bienestar-para-organizaciones",
    title: "Bienestar para organizaciones",
    dot: "var(--lime)",
    meta: "Para equipos",
    body: "Charlas, pausas activas, clases y psicoeducación para cuidar el bienestar de tu equipo.",
    largo:
      "Programas de bienestar para organizaciones: charlas, pausas activas, clases de yoga y meditación y psicoeducación, para cuidar la salud emocional de los equipos en su lugar de trabajo.",
  },
];

/** Clases y talleres. Los filtros de la Agenda usan el campo `tipo`. */
export const agenda: Evento[] = [
  {
    id: "evento-1",
    fecha: "2026-06-28",
    hora: "11 hrs.",
    titulo: "Sentir Yoga",
    tipo: "Yoga",
    desc: "Reencuentro con nuestro cuerpo a través del movimiento.",
    lugar: "Casa Lunay · Mariano Sánchez Fontecilla 584, Las Condes",
    precio: 5000,
  },
  {
    id: "evento-2",
    fecha: "2026-07-05",
    hora: "19 hrs.",
    titulo: "Meditación guiada",
    tipo: "Meditación",
    desc: "Práctica de atención plena para cerrar la semana.",
    lugar: "Online · Zoom",
    precio: 4000,
  },
  {
    id: "evento-3",
    fecha: "2026-07-12",
    hora: "10 hrs.",
    titulo: "Taller: mente y cuerpo",
    tipo: "Talleres",
    desc: "Taller que combina psicología y práctica corporal.",
    lugar: "Casa Lunay · Mariano Sánchez Fontecilla 584, Las Condes",
    precio: 18000,
  },
  {
    id: "evento-4",
    fecha: "2026-07-26",
    hora: "09 hrs.",
    titulo: "Círculo de comunidad",
    tipo: "Talleres",
    desc: "Encuentro abierto para compartir la práctica.",
    lugar: "Parque Bicentenario, Vitacura",
    precio: 0,
  },
];

/** Opciones de filtro de la Agenda. "Todo" muestra todos los eventos. */
export const filtros = ["Todo", "Yoga", "Meditación", "Talleres"] as const;
export type Filtro = (typeof filtros)[number];

/**
 * Artículos del Diario (contenido inicial). Desde el panel /admin se
 * crean, editan y publican; esto solo se usa hasta el primer guardado.
 * Los que no tienen `cuerpo` se muestran como tarjeta, sin página propia.
 */
export const posts: Post[] = [
  {
    id: "post-1",
    slug: "ansiedad-cuando-la-mente-se-adelanta",
    cat: "Psicología",
    titulo: "Ansiedad: cuando la mente se adelanta",
    bajada:
      "Qué es la ansiedad y cómo las Terapias de Tercera Generación nos ayudan a relacionarnos distinto con ella.",
    cuerpo: "",
    imagen: "/img/consulta.webp",
    fecha: "2026-06-20",
    publicado: true,
  },
  {
    id: "post-2",
    slug: "respirar-para-volver-al-presente",
    cat: "Yoga",
    titulo: "Respirar para volver al presente",
    bajada:
      "El rol de la respiración en Vinyasa Yoga para soltar la tensión que acumulamos durante el día.",
    cuerpo: "",
    imagen: "/img/retiro-1.webp",
    fecha: "2026-06-10",
    publicado: true,
  },
  {
    id: "post-3",
    slug: "el-desafio-de-la-quietud",
    cat: "Meditación",
    titulo: "El desafío de la quietud",
    bajada:
      "Pequeñas pautas para empezar a meditar, aunque tu mente no deje de moverse.",
    cuerpo: "",
    imagen: "/img/yoga-restaurativa.webp",
    fecha: "2026-05-28",
    publicado: true,
  },
  {
    id: "post-4",
    slug: "autocritica-y-autocompasion",
    cat: "Psicología",
    titulo: "Autocrítica y autocompasión",
    bajada:
      "Cómo dejar de exigirte tanto y empezar a tratarte con más amabilidad.",
    cuerpo: "",
    imagen: "/img/yoga-parque.webp",
    fecha: "2026-05-15",
    publicado: true,
  },
  {
    id: "post-5",
    slug: "yoga-para-todos-los-niveles",
    cat: "Yoga",
    titulo: "Yoga para todos los niveles",
    bajada:
      "Por qué no necesitas ser flexible ni experta para empezar a practicar.",
    cuerpo: "",
    imagen: "/img/clase-grupo.webp",
    fecha: "2026-05-02",
    publicado: true,
  },
  {
    id: "post-6",
    slug: "el-poder-de-practicar-en-comunidad",
    cat: "Comunidad",
    titulo: "El poder de practicar en comunidad",
    bajada:
      "Lo que ocurre cuando nos movemos y respiramos en compañía.",
    cuerpo: "",
    imagen: "/img/balasana.webp",
    fecha: "2026-04-18",
    publicado: true,
  },
];

/**
 * Aranceles, separados por Psicoterapia y Yoga Vinyasa.
 * Precios en pesos chilenos (CLP). Edita aquí si cambian los valores.
 */
export const aranceles: GrupoTarifas[] = [
  {
    categoria: "Psicoterapia",
    items: [
      {
        nombre: "Sesión online",
        modalidad: "Online",
        duracion: "50 min",
        precio: 37000,
      },
      {
        nombre: "Paquete de 4 sesiones · Online",
        modalidad: "Online",
        duracion: "50 min por sesión",
        precio: 140000,
      },
      {
        nombre: "Sesión presencial",
        modalidad: "Presencial",
        duracion: "50 min",
        precio: 42000,
      },
      {
        nombre: "Paquete de 4 sesiones · Presencial",
        modalidad: "Presencial",
        duracion: "50 min por sesión",
        precio: 155000,
      },
    ],
  },
  {
    categoria: "Yoga Vinyasa",
    items: [
      {
        nombre: "Clase suelta",
        precio: 10000,
      },
      {
        nombre: "Mensualidad · 1 vez por semana",
        precio: 35000,
      },
      {
        nombre: "Mensualidad · 2 veces por semana",
        precio: 50000,
      },
    ],
  },
];

/** Valores del espacio (página "Detrás de Mente en Balance"). */
export const valores: Principio[] = [
  { titulo: "Autoconocimiento", desc: "Conocerte para comprenderte." },
  { titulo: "Compasión y no juicio", desc: "Aprender a acompañarnos incluso en lo difícil." },
  { titulo: "Presencia", desc: "Volver al momento que estás viviendo." },
  { titulo: "Cercanía", desc: "Un espacio humano, cálido y sin juicios." },
  { titulo: "Evidencia", desc: "Integrar herramientas respaldadas por la psicología y la ciencia." },
  { titulo: "Comunidad", desc: "Porque no tenemos que atravesar todo solos." },
];

/** Formación de María Ignacia (página "Detrás de Mente en Balance"). */
export const formacion: { anio: string; titulo: string; lugar: string; detalle?: string }[] = [
  {
    anio: "2026",
    titulo: "Máster en Terapias Psicológicas de Tercera Generación",
    lugar: "Universidad de Valencia",
    detalle:
      "Terapia de Aceptación y Compromiso, Terapia Dialéctico Conductual y Terapia Cognitivo Conductual para la ansiedad y la depresión.",
  },
  {
    anio: "2024",
    titulo: "Instructora de Vinyasa Yoga Somático (200 hrs)",
    lugar: "Escuela SOMA Yoga, Brasil",
  },
  {
    anio: "2023",
    titulo: "Diplomado en Intervención en Ansiedad y Estrés en NNA",
    lugar: "Universidad del Desarrollo",
  },
  {
    anio: "2023",
    titulo: "Instructora de Vinyasa Yoga (200 hrs)",
    lugar: "Vinyasa Yoga Chile",
  },
  {
    anio: "2022",
    titulo: "Psicóloga Clínica",
    lugar: "Universidad del Desarrollo",
  },
];

/**
 * Enlace externo de reservas (Encuadrado).
 * Cámbialo aquí si en el futuro se actualiza la página de agenda.
 */
export const reservaUrl =
  "https://encuadrado.com/p/maria-ignacia-canessa/";

/** Datos de contacto, reutilizados en la página Contacto y el footer. */
export const contacto = {
  instagram: {
    label: "@menteenbalance.cl",
    url: "https://www.instagram.com/menteenbalance.cl/",
  },
  whatsapp: "WhatsApp +56 9 4354 9436",
  /** Número para los enlaces de WhatsApp (formato internacional, solo dígitos) */
  whatsappNumero: "56943549436",
  /** Mensaje con que se abre la conversación desde el sitio */
  whatsappMensaje:
    "Hola Mari, te escribo desde la página de Mente en Balance. Me gustaría hacerte una consulta.",
  email: "ignaciacanessa@menteenbalance.com",
  /** Comunidad de WhatsApp de Mente en Balance */
  comunidadWhatsapp: "https://chat.whatsapp.com/LtzlDJO4s8I0gvLbAD1oKi",
  direccion: [
    "Casa Lunay · Mariano Sánchez Fontecilla 584",
    "Las Condes, Santiago",
  ],
};

/** Ajustes iniciales del módulo de Instagram (editables en el panel). */
export const ajustes: Ajustes = {
  instagram: {
    visible: true,
    texto:
      "Prácticas breves, fechas de clases y recordatorios para volver a ti, un día a la vez.",
  },
};

/**
 * Contenido inicial editable. El sitio lo muestra mientras carga y
 * hasta que se guarde algo desde el panel de administración.
 */
export const contenidoInicial: Contenido = {
  servicios,
  aranceles,
  agenda,
  posts,
  ajustes,
};

/** Enlace que abre una conversación de WhatsApp con el mensaje prellenado. */
export function enlaceWhatsApp(mensaje: string = contacto.whatsappMensaje): string {
  return `https://wa.me/${contacto.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
}
