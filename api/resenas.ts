// GET /api/resenas — reseñas del perfil de Encuadrado para el Inicio.
//
// - Se leen desde Encuadrado como máximo cada 6 horas; la última copia
//   buena se guarda (Redis en producción, .data/ en local).
// - Si Encuadrado no responde o cambió su página, se entrega la última
//   copia buena; si nunca hubo una, la copia de respaldo de src/data.ts.
//   El Inicio nunca queda con el bloque vacío por un error externo.

import { resenasRespaldo } from "../src/data.js";
import type { ResenasEncuadrado } from "../src/types.js";
import { leerResenasDeEncuadrado } from "./_lib/encuadrado.js";
import { json } from "./_lib/http.js";
import { guardar, leer } from "./_lib/store.js";

const CLAVE = "resenas-encuadrado";
const VIGENCIA_MS = 6 * 60 * 60 * 1000;

export async function GET(): Promise<Response> {
  const copia = await leer<ResenasEncuadrado>(CLAVE).catch(() => null);
  const edad = copia ? Date.now() - new Date(copia.actualizado).getTime() : Infinity;

  let datos: ResenasEncuadrado;
  let origen: "encuadrado" | "copia" | "respaldo";
  if (copia && edad < VIGENCIA_MS) {
    datos = copia;
    origen = "copia";
  } else {
    try {
      datos = await leerResenasDeEncuadrado();
      origen = "encuadrado";
      await guardar(CLAVE, datos).catch(() => {});
    } catch (err) {
      console.warn("[resenas]", (err as Error).message);
      datos = copia ?? resenasRespaldo;
      origen = copia ? "copia" : "respaldo";
    }
  }

  return json(
    200,
    { ...datos, origen },
    {
      // CDN de Vercel: una copia por hora y se renueva en segundo plano
      "Cache-Control": `public, max-age=0, s-maxage=${origen === "respaldo" ? 600 : 3600}, stale-while-revalidate=86400`,
    }
  );
}
