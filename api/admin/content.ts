// /api/admin/content (requiere sesión)
//   GET → todo el contenido, incluidos los borradores del diario
//   PUT → guarda una sección { seccion, datos }

import { exigirAdmin } from "../_lib/auth";
import { leerContenido } from "../_lib/contenido";
import { json, responderError, ErrorHttp } from "../_lib/http";
import { guardar } from "../_lib/store";
import { esSeccion, validar } from "../_lib/validar";

const SIN_CACHE = { "Cache-Control": "no-store" };

export async function GET(request: Request): Promise<Response> {
  try {
    exigirAdmin(request);
    return json(200, await leerContenido(), SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}

export async function PUT(request: Request): Promise<Response> {
  try {
    exigirAdmin(request);
    const body = (await request.json().catch(() => null)) as {
      seccion?: unknown;
      datos?: unknown;
    } | null;
    if (!body || !esSeccion(body.seccion)) {
      throw new ErrorHttp(400, "Sección desconocida.");
    }
    const limpio = validar(body.seccion, body.datos);
    await guardar(body.seccion, limpio);
    return json(200, { ok: true, datos: limpio }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}
