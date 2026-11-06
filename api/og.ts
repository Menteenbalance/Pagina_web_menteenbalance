// GET /api/og?src=<foto>
// Convierte una foto del sitio en la imagen de la vista previa al compartir:
// JPEG de 1200×630 (el formato que WhatsApp, Instagram y Facebook muestran
// siempre; las fotos del sitio están en WebP). Vercel guarda el resultado en
// su caché, así que cada foto se convierte una sola vez.
//
// Solo acepta fotos del propio sitio (/img/, /uploads/) o del Blob de Vercel:
// no sirve como proxy de imágenes ajenas.

import sharp from "sharp";
import { IMAGEN_PORTADA } from "../src/lib/paginas.js";

const LOCAL = /^\/(img|uploads)\/[\w./-]+\.(webp|jpe?g|png)$/i;
const BLOB = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./-]+\.(webp|jpe?g|png)$/i;
const MAX_BYTES = 15 * 1024 * 1024;

function respaldo(): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: IMAGEN_PORTADA, "Cache-Control": "public, max-age=0, s-maxage=300" },
  });
}

export async function GET(request: Request): Promise<Response> {
  const pedido = new URL(request.url);
  const src = pedido.searchParams.get("src") ?? "";
  if (src.includes("..") || !(LOCAL.test(src) || BLOB.test(src))) {
    return new Response("Imagen no permitida.", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const origen = src.startsWith("/") ? new URL(src, pedido.origin) : new URL(src);
    const r = await fetch(origen, { signal: AbortSignal.timeout(8000) });
    const tipo = r.headers.get("content-type") ?? "";
    if (!r.ok || !tipo.startsWith("image/")) return respaldo();
    const datos = Buffer.from(await r.arrayBuffer());
    if (datos.byteLength > MAX_BYTES) return respaldo();

    const jpeg = await sharp(datos)
      .rotate()
      .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        // Cada foto subida tiene una dirección única: se puede guardar mucho tiempo
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
      },
    });
  } catch {
    return respaldo();
  }
}
