// /api/admin/respaldo (requiere sesión)
//   GET              → descarga un respaldo de todo el contenido (ahora)
//   GET ?lista=1     → respaldos automáticos semanales disponibles
//   POST {respaldo}  → restaura un respaldo (cada sección queda en el
//                      historial, así que se puede deshacer)

import { exigirAdmin } from "../_lib/auth.js";
import { ErrorHttp, json, responderError } from "../_lib/http.js";
import { armarRespaldo, leerRespaldoLocal, listarRespaldos, restaurarRespaldo } from "../_lib/respaldo.js";
import { hoyEnSantiago } from "../../src/lib/recurrentes.js";

const SIN_CACHE = { "Cache-Control": "no-store" };

export async function GET(request: Request): Promise<Response> {
  try {
    await exigirAdmin(request);
    const q = new URL(request.url).searchParams;
    if (q.get("lista")) return json(200, { respaldos: await listarRespaldos() }, SIN_CACHE);

    const local = q.get("local");
    const texto = local ? await leerRespaldoLocal(local) : JSON.stringify(await armarRespaldo(), null, 2);
    if (texto === null) throw new ErrorHttp(404, "Ese respaldo no existe.");
    const nombre = local ?? `respaldo-menteenbalance-${hoyEnSantiago()}.json`;
    return new Response(texto, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nombre}"`,
        ...SIN_CACHE,
      },
    });
  } catch (err) {
    return responderError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const email = await exigirAdmin(request);
    const body = (await request.json().catch(() => null)) as { respaldo?: unknown } | null;
    const restauradas = await restaurarRespaldo(body?.respaldo, email);
    return json(200, { ok: true, restauradas }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}
