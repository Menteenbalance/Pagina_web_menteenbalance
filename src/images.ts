// ─────────────────────────────────────────────────────────────
//  IMÁGENES
//  Rutas de las fotos (viven en public/img, se sirven desde "/img").
//  Cada una tiene su texto alternativo (alt) para accesibilidad y SEO.
//  Para cambiar una foto: reemplaza el archivo en public/img con el
//  mismo nombre, o apunta aquí a uno nuevo.
// ─────────────────────────────────────────────────────────────

export interface Imagen {
  src: string;
  alt: string;
}

export const img = {
  yogaPose: {
    src: "/img/yoga-pose.jpg",
    alt: "Práctica de Vinyasa Yoga en la sala",
  },
  meditacionGrupo: {
    src: "/img/meditacion.jpg",
    alt: "Sesión de meditación en grupo",
  },
  consulta: {
    src: "/img/consulta.jpg",
    alt: "Sala de consulta de psicología",
  },
  claseGrupo: {
    src: "/img/clase-grupo.jpg",
    alt: "Clase grupal de yoga en postura del guerrero",
  },
  claseGuiada: {
    src: "/img/clase-guiada.jpg",
    alt: "Clase de yoga guiada por la instructora",
  },
  retiro1: {
    src: "/img/retiro-1.jpg",
    alt: "Práctica de yoga al aire libre en un retiro",
  },
  retiro2: {
    src: "/img/retiro-2.jpg",
    alt: "Equilibrio de brazos en un retiro de yoga al aire libre",
  },
  retiroGrupo: {
    src: "/img/retiro-grupo.jpg",
    alt: "Clase grupal de yoga en un retiro",
  },
  yogaParque: {
    src: "/img/yoga-parque.jpg",
    alt: "Clase de yoga al aire libre en el parque",
  },
  yogaRestaurativa: {
    src: "/img/yoga-restaurativa.jpg",
    alt: "Yoga restaurativa con velas y ambiente cálido",
  },
  balasana: {
    src: "/img/balasana.jpg",
    alt: "Grupo en postura del niño durante una clase",
  },
} satisfies Record<string, Imagen>;
