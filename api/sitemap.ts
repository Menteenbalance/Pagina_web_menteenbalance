// GET /sitemap.xml (vercel.json lo reescribe a /api/sitemap)
// Mapa del sitio para Google: páginas fijas + publicaciones del Diario que
// ya se ven en el sitio (con texto propio). Se genera al momento, así que
// una publicación nueva o programada aparece sola, sin tocar código.

import { leerContenido } from "./_lib/contenido.js";
import { SITE_URL } from "./_lib/config.js";
import { ahoraEnSantiago, seVeEnElSitio } from "../src/lib/tiempo.js";
import { responderError } from "./_lib/http.js";

/** Páginas fijas, en orden de importancia. */
const PAGINAS: { ruta: string; prioridad: string; frecuencia: string }[] = [
  { ruta: "/", prioridad: "1.0", frecuencia: "weekly" },
  { ruta: "/servicios", prioridad: "0.9", frecuencia: "monthly" },
  { ruta: "/detras-de-mente-en-balance", prioridad: "0.8", frecuencia: "monthly" },
  { ruta: "/agenda", prioridad: "0.8", frecuencia: "weekly" },
  { ruta: "/diario", prioridad: "0.7", frecuencia: "weekly" },
  { ruta: "/contacto", prioridad: "0.6", frecuencia: "yearly" },
  { ruta: "/privacidad", prioridad: "0.2", frecuencia: "yearly" },
];

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function entrada(ruta: string, extra: { lastmod?: string; prioridad?: string; frecuencia?: string }): string {
  return [
    "  <url>",
    `    <loc>${escapar(SITE_URL + ruta)}</loc>`,
    extra.lastmod && `    <lastmod>${extra.lastmod}</lastmod>`,
    extra.frecuencia && `    <changefreq>${extra.frecuencia}</changefreq>`,
    extra.prioridad && `    <priority>${extra.prioridad}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET(): Promise<Response> {
  try {
    const { posts } = await leerContenido();
    const ahora = ahoraEnSantiago();
    const visibles = posts
      .filter((p) => p.cuerpo?.trim() && /^[a-z0-9-]+$/.test(p.slug) && seVeEnElSitio(p, ahora))
      .map((p) => ({ slug: p.slug, fecha: (p.publicarEl ?? p.fecha).slice(0, 10) }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    const ultima = visibles[0]?.fecha;
    const urls = [
      ...PAGINAS.map((p) =>
        entrada(p.ruta, {
          prioridad: p.prioridad,
          frecuencia: p.frecuencia,
          lastmod: p.ruta === "/diario" || p.ruta === "/" ? ultima : undefined,
        })
      ),
      ...visibles.map((p) => entrada(`/diario/${p.slug}`, { lastmod: p.fecha, prioridad: "0.6", frecuencia: "yearly" })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return responderError(err);
  }
}
