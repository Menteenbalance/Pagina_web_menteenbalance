// GET /api/content — contenido público del sitio (servicios, aranceles,
// agenda, publicaciones del diario y ajustes). Los borradores del
// diario no se incluyen.

import { leerContenido } from "./_lib/contenido";
import { json, responderError } from "./_lib/http";

export async function GET(): Promise<Response> {
  try {
    const c = await leerContenido();
    return json(
      200,
      { ...c, posts: c.posts.filter((p) => p.publicado) },
      {
        // CDN de Vercel: sirve una copia por 30 s y la renueva en segundo plano
        "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300",
      }
    );
  } catch (err) {
    return responderError(err);
  }
}
