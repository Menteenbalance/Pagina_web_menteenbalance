// ─────────────────────────────────────────────────────────────
//  ALMACENAMIENTO DEL CONTENIDO EDITABLE
//
//  Cada sección (servicios, aranceles, agenda, posts, ajustes) se
//  guarda como un documento JSON:
//  - En producción: Upstash Redis (mismo que usa el rate limit).
//  - En desarrollo sin Redis: archivos en .data/contenido/*.json
//    (ignorados por git), para poder probar el panel localmente.
// ─────────────────────────────────────────────────────────────

import { promises as fs } from "node:fs";
import path from "node:path";
import { enVercel, ErrorHttp } from "./http";

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const hayRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const PREFIJO = "meb:contenido:";
const CARPETA_LOCAL = path.join(process.cwd(), ".data", "contenido");

async function redis(comando: string[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comando),
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || data.error) {
    throw new Error(`Redis: ${data.error ?? res.status}`);
  }
  return data.result;
}

/** Lee una sección. Devuelve null si nunca se ha guardado. */
export async function leer<T>(seccion: string): Promise<T | null> {
  if (hayRedis) {
    const valor = await redis(["GET", PREFIJO + seccion]);
    return typeof valor === "string" ? (JSON.parse(valor) as T) : null;
  }
  if (enVercel) return null; // sin Redis en Vercel: se usa el contenido inicial
  try {
    const texto = await fs.readFile(path.join(CARPETA_LOCAL, `${seccion}.json`), "utf8");
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
}

/** Guarda una sección completa. */
export async function guardar(seccion: string, datos: unknown): Promise<void> {
  const texto = JSON.stringify(datos);
  if (hayRedis) {
    await redis(["SET", PREFIJO + seccion, texto]);
    return;
  }
  if (enVercel) {
    throw new ErrorHttp(
      503,
      "Falta conectar la base de datos (Upstash Redis) en Vercel. Los cambios no se pueden guardar todavía."
    );
  }
  await fs.mkdir(CARPETA_LOCAL, { recursive: true });
  await fs.writeFile(path.join(CARPETA_LOCAL, `${seccion}.json`), texto, "utf8");
}
