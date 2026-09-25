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
  { label: "Sobre", path: "/sobre" },
  { label: "Servicios", path: "/servicios" },
  { label: "Agenda", path: "/agenda" },
  { label: "Diario", path: "/diario" },
  { label: "Contacto", path: "/contacto" },
];

/** Servicios que se muestran en Inicio y en la página Servicios. */
export const servicios: Servicio[] = [
  {
    id: "psicologia",
    title: "Psicología",
    dot: "var(--plum)",
    meta: "Online y presencial",
    body: "Acompañamiento clínico para la ansiedad, las emociones y la autocrítica, desde un enfoque integrativo y consciente.",
    largo:
      "Proceso terapéutico desde las Terapias de Tercera Generación, como la Terapia de Aceptación y Compromiso (ACT) y el mindfulness, con herramientas prácticas para trabajar la ansiedad, la autoexigencia, la autoestima, los vínculos y la gestión emocional. Modalidad online o presencial en Casa Lunay.",
  },
  {
    id: "terapia-individual",
    title: "Terapia individual",
    dot: "var(--teal)",
    meta: "50 minutos",
    body: "Sesiones uno a uno para trabajar, a tu ritmo, aquello que hoy te pesa.",
    largo:
      "Espacio individual de 50 minutos donde definimos juntas los objetivos y un plan a tu medida. Un lugar seguro para mirar lo que sientes con más claridad y compasión, disponible en modalidad online o presencial.",
  },
  {
    id: "vinyasa-yoga",
    title: "Vinyasa Yoga",
    dot: "var(--amber)",
    meta: "Todos los niveles",
    body: "Práctica dinámica y consciente que une movimiento y respiración. Para todos los niveles.",
    largo:
      "Clases de Vinyasa para pausar, moverte con intención y volver a ti. Prácticas dinámicas y conscientes, en grupos pequeños y con acompañamiento cercano, para todos los niveles. Lunes y miércoles a las 20:00 en Casa Lunay.",
  },
  {
    id: "meditacion",
    title: "Meditación",
    dot: "var(--lime)",
    meta: "Atención plena",
    body: "Prácticas guiadas de atención plena para calmar la mente y soltar la tensión.",
    largo:
      "Sesiones de meditación y mindfulness para reducir el estrés y la ansiedad, cultivar la calma y volver al presente. Un espacio seguro para desconectar y reconectar contigo.",
  },
  {
    id: "experiencias",
    title: "Experiencias",
    dot: "var(--plum)",
    meta: "Talleres y retiros",
    body: "Talleres y retiros para profundizar la práctica y compartir en comunidad.",
    largo:
      "Encuentros especiales (talleres temáticos, jornadas y retiros) que combinan yoga, meditación y bienestar emocional para reconectar con el cuerpo y la calma.",
  },
  {
    id: "comunidad",
    title: "Comunidad",
    dot: "var(--teal)",
    meta: "Encuentros abiertos",
    body: "Siente el poder de la comunidad: encuentros para moverte y respirar acompañada.",
    largo:
      "Una comunidad que acompaña e inspira. Clases al aire libre, encuentros abiertos y actividades para crear bienestar y vínculos desde la práctica compartida.",
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
      "Lo que ocurre cuando nos movemos y respiramos acompañadas.",
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

/** Principios que se muestran en la página Sobre. */
export const principios: Principio[] = [
  {
    titulo: "Autoconocimiento",
    desc: "Mirar hacia adentro con curiosidad y sin juicio para entender lo que sientes y lo que necesitas.",
  },
  {
    titulo: "Compasión",
    desc: "Tratarte con amabilidad, sobre todo cuando la autocrítica y la autoexigencia aprietan.",
  },
  {
    titulo: "Atención plena",
    desc: "Volver al presente, una respiración a la vez, para vivir con más conciencia y calma.",
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
  email: "ignaciacanessa@menteenbalance.com",
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
