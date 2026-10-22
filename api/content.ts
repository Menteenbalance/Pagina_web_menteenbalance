// GET /api/content — contenido público del sitio (servicios, aranceles,
// agenda, publicaciones del diario y ajustes).
// - Los borradores y las publicaciones programadas para más tarde no se
//   incluyen: las programadas aparecen solas a su hora (se filtra al leer,
//   sin tareas programadas).
// - Las actividades que se repiten se entregan ya convertidas en fechas
//   de las próximas semanas.

import { leerContenido } from "./_lib/contenido.js";
import { expandirRecurrentes, hoyEnSantiago } from "../src/lib/recurrentes.js";
import { ahoraEnSantiago, seVeEnElSitio } from "../src/lib/tiempo.js";
import { json, responderError } from "./_lib/http.js";

export async function GET(): Promise<Response> {
  try {
    const c = await leerContenido();
    const ahora = ahoraEnSantiago();
    return json(
      200,
      {
        ...c,
        // Las clases que se repiten llegan al sitio como fechas concretas
        agenda: [...c.agenda, ...expandirRecurrentes(c.recurrentes, hoyEnSantiago())],
        recurrentes: [],
        // Borradores y publicaciones programadas para más tarde no se envían
        posts: c.posts.filter((p) => seVeEnElSitio(p, ahora)),
      },
      {
        // CDN de Vercel: sirve una copia por 30 s y la renueva en segundo plano
        "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300",
      }
    );
  } catch (err) {
    return responderError(err);
  }
}
