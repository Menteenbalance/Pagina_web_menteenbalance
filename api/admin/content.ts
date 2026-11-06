// /api/admin/content (requiere sesión)
//   GET → todo el contenido, incluidos los borradores del diario
//   PUT → guarda una sección { seccion, datos }

import { exigirAdmin } from "../_lib/auth.js";
import { leerContenido } from "../_lib/contenido.js";
import { json, responderError, ErrorHttp } from "../_lib/http.js";
import { guardarConHistorial } from "../_lib/historial.js";
import { esSeccion, validar } from "../_lib/validar.js";

const SIN_CACHE = { "Cache-Control": "no-store" };

export async function GET(request: Request): Promise<Response> {
  try {
    await exigirAdmin(request);
    return json(200, await leerContenido(), SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}

export async function PUT(request: Request): Promise<Response> {
  try {
    const email = await exigirAdmin(request);
    const body = (await request.json().catch(() => null)) as {
      seccion?: unknown;
      datos?: unknown;
    } | null;
    if (!body || !esSeccion(body.seccion)) {
      throw new ErrorHttp(400, "Sección desconocida.");
    }
    const limpio = validar(body.seccion, body.datos);
    await guardarConHistorial(body.seccion, limpio, email);
    return json(200, { ok: true, datos: limpio }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}
