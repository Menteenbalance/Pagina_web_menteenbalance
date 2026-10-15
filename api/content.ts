// GET /api/content — contenido público del sitio (servicios, aranceles,
// agenda, publicaciones del diario y ajustes). Los borradores del
// diario no se incluyen y las actividades que se repiten se entregan
// ya convertidas en fechas de las próximas semanas.

import { leerContenido } from "./_lib/contenido.js";
import { expandirRecurrentes, hoyEnSantiago } from "../src/lib/recurrentes.js";
import { json, responderError } from "./_lib/http.js";

export async function GET(): Promise<Response> {
  try {
    const c = await leerContenido();
    return json(
      200,
      {
        ...c,
        // Las clases que se repiten llegan al sitio como fechas concretas
        agenda: [...c.agenda, ...expandirRecurrentes(c.recurrentes, hoyEnSantiago())],
        recurrentes: [],
        posts: c.posts.filter((p) => p.publicado),
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
