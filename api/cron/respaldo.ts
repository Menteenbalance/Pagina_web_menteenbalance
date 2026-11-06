// GET /api/cron/respaldo — respaldo semanal automático (vercel.json → crons).
// Vercel lo llama cada lunes con "Authorization: Bearer <CRON_SECRET>";
// sin ese secreto no hace nada.

import { armarRespaldo, guardarRespaldoAutomatico } from "../_lib/respaldo.js";
import { json, responderError } from "../_lib/http.js";

export async function GET(request: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return json(401, { error: "No autorizado." }, { "Cache-Control": "no-store" });
  }
  try {
    const r = await armarRespaldo();
    const guardados = await guardarRespaldoAutomatico(r);
    console.log(`[respaldo] ${r.creado}: ${Object.keys(r.secciones).length} secciones; ${guardados} respaldos guardados`);
    return json(200, { ok: true, creado: r.creado, secciones: Object.keys(r.secciones), guardados }, { "Cache-Control": "no-store" });
  } catch (err) {
    console.error("[respaldo] falló:", err);
    return responderError(err);
  }
}
