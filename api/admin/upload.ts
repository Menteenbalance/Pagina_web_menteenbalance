// POST /api/admin/upload (requiere sesión)
// Sube una imagen para el diario. El panel la comprime antes a WebP
// (máx. 1600 px), así que llega liviana.
// - Producción: Vercel Blob. Los stores nuevos se autentican con OIDC
//   (BLOB_STORE_ID + token temporal que Vercel entrega solo); los antiguos,
//   con BLOB_READ_WRITE_TOKEN. El SDK elige el método automáticamente.
// - Desarrollo sin Blob: public/uploads/ (ignorado por git).

import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { exigirAdmin } from "../_lib/auth";
import { enVercel, ErrorHttp, json, responderError } from "../_lib/http";

const TIPOS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const MAX_BYTES = 4 * 1024 * 1024; // límite de Vercel: 4,5 MB por petición

export async function POST(request: Request): Promise<Response> {
  try {
    exigirAdmin(request);

    const tipo = (request.headers.get("content-type") ?? "").split(";")[0].trim();
    const ext = TIPOS[tipo];
    if (!ext) throw new ErrorHttp(415, "Formato no permitido. Usa JPG, PNG o WebP.");

    const datos = new Uint8Array(await request.arrayBuffer());
    if (datos.byteLength === 0) throw new ErrorHttp(400, "La imagen está vacía.");
    if (datos.byteLength > MAX_BYTES) throw new ErrorHttp(413, "La imagen pesa demasiado (máx. 4 MB).");

    const nombre = `diario/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(nombre, Buffer.from(datos), {
          access: "public",
          contentType: tipo,
          addRandomSuffix: false,
        });
        return json(200, { url: blob.url });
      } catch (err) {
        console.error("[upload] Vercel Blob rechazó la subida:", err);
        throw new ErrorHttp(
          502,
          "No se pudo guardar la foto. Revisa en Vercel que el Blob Store sea de acceso público."
        );
      }
    }

    if (enVercel) {
      throw new ErrorHttp(
        503,
        "Falta conectar el almacenamiento de imágenes (Vercel Blob). Por ahora no se pueden subir fotos."
      );
    }

    const destino = path.join(process.cwd(), "public", "uploads", nombre);
    await fs.mkdir(path.dirname(destino), { recursive: true });
    await fs.writeFile(destino, datos);
    return json(200, { url: `/uploads/${nombre}` });
  } catch (err) {
    return responderError(err);
  }
}
