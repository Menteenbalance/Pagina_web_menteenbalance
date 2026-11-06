// ─────────────────────────────────────────────────────────────
//  CLAVE-VALOR PEQUEÑO (cuenta del panel)
//  Contraseña cambiada, versión de las sesiones, enlace de recuperación
//  y dispositivos conocidos.
//  - Producción: Upstash Redis (el mismo del contenido).
//  - Desarrollo sin Redis: .data/kv.json (ignorado por git).
// ─────────────────────────────────────────────────────────────

import { promises as fs } from "node:fs";
import path from "node:path";
import { enVercel, ErrorHttp } from "./http.js";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const hayRedis = Boolean(REDIS_URL && REDIS_TOKEN);
const ARCHIVO = path.join(process.cwd(), ".data", "kv.json");

async function redis(comando: string[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(comando),
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result;
}

type Local = Record<string, { v: string; exp?: number }>;

async function leerLocal(): Promise<Local> {
  try {
    const datos = JSON.parse(await fs.readFile(ARCHIVO, "utf8")) as Local;
    const ahora = Date.now();
    for (const [k, e] of Object.entries(datos)) if (e.exp && e.exp < ahora) delete datos[k];
    return datos;
  } catch {
    return {};
  }
}

async function escribirLocal(datos: Local): Promise<void> {
  await fs.mkdir(path.dirname(ARCHIVO), { recursive: true });
  await fs.writeFile(ARCHIVO, JSON.stringify(datos, null, 2), "utf8");
}

export async function kvGet(clave: string): Promise<string | null> {
  if (hayRedis) {
    const v = await redis(["GET", clave]);
    return typeof v === "string" ? v : null;
  }
  if (enVercel) return null;
  return (await leerLocal())[clave]?.v ?? null;
}

export async function kvSet(clave: string, valor: string, ttlSeg?: number): Promise<void> {
  if (hayRedis) {
    await redis(ttlSeg ? ["SET", clave, valor, "EX", String(ttlSeg)] : ["SET", clave, valor]);
    return;
  }
  if (enVercel) throw new ErrorHttp(503, "Falta conectar la base de datos (Upstash Redis) en Vercel.");
  const datos = await leerLocal();
  datos[clave] = { v: valor, ...(ttlSeg && { exp: Date.now() + ttlSeg * 1000 }) };
  await escribirLocal(datos);
}

export async function kvDel(clave: string): Promise<void> {
  if (hayRedis) {
    await redis(["DEL", clave]);
    return;
  }
  if (enVercel) return;
  const datos = await leerLocal();
  delete datos[clave];
  await escribirLocal(datos);
}
