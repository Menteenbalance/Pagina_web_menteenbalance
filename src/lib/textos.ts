// ─────────────────────────────────────────────────────────────
//  TEXTOS EDITABLES
//  Catálogo de los textos del sitio que Mari cambia desde el panel
//  (pestaña Textos). Cada uno tiene su texto original, que se usa
//  mientras no lo edite. Sin dependencias: lo usan el sitio, el
//  panel y la API (validación).
//
//  Tipos:
//    linea    → una sola línea (títulos, frases)
//    titulo   → título que puede ir en dos líneas (Enter = salto)
//    parrafos → varios párrafos (línea en blanco entre párrafos;
//               admite **negrita**, *cursiva* y [enlaces](https://…))
//    lista    → una frase por línea
// ─────────────────────────────────────────────────────────────

export type TipoTexto = "linea" | "titulo" | "parrafos" | "lista";

export interface LugarTexto {
  clave: string;
  grupo: string;
  /** Sub-bloque dentro de la página, ej: "¿Por qué yoga?" */
  bloque: string;
  nombre: string;
  tipo: TipoTexto;
  max: number;
  original: string;
}

const P = (...parrafos: string[]) => parrafos.join("\n\n");
const L = (...lineas: string[]) => lineas.join("\n");

export const LUGARES_TEXTOS = [
  // ── Inicio ──────────────────────────────────────────────────
  { clave: "inicio-hero-titulo", grupo: "Inicio", bloque: "Portada", nombre: "Título principal", tipo: "titulo", max: 60, original: "Un día\na la vez" },
  {
    clave: "inicio-hero-texto",
    grupo: "Inicio",
    bloque: "Portada",
    nombre: "Frase bajo el título",
    tipo: "linea",
    max: 220,
    original: "Un espacio para generar comunidad y crear bienestar desde el autoconocimiento, compasión y atención plena.",
  },
  { clave: "inicio-sobre-titulo", grupo: "Inicio", bloque: "Un espacio para volver a ti", nombre: "Título", tipo: "linea", max: 80, original: "Un espacio para volver a ti" },
  {
    clave: "inicio-sobre-texto",
    grupo: "Inicio",
    bloque: "Un espacio para volver a ti",
    nombre: "Texto",
    tipo: "parrafos",
    max: 1500,
    original: P(
      "Mente en Balance nace desde la idea de que no siempre necesitamos hacer más. A veces necesitamos parar, salir del piloto automático, escucharnos y comprender qué es lo que nos está pasando.",
      "Soy María Ignacia Canessa, psicóloga clínica y profesora de yoga. Integro psicología, yoga y mindfulness para acompañarte a conectar con tu mente, tu cuerpo y tus emociones desde la presencia, la curiosidad y la compasión."
    ),
  },
  { clave: "inicio-cita", grupo: "Inicio", bloque: "Cita destacada", nombre: "Frase de la franja oscura", tipo: "linea", max: 140, original: "Ven a moverte, respirar y volver a ti." },

  // ── Detrás de Mente en Balance ──────────────────────────────
  { clave: "sobre-intro-titulo", grupo: "Detrás de Mente en Balance", bloque: "El espacio", nombre: "Título", tipo: "linea", max: 80, original: "Un espacio para volver a ti" },
  {
    clave: "sobre-intro-texto",
    grupo: "Detrás de Mente en Balance",
    bloque: "El espacio",
    nombre: "Texto",
    tipo: "parrafos",
    max: 2500,
    original: P(
      "Mente en Balance nace desde la idea de que no siempre necesitamos hacer más. A veces necesitamos parar, salir del piloto automático, escucharnos y comprender qué es lo que nos está pasando: desde dónde nos miramos, nos hablamos y nos relacionamos con el mundo.",
      "Es un espacio creado por María Ignacia Canessa, psicóloga clínica y profesora de yoga, que integra psicología, yoga y mindfulness para acompañarte a conectar con tu mente, tu cuerpo y tus emociones desde un lugar de presencia, curiosidad y compasión.",
      "Aquí no buscamos cambiar quién eres. Buscamos que puedas conocerte, comprenderte y construir una forma de vivir que se sienta más tuya, entendiendo que estamos en constante cambio."
    ),
  },
  { clave: "sobre-balance-titulo", grupo: "Detrás de Mente en Balance", bloque: "¿Qué significa estar en balance?", nombre: "Título", tipo: "linea", max: 80, original: "¿Qué significa estar en balance?" },
  {
    clave: "sobre-balance-lead",
    grupo: "Detrás de Mente en Balance",
    bloque: "¿Qué significa estar en balance?",
    nombre: "Frase destacada",
    tipo: "linea",
    max: 200,
    original: "No significa estar bien todo el tiempo. La vida se mueve. Nosotros también.",
  },
  {
    clave: "sobre-balance-texto",
    grupo: "Detrás de Mente en Balance",
    bloque: "¿Qué significa estar en balance?",
    nombre: "Texto",
    tipo: "parrafos",
    max: 1000,
    original:
      "Estar en balance puede significar aprender a reconocer lo que necesitas, relacionarte de otra manera con lo que sientes y encontrar herramientas que te permitan volver a ti cuando el piloto automático toma el control.",
  },
  ...(
    [
      ["Pausar", "¿Y si parar también fuera avanzar?"],
      ["Observar", "Una pausa para observar."],
      ["Comprender", "Observar para comprender."],
      ["Elegir", "Comprender para elegir aquello que realmente importa para ti."],
    ] as const
  ).flatMap(([verbo, frase], i) => [
    {
      clave: `sobre-paso-${i + 1}-verbo`,
      grupo: "Detrás de Mente en Balance",
      bloque: "¿Qué significa estar en balance?",
      nombre: `Paso ${i + 1} · palabra`,
      tipo: "linea" as const,
      max: 30,
      original: verbo,
    },
    {
      clave: `sobre-paso-${i + 1}-texto`,
      grupo: "Detrás de Mente en Balance",
      bloque: "¿Qué significa estar en balance?",
      nombre: `Paso ${i + 1} · frase`,
      tipo: "linea" as const,
      max: 140,
      original: frase,
    },
  ]),
  { clave: "sobre-balance-cierre", grupo: "Detrás de Mente en Balance", bloque: "¿Qué significa estar en balance?", nombre: "Frase de cierre", tipo: "linea", max: 140, original: "Más presencia, menos piloto automático." },
  { clave: "sobre-persona-titulo", grupo: "Detrás de Mente en Balance", bloque: "La persona", nombre: "Título", tipo: "linea", max: 80, original: "La persona detrás de Mente en Balance" },
  { clave: "sobre-persona-rol", grupo: "Detrás de Mente en Balance", bloque: "La persona", nombre: "Profesión (bajo el nombre)", tipo: "linea", max: 100, original: "Psicóloga clínica · Profesora de yoga" },
  {
    clave: "sobre-persona-texto",
    grupo: "Detrás de Mente en Balance",
    bloque: "La persona",
    nombre: "Texto",
    tipo: "parrafos",
    max: 3000,
    original: P(
      "Soy María Ignacia, psicóloga clínica y profesora de Vinyasa Yoga. Creo en la importancia de crear espacios donde podamos detenernos, escucharnos y comprender lo que estamos viviendo, sin juicios y desde una mirada amable hacia nosotros mismos.",
      "Mi forma de acompañar integra distintas herramientas de la psicología, especialmente de las Terapias de Tercera Generación (una evolución de la terapia cognitivo conductual, como ACT, DBT y las terapias basadas en las emociones y en la compasión), junto con mindfulness, movimiento y consciencia corporal.",
      "Me interesa que la terapia no sea solo un espacio para hablar de lo que nos pasa, sino también un lugar para comprender nuestros patrones, conectar con nuestras necesidades y desarrollar herramientas que podamos llevar a la vida cotidiana.",
      "Acompaño procesos desde una mirada cercana, integrativa y basada en evidencia, adaptando el proceso a la historia, necesidades y objetivos de cada persona."
    ),
  },
  { clave: "sobre-acompanar-titulo", grupo: "Detrás de Mente en Balance", bloque: "Acompañar", nombre: "Título", tipo: "linea", max: 80, original: "Para mí, acompañar también significa…" },
  {
    clave: "sobre-acompanar-lista",
    grupo: "Detrás de Mente en Balance",
    bloque: "Acompañar",
    nombre: "Lista (una frase por línea)",
    tipo: "lista",
    max: 1000,
    original: L(
      "Escuchar antes de juzgar.",
      "Comprender antes de exigirnos cambiar.",
      "Encontrar herramientas sin perder de vista a la persona.",
      "Recordar que pedir ayuda también es una forma de cuidarnos."
    ),
  },
  { clave: "sobre-yoga-titulo", grupo: "Detrás de Mente en Balance", bloque: "¿Por qué yoga?", nombre: "Título", tipo: "linea", max: 80, original: "¿Por qué yoga?" },
  {
    clave: "sobre-yoga-texto",
    grupo: "Detrás de Mente en Balance",
    bloque: "¿Por qué yoga?",
    nombre: "Texto",
    tipo: "parrafos",
    max: 2500,
    original: P(
      "El yoga llegó a mi vida en un momento desafiante, cuando necesitaba encontrar un espacio para hacer una pausa y volver a mí. Al principio fue una forma de moverme y respirar, pero con el tiempo descubrí que también podía ser una manera de escucharme, habitar mi cuerpo y estar más presente.",
      "A través de su práctica aprendí a conocerme desde otro lugar, observarme con mayor curiosidad y hablarme de una manera más amable, incluso en aquellos momentos en que las cosas no estaban bien.",
      "Esa experiencia transformó mi manera de entender el bienestar y, con el tiempo, también mi forma de acompañar a otros. Por eso, en Mente en Balance, el yoga no está separado de la psicología: es otro camino para cultivar autoconocimiento, presencia y conexión con nosotros mismos."
    ),
  },
  { clave: "sobre-comunidad-titulo", grupo: "Detrás de Mente en Balance", bloque: "¿Por qué crear comunidad?", nombre: "Título", tipo: "linea", max: 80, original: "¿Por qué crear comunidad?" },
  {
    clave: "sobre-comunidad-texto",
    grupo: "Detrás de Mente en Balance",
    bloque: "¿Por qué crear comunidad?",
    nombre: "Texto",
    tipo: "parrafos",
    max: 3000,
    original: P(
      "Con el tiempo fui comprendiendo que el bienestar no es un camino que tenemos que recorrer solos. Somos en relación, y muchas veces es justamente en el encuentro con otros donde podemos sentirnos vistos, comprendidos y acompañados.",
      "Por eso, Mente en Balance también busca crear espacios de comunidad: instancias para pausar, compartir experiencias, aprender, crear y conectar con otros desde un lugar seguro y sin juicios.",
      "Creo en el valor de encontrarnos, de poder hablar de lo que nos pasa y también de escuchar lo que otros viven. En esos encuentros podemos descubrir que no somos los únicos que estamos atravesando ciertas experiencias, y que dejarnos acompañar también es una forma de cuidarnos.",
      "Para mí, crear comunidad es generar espacios de autocuidado y contención, donde podamos sostenernos, conocernos y crecer en relación con otros."
    ),
  },
  {
    clave: "sobre-comunidad-frase",
    grupo: "Detrás de Mente en Balance",
    bloque: "¿Por qué crear comunidad?",
    nombre: "Frase destacada",
    tipo: "linea",
    max: 220,
    original: "Porque cuidarnos no siempre significa hacerlo solos. A veces, cuidarnos también es encontrarnos.",
  },
  {
    clave: "sobre-cierre",
    grupo: "Detrás de Mente en Balance",
    bloque: "Cierre",
    nombre: "Frase final",
    tipo: "linea",
    max: 260,
    original:
      "Porque no se trata de cambiar quién eres. Se trata de poder escucharte, comprenderte y construir una forma de vivir que se sienta más tuya.",
  },

  // ── Servicios ───────────────────────────────────────────────
  { clave: "servicios-titulo", grupo: "Servicios", bloque: "Encabezado", nombre: "Título de la página", tipo: "linea", max: 80, original: "Terapia, práctica y comunidad" },
  {
    clave: "servicios-nota-precios",
    grupo: "Servicios",
    bloque: "Aranceles",
    nombre: "Nota bajo los valores",
    tipo: "linea",
    max: 240,
    original: "Valores en pesos chilenos (CLP). Reservas y pagos se gestionan a través de Encuadrado.",
  },
] as const satisfies readonly LugarTexto[];

export type ClaveTexto = (typeof LUGARES_TEXTOS)[number]["clave"];

export const TEXTO_POR_CLAVE = Object.fromEntries(LUGARES_TEXTOS.map((l) => [l.clave, l])) as unknown as Record<
  ClaveTexto,
  LugarTexto
>;

export function esClaveTexto(v: unknown): v is ClaveTexto {
  return typeof v === "string" && v in TEXTO_POR_CLAVE;
}

/** Texto que corresponde mostrar: el editado o el original. */
export function textoDe(textos: Partial<Record<string, string>> | undefined, clave: ClaveTexto): string {
  const editado = textos?.[clave];
  return editado !== undefined && editado.trim() !== "" ? editado : TEXTO_POR_CLAVE[clave].original;
}
