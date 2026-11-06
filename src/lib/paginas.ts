// ─────────────────────────────────────────────────────────────
//  TÍTULO, DESCRIPCIÓN E IMAGEN DE CADA PÁGINA
//  Lo usan el título de la pestaña (src/App.tsx) y la vista previa al
//  compartir el link en WhatsApp, Instagram, Facebook o Google
//  (api/pagina.ts). La imagen sale de la pestaña Fotos del panel: si Mari
//  cambia esa foto, la vista previa cambia sola.
//  Archivo sin dependencias de código (lo importa la API).
// ─────────────────────────────────────────────────────────────

import type { ClaveFoto } from "./clavesFotos.js";

export const MARCA = "Mente en Balance";

export interface MetaPagina {
  /** Título de la pestaña y de Google */
  titulo: string;
  /** Título corto para la tarjeta al compartir */
  tituloCompartir: string;
  descripcion: string;
  /** Foto del sitio (pestaña Fotos) para la tarjeta; sin foto = imagen de portada */
  foto?: ClaveFoto;
  /** Foto original de ese lugar, por si Mari no la ha cambiado */
  respaldo?: string;
}

export const PAGINAS: Record<string, MetaPagina> = {
  "/": {
    titulo: `${MARCA} | Psicología & Yoga en Santiago`,
    tituloCompartir: `${MARCA} | Psicología & Yoga en Santiago`,
    descripcion:
      "Un espacio para volver a ti. Psicología, yoga y mindfulness con María Ignacia Canessa, psicóloga clínica y profesora de yoga.",
  },
  "/detras-de-mente-en-balance": {
    titulo: `Detrás de Mente en Balance | ${MARCA}`,
    tituloCompartir: "Detrás de Mente en Balance",
    descripcion:
      "Conoce a María Ignacia Canessa, psicóloga clínica y profesora de yoga, y la forma en que acompaña: psicología, cuerpo y atención plena.",
    foto: "sobre-retrato",
    respaldo: "/img/maria-ignacia.webp",
  },
  "/servicios": {
    titulo: `Servicios y aranceles | ${MARCA}`,
    tituloCompartir: `Servicios y aranceles | ${MARCA}`,
    descripcion:
      "Psicoterapia individual, Vinyasa Yoga y Meditación, talleres y bienestar para organizaciones. Presencial en Las Condes y online.",
    foto: "inicio-sobre",
    respaldo: "/img/meditacion.webp",
  },
  "/agenda": {
    titulo: `Agenda de clases y talleres | ${MARCA}`,
    tituloCompartir: `Agenda de clases y talleres | ${MARCA}`,
    descripcion:
      "Próximas clases de yoga, meditación y talleres en Santiago. Revisa fechas y horarios y reserva tu lugar.",
    foto: "instagram-3",
    respaldo: "/img/clase-grupo.webp",
  },
  "/diario": {
    titulo: `Diario | ${MARCA}`,
    tituloCompartir: `Diario | ${MARCA}`,
    descripcion:
      "Lecturas breves sobre psicología, yoga y atención plena para acompañar tu práctica y volver a ti.",
    foto: "diario-1",
    respaldo: "/img/consulta.webp",
  },
  "/contacto": {
    titulo: `Contacto | ${MARCA}`,
    tituloCompartir: `Contacto | ${MARCA}`,
    descripcion:
      "Escríbeme por WhatsApp para agendar o resolver tus dudas. Atención presencial en Las Condes y online.",
    foto: "inicio-portada",
    respaldo: "/img/yoga-pose.webp",
  },
  "/privacidad": {
    titulo: `Privacidad y aviso legal | ${MARCA}`,
    tituloCompartir: `Privacidad y aviso legal | ${MARCA}`,
    descripcion: "Qué datos pasan por el sitio de Mente en Balance, para qué se usan y cómo ejercer tus derechos.",
  },
};

/** Imagen de portada (1200×630, con texto) para páginas sin foto propia. */
export const IMAGEN_PORTADA = "/og/portada.jpg";
