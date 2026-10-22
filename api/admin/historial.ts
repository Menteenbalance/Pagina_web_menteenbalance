// /api/admin/historial (requiere sesión)
//   GET  ?seccion=agenda           → versiones anteriores (la más reciente primero)
//   POST { seccion, fecha }        → restaura esa versión (y guarda la actual
//                                    en el historial, para poder deshacer)

import { exigirAdmin } from "../_lib/auth.js";
import { guardarConHistorial, historialDe } from "../_lib/historial.js";
import { json, responderError, ErrorHttp } from "../_lib/http.js";
import { esSeccion, validar } from "../_lib/validar.js";

const SIN_CACHE = { "Cache-Control": "no-store" };

export async function GET(request: Request): Promise<Response> {
  try {
    exigirAdmin(request);
    const seccion = new URL(request.url).searchParams.get("seccion");
    if (!esSeccion(seccion)) throw new ErrorHttp(400, "Sección desconocida.");
    return json(200, { versiones: await historialDe(seccion) }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const email = exigirAdmin(request);
    const body = (await request.json().catch(() => null)) as { seccion?: unknown; fecha?: unknown } | null;
    if (!body || !esSeccion(body.seccion)) throw new ErrorHttp(400, "Sección desconocida.");
    const version = (await historialDe(body.seccion)).find((v) => v.fecha === body.fecha);
    if (!version) throw new ErrorHttp(404, "Esa versión ya no está en el historial.");
    // Se valida de nuevo por si el formato cambió desde que se guardó
    const limpio = validar(body.seccion, version.datos);
    await guardarConHistorial(body.seccion, limpio, email);
    return json(200, { ok: true, datos: limpio }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}
