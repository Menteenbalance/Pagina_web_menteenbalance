// ─────────────────────────────────────────────────────────────
//  RESPALDOS DEL CONTENIDO
//  Un respaldo es un JSON con todas las secciones editadas desde el panel
//  (lo que está guardado en Redis). Se crea solo cada semana (api/cron/
//  respaldo.ts) y se puede descargar o restaurar desde el panel.
//  Las secciones que nunca se editaron no aparecen: el sitio usa para
//  ellas el contenido original del código.
// ─────────────────────────────────────────────────────────────

import { del, list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { guardarConHistorial } from "./historial.js";
import { enVercel, ErrorHttp } from "./http.js";
import { leer } from "./store.js";
import { SECCIONES, validar, type Seccion } from "./validar.js";
import { hoyEnSantiago } from "../../src/lib/recurrentes.js";

export const SITIO_RESPALDO = "Mente en Balance";
/** Respaldos automáticos que se conservan (12 semanas) */
export const RESPALDOS_A_GUARDAR = 12;
const CARPETA_BLOB = "respaldos/";
const CARPETA_LOCAL = path.join(process.cwd(), ".data", "respaldos");

export interface Respaldo {
  sitio: typeof SITIO_RESPALDO;
  version: 1;
  creado: string;
  secciones: Partial<Record<Seccion, unknown>>;
}

export interface RespaldoGuardado {
  fecha: string;
  url: string;
  bytes: number;
}

export async function armarRespaldo(): Promise<Respaldo> {
  const valores = await Promise.all(SECCIONES.map((s) => leer<unknown>(s)));
  const secciones: Respaldo["secciones"] = {};
  SECCIONES.forEach((s, i) => {
    if (valores[i] !== null) secciones[s] = valores[i];
  });
  return { sitio: SITIO_RESPALDO, version: 1, creado: new Date().toISOString(), secciones };
}

/**
 * Restaura un respaldo. Primero valida TODAS las secciones (si una falla,
 * no se cambia nada) y luego guarda cada una con historial, así que
 * restaurar se puede deshacer pestaña por pestaña.
 */
export async function restaurarRespaldo(datos: unknown, autor: string): Promise<Seccion[]> {
  const r = datos as Partial<Respaldo> | null;
  if (!r || typeof r !== "object" || r.sitio !== SITIO_RESPALDO || !r.secciones || typeof r.secciones !== "object") {
    throw new ErrorHttp(400, "El archivo no es un respaldo de Mente en Balance.");
  }
  const limpias: [Seccion, unknown][] = [];
  for (const s of SECCIONES) {
    if (!(s in r.secciones)) continue;
    try {
      limpias.push([s, validar(s, (r.secciones as Record<string, unknown>)[s])]);
    } catch (err) {
      throw new ErrorHttp(422, `El respaldo tiene un problema en "${s}": ${(err as Error).message}`);
    }
  }
  if (limpias.length === 0) throw new ErrorHttp(400, "El respaldo no tiene contenido para restaurar.");
  for (const [s, v] of limpias) await guardarConHistorial(s, v, autor);
  return limpias.map(([s]) => s);
}

// ── Dónde se guardan los respaldos automáticos ──────────────────

function opcionesBlob() {
  const storeId = process.env.FOTOS_BLOB_STORE_ID?.trim() || undefined;
  const hay = Boolean(storeId || process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
  return { hay, extra: storeId ? { storeId } : {} };
}

/** Guarda el respaldo y borra los más antiguos. Devuelve cuántos quedan. */
export async function guardarRespaldoAutomatico(r: Respaldo): Promise<number> {
  const nombre = `respaldo-${hoyEnSantiago()}.json`;
  const texto = JSON.stringify(r);
  const blob = opcionesBlob();

  if (blob.hay) {
    // Sufijo aleatorio: la dirección no se puede adivinar
    await put(`${CARPETA_BLOB}${nombre}`, texto, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
      ...blob.extra,
    });
    const { blobs } = await list({ prefix: CARPETA_BLOB, ...blob.extra });
    const ordenados = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
    const sobran = ordenados.slice(RESPALDOS_A_GUARDAR).map((b) => b.url);
    if (sobran.length) await del(sobran, blob.extra);
    return Math.min(ordenados.length, RESPALDOS_A_GUARDAR);
  }

  if (enVercel) throw new ErrorHttp(503, "Falta conectar Vercel Blob para guardar respaldos.");
  await fs.mkdir(CARPETA_LOCAL, { recursive: true });
  await fs.writeFile(path.join(CARPETA_LOCAL, nombre), texto, "utf8");
  const archivos = (await fs.readdir(CARPETA_LOCAL)).filter((f) => f.endsWith(".json")).sort().reverse();
  for (const f of archivos.slice(RESPALDOS_A_GUARDAR)) await fs.unlink(path.join(CARPETA_LOCAL, f));
  return Math.min(archivos.length, RESPALDOS_A_GUARDAR);
}

/** Respaldos automáticos disponibles, el más reciente primero. */
export async function listarRespaldos(): Promise<RespaldoGuardado[]> {
  const blob = opcionesBlob();
  if (blob.hay) {
    const { blobs } = await list({ prefix: CARPETA_BLOB, ...blob.extra });
    return blobs
      .map((b) => ({ fecha: new Date(b.uploadedAt).toISOString(), url: b.url, bytes: b.size }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  if (enVercel) return [];
  try {
    const archivos = (await fs.readdir(CARPETA_LOCAL)).filter((f) => f.endsWith(".json")).sort().reverse();
    return Promise.all(
      archivos.map(async (f) => {
        const st = await fs.stat(path.join(CARPETA_LOCAL, f));
        return { fecha: st.mtime.toISOString(), url: `/api/admin/respaldo?local=${encodeURIComponent(f)}`, bytes: st.size };
      })
    );
  } catch {
    return [];
  }
}

/** Solo desarrollo: contenido de un respaldo local. */
export async function leerRespaldoLocal(nombre: string): Promise<string | null> {
  if (enVercel || !/^respaldo-\d{4}-\d{2}-\d{2}\.json$/.test(nombre)) return null;
  try {
    return await fs.readFile(path.join(CARPETA_LOCAL, nombre), "utf8");
  } catch {
    return null;
  }
}
