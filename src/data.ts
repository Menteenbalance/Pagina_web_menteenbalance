// ─────────────────────────────────────────────────────────────
//  CONTENIDO DEL SITIO
//  Este es el archivo que editarás con más frecuencia.
//  Cambia textos, servicios, clases y artículos aquí, sin tocar
//  el diseño ni la lógica.
// ─────────────────────────────────────────────────────────────

import type {
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
    title: "Psicología",
    dot: "var(--plum)",
    meta: "Online y presencial",
    body: "Acompañamiento clínico para la ansiedad, las emociones y la autocrítica, desde un enfoque integrativo y consciente.",
    largo:
      "Proceso terapéutico desde las Terapias de Tercera Generación —como la Terapia de Aceptación y Compromiso (ACT) y el mindfulness—, con herramientas prácticas para trabajar la ansiedad, la autoexigencia, la autoestima, los vínculos y la gestión emocional. Modalidad online o presencial en Casa Lunay.",
  },
  {
    title: "Terapia individual",
    dot: "var(--teal)",
    meta: "50 minutos",
    body: "Sesiones uno a uno para trabajar, a tu ritmo, aquello que hoy te pesa.",
    largo:
      "Espacio individual de 50 minutos donde definimos juntas los objetivos y un plan a tu medida. Un lugar seguro para mirar lo que sientes con más claridad y compasión, disponible en modalidad online o presencial.",
  },
  {
    title: "Vinyasa Yoga",
    dot: "var(--amber)",
    meta: "Todos los niveles",
    body: "Práctica dinámica y consciente que une movimiento y respiración. Para todos los niveles.",
    largo:
      "Clases de Vinyasa para pausar, moverte con intención y volver a ti. Prácticas dinámicas y conscientes, en grupos pequeños y con acompañamiento cercano, para todos los niveles. Lunes y miércoles a las 20:00 en Casa Lunay.",
  },
  {
    title: "Meditación",
    dot: "var(--lime)",
    meta: "Atención plena",
    body: "Prácticas guiadas de atención plena para calmar la mente y soltar la tensión.",
    largo:
      "Sesiones de meditación y mindfulness para reducir el estrés y la ansiedad, cultivar la calma y volver al presente. Un espacio seguro para desconectar y reconectar contigo.",
  },
  {
    title: "Experiencias",
    dot: "var(--plum)",
    meta: "Talleres y retiros",
    body: "Talleres y retiros para profundizar la práctica y compartir en comunidad.",
    largo:
      "Encuentros especiales —talleres temáticos, jornadas y retiros— que combinan yoga, meditación y bienestar emocional para reconectar con el cuerpo y la calma.",
  },
  {
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
    fecha: "28/06",
    hora: "11 hrs.",
    titulo: "Sentir Yoga",
    tipo: "Yoga",
    desc: "Reencuentro con nuestro cuerpo a través del movimiento.",
    lugar: "Casa Lunay · Mariano Sánchez Fontecilla 584, Las Condes",
    valor: "Valor: $5.000",
  },
  {
    fecha: "05/07",
    hora: "19 hrs.",
    titulo: "Meditación guiada",
    tipo: "Meditación",
    desc: "Práctica de atención plena para cerrar la semana.",
    lugar: "Online · Zoom",
    valor: "Valor: $4.000",
  },
  {
    fecha: "12/07",
    hora: "10 hrs.",
    titulo: "Taller: mente y cuerpo",
    tipo: "Talleres",
    desc: "Taller que combina psicología y práctica corporal.",
    lugar: "Casa Lunay · Mariano Sánchez Fontecilla 584, Las Condes",
    valor: "Valor: $18.000",
  },
  {
    fecha: "26/07",
    hora: "09 hrs.",
    titulo: "Círculo de comunidad",
    tipo: "Talleres",
    desc: "Encuentro abierto para compartir la práctica.",
    lugar: "Parque Bicentenario, Vitacura",
    valor: "Actividad gratuita",
  },
];

/** Opciones de filtro de la Agenda. "Todo" muestra todos los eventos. */
export const filtros = ["Todo", "Yoga", "Meditación", "Talleres"] as const;
export type Filtro = (typeof filtros)[number];

/**
 * Artículos del Diario. Estos son temas de ejemplo alineados a la marca;
 * reemplázalos por tus artículos reales cuando los escribas.
 * Inicio muestra los primeros 3; la página Diario los muestra todos.
 */
export const posts: Post[] = [
  {
    cat: "Psicología",
    titulo: "Ansiedad: cuando la mente se adelanta",
    bajada:
      "Qué es la ansiedad y cómo las Terapias de Tercera Generación nos ayudan a relacionarnos distinto con ella.",
  },
  {
    cat: "Yoga",
    titulo: "Respirar para volver al presente",
    bajada:
      "El rol de la respiración en Vinyasa Yoga para soltar la tensión que acumulamos durante el día.",
  },
  {
    cat: "Meditación",
    titulo: "El desafío de la quietud",
    bajada:
      "Pequeñas pautas para empezar a meditar, aunque tu mente no deje de moverse.",
  },
  {
    cat: "Psicología",
    titulo: "Autocrítica y autocompasión",
    bajada:
      "Cómo dejar de exigirte tanto y empezar a tratarte con más amabilidad.",
  },
  {
    cat: "Yoga",
    titulo: "Yoga para todos los niveles",
    bajada:
      "Por qué no necesitas ser flexible ni experta para empezar a practicar.",
  },
  {
    cat: "Comunidad",
    titulo: "El poder de practicar en comunidad",
    bajada: "Lo que ocurre cuando nos movemos y respiramos acompañadas.",
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
        precio: "$37.000",
      },
      {
        nombre: "Paquete de 4 sesiones · Online",
        modalidad: "Online",
        duracion: "50 min por sesión",
        precio: "$140.000",
      },
      {
        nombre: "Sesión presencial",
        modalidad: "Presencial",
        duracion: "50 min",
        precio: "$42.000",
      },
      {
        nombre: "Paquete de 4 sesiones · Presencial",
        modalidad: "Presencial",
        duracion: "50 min por sesión",
        precio: "$155.000",
      },
    ],
  },
  {
    categoria: "Yoga Vinyasa",
    items: [
      {
        nombre: "Clase suelta",
        precio: "$10.000",
      },
      {
        nombre: "Mensualidad · 1 vez por semana",
        precio: "$35.000",
      },
      {
        nombre: "Mensualidad · 2 veces por semana",
        precio: "$50.000",
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
  email: "hola@menteenbalance.cl",
  direccion: [
    "Casa Lunay · Mariano Sánchez Fontecilla 584",
    "Las Condes, Santiago",
  ],
};
