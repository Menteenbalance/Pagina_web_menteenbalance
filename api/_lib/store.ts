// ─────────────────────────────────────────────────────────────
//  ALMACENAMIENTO DEL CONTENIDO EDITABLE
//
//  Cada sección (servicios, aranceles, agenda, recurrentes, posts,
//  ajustes) se guarda como un documento JSON:
//  - En producción: Upstash Redis (mismo que usa el rate limit).
//  - En desarrollo sin Redis: archivos en .data/contenido/*.json
//    (ignorados por git), para poder probar el panel localmente.
// ─────────────────────────────────────────────────────────────

import { promises as fs } from "node:fs";
import path from "node:path";
import { enVercel, ErrorHttp } from "./http.js";

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const hayRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const PREFIJO = "meb:contenido:";
const PREFIJO_HISTORIAL = "meb:historial:";
const CARPETA_LOCAL = path.join(process.cwd(), ".data", "contenido");
const CARPETA_HISTORIAL = path.join(process.cwd(), ".data", "historial");

/** Versiones anteriores que se guardan por sección. */
export const MAX_HISTORIAL = 15;

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

// ── Historial de versiones ────────────────────────────────────
// Lista por sección, la más reciente primero. Cada elemento es un
// texto JSON con { fecha, autor, datos }.

/** Agrega una versión al inicio del historial y conserva solo las últimas. */
export async function agregarAlHistorial(seccion: string, entrada: unknown): Promise<void> {
  const texto = JSON.stringify(entrada);
  if (hayRedis) {
    await redis(["LPUSH", PREFIJO_HISTORIAL + seccion, texto]);
    await redis(["LTRIM", PREFIJO_HISTORIAL + seccion, "0", String(MAX_HISTORIAL - 1)]);
    return;
  }
  if (enVercel) return; // sin Redis tampoco se puede guardar contenido
  const lista = await leerHistorialCrudo(seccion);
  const nueva = [texto, ...lista].slice(0, MAX_HISTORIAL);
  await fs.mkdir(CARPETA_HISTORIAL, { recursive: true });
  await fs.writeFile(path.join(CARPETA_HISTORIAL, `${seccion}.json`), JSON.stringify(nueva), "utf8");
}

async function leerHistorialCrudo(seccion: string): Promise<string[]> {
  if (hayRedis) {
    const r = await redis(["LRANGE", PREFIJO_HISTORIAL + seccion, "0", String(MAX_HISTORIAL - 1)]);
    return Array.isArray(r) ? r.filter((x): x is string => typeof x === "string") : [];
  }
  if (enVercel) return [];
  try {
    const lista = JSON.parse(await fs.readFile(path.join(CARPETA_HISTORIAL, `${seccion}.json`), "utf8"));
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

/** Versiones anteriores de una sección, la más reciente primero. */
export async function leerHistorial<T>(seccion: string): Promise<T[]> {
  const crudo = await leerHistorialCrudo(seccion);
  return crudo.flatMap((t) => {
    try {
      return [JSON.parse(t) as T];
    } catch {
      return [];
    }
  });
}
