// GET /api/pagina?ruta=/servicios
// HTML inicial de una página con su propio título, descripción e imagen.
//
// El sitio se arma en el navegador, pero WhatsApp, Instagram, Facebook y
// compañía solo leen el HTML inicial, que es igual para todas las páginas.
// vercel.json envía aquí SOLO a esos lectores automáticos (por su
// "user-agent"); las personas siguen recibiendo el index.html estático.
// Esta función toma ese mismo index.html y le cambia las etiquetas <head>.
//
// Si algo falla, entrega el index.html sin cambios (nunca deja la página
// en blanco).

import { leerContenido } from "./_lib/contenido.js";
import { SITE_URL } from "./_lib/config.js";
import { ahoraEnSantiago, seVeEnElSitio } from "../src/lib/tiempo.js";
import { IMAGEN_PORTADA, MARCA, PAGINAS, type MetaPagina } from "../src/lib/paginas.js";
import type { Contenido } from "../src/types.js";

interface Meta {
  titulo: string;
  tituloCompartir: string;
  descripcion: string;
  imagen: string;
  imagenAlt: string;
  ruta: string;
  tipo: "website" | "article";
  publicado?: string;
  estado: 200 | 404;
}

let plantilla: string | null = null;

/** index.html del despliegue actual (se guarda en memoria). */
async function leerPlantilla(origen: string): Promise<string> {
  if (plantilla) return plantilla;
  const r = await fetch(new URL("/index.html", origen), { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(`index.html: ${r.status}`);
  plantilla = await r.text();
  return plantilla;
}

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const recortar = (s: string, max: number) => {
  const limpio = s.replace(/\s+/g, " ").trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1).trimEnd()}…` : limpio;
};

/** Imagen absoluta para la tarjeta: JPEG 1200×630 vía /api/og. */
function imagenTarjeta(src: string | undefined): string {
  if (!src || src === IMAGEN_PORTADA) return `${SITE_URL}${IMAGEN_PORTADA}`;
  return `${SITE_URL}/api/og?src=${encodeURIComponent(src)}`;
}

function fotoDePagina(p: MetaPagina, fotos: Contenido["fotos"]): { src?: string; alt: string } {
  if (!p.foto) return { alt: "Mente en Balance: Un espacio para volver a ti. Foto de María Ignacia Canessa." };
  const editada = fotos?.[p.foto];
  return { src: editada?.src ?? p.respaldo, alt: editada?.alt || p.tituloCompartir };
}

async function metaDe(rutaPedida: string): Promise<Meta> {
  const ruta = rutaPedida.toLowerCase().replace(/\/+$/, "") || "/";
  const fija = PAGINAS[ruta];
  const necesitaContenido = Boolean(fija?.foto) || ruta.startsWith("/diario/");
  const c = necesitaContenido ? await leerContenido() : null;

  if (fija) {
    const foto = fotoDePagina(fija, c?.fotos ?? {});
    return {
      titulo: fija.titulo,
      tituloCompartir: fija.tituloCompartir,
      descripcion: fija.descripcion,
      imagen: imagenTarjeta(foto.src),
      imagenAlt: foto.alt,
      ruta,
      tipo: "website",
      estado: 200,
    };
  }

  const slug = ruta.match(/^\/diario\/([a-z0-9-]+)$/)?.[1];
  const post = slug && c ? c.posts.find((p) => p.slug === slug && seVeEnElSitio(p, ahoraEnSantiago())) : undefined;
  if (post) {
    const respaldo = PAGINAS["/diario"];
    const editadaDiario = c?.fotos?.["diario-1"]?.src;
    return {
      titulo: `${post.titulo} | Diario | ${MARCA}`,
      tituloCompartir: post.titulo,
      descripcion: recortar(post.bajada || respaldo.descripcion, 200),
      imagen: imagenTarjeta(post.imagen || editadaDiario || respaldo.respaldo),
      imagenAlt: post.imagenAlt || post.titulo,
      ruta,
      tipo: "article",
      publicado: (post.publicarEl ?? post.fecha).slice(0, 10),
      estado: 200,
    };
  }

  // Dirección que no existe: 404 real y sin indexar
  return {
    titulo: `Página no encontrada | ${MARCA}`,
    tituloCompartir: MARCA,
    descripcion: PAGINAS["/"].descripcion,
    imagen: imagenTarjeta(IMAGEN_PORTADA),
    imagenAlt: MARCA,
    ruta,
    tipo: "website",
    estado: 404,
  };
}

/** Quita las etiquetas de <head> que se reemplazan y agrega las nuevas. */
export function aplicarMeta(html: string, m: Meta): string {
  const urlPagina = `${SITE_URL}${m.ruta === "/" ? "/" : m.ruta}`;
  const e = escapar;
  const etiquetas = [
    `<title>${e(m.titulo)}</title>`,
    `<meta name="description" content="${e(m.descripcion)}" />`,
    m.estado === 404 ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${e(urlPagina)}" />`,
    `<meta property="og:type" content="${m.tipo}" />`,
    `<meta property="og:site_name" content="${MARCA}" />`,
    `<meta property="og:locale" content="es_CL" />`,
    `<meta property="og:url" content="${e(urlPagina)}" />`,
    `<meta property="og:title" content="${e(m.tituloCompartir)}" />`,
    `<meta property="og:description" content="${e(m.descripcion)}" />`,
    `<meta property="og:image" content="${e(m.imagen)}" />`,
    `<meta property="og:image:secure_url" content="${e(m.imagen)}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${e(m.imagenAlt)}" />`,
    m.publicado && `<meta property="article:published_time" content="${m.publicado}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(m.tituloCompartir)}" />`,
    `<meta name="twitter:description" content="${e(m.descripcion)}" />`,
    `<meta name="twitter:image" content="${e(m.imagen)}" />`,
  ]
    .filter(Boolean)
    .map((t) => `    ${t}`)
    .join("\n");

  const limpio = html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+|article:[^"]+)"[\s\S]*?\/?>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[\s\S]*?\/?>/i, "");
  return limpio.replace(/<\/head>/i, `${etiquetas}\n  </head>`);
}

export async function GET(request: Request): Promise<Response> {
  const pedido = new URL(request.url);
  const ruta = (pedido.searchParams.get("ruta") ?? "/").slice(0, 300);
  let html: string;
  try {
    html = await leerPlantilla(pedido.origin);
  } catch {
    // Sin plantilla no hay nada que modificar: error temporal, el lector reintenta
    return new Response("Intenta de nuevo en unos minutos.", {
      status: 503,
      headers: { "Retry-After": "120", "Cache-Control": "no-store" },
    });
  }

  try {
    const meta = await metaDe(ruta.startsWith("/") ? ruta : `/${ruta}`);
    return new Response(aplicarMeta(html, meta), {
      status: meta.estado,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  }
}
