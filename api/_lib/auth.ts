// ─────────────────────────────────────────────────────────────
//  SESIÓN DE ADMINISTRACIÓN
//
//  Una sola cuenta de administración (Mari), definida por variables
//  de entorno. La sesión es una cookie firmada con HMAC-SHA256:
//  HttpOnly (JavaScript no puede leerla), SameSite=Strict (no viaja
//  en peticiones desde otros sitios) y Secure en producción.
//
//  Variables:
//    ADMIN_EMAIL      correo con el que entra la administradora
//    ADMIN_PASSWORD   contraseña inicial (larga; solo vive en Vercel)
//    SESSION_SECRET   texto aleatorio largo para firmar la cookie
//
//  Si Mari cambia su contraseña con "¿Olvidaste tu contraseña?", la
//  nueva se guarda cifrada (scrypt) en Redis y reemplaza a ADMIN_PASSWORD.
//  Cada cambio sube la "versión" de las sesiones: todas las sesiones
//  abiertas se cierran.
// ─────────────────────────────────────────────────────────────

import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { enVercel, ErrorHttp } from "./http.js";
import { kvGet, kvSet } from "./kv.js";

const CLAVE_GUARDADA = "meb:auth:clave";
const VERSION_SESION = "meb:auth:version";

const COOKIE = "meb_admin";
const DURACION_SEG = 7 * 24 * 60 * 60; // 7 días

// En desarrollo local hay credenciales de prueba si no se definieron.
// En Vercel son obligatorias: sin ellas nadie puede entrar.
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? (enVercel ? "" : "admin@local");
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? (enVercel ? "" : "balance-local");
const SECRETO =
  process.env.SESSION_SECRET ?? (enVercel ? "" : "secreto-solo-para-desarrollo");

export const authConfigurada = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD && SECRETO);

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function firmar(datos: string): string {
  return createHmac("sha256", SECRETO).update(datos).digest("base64url");
}

/** Compara textos en tiempo constante (evita ataques de tiempo). */
function iguales(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Correo de la administradora (en minúsculas). */
export const correoAdmin = ADMIN_EMAIL.trim().toLowerCase();

export function esCorreoAdmin(email: string): boolean {
  return Boolean(correoAdmin) && iguales(email.trim().toLowerCase(), correoAdmin);
}

function cifrar(clave: string): string {
  const sal = randomBytes(16);
  const h = scryptSync(clave, sal, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt:${sal.toString("base64url")}:${h.toString("base64url")}`;
}

function coincide(clave: string, guardada: string): boolean {
  const [tipo, sal, h] = guardada.split(":");
  if (tipo !== "scrypt" || !sal || !h) return false;
  const calculado = scryptSync(clave, Buffer.from(sal, "base64url"), 32, { N: 16384, r: 8, p: 1 });
  const esperado = Buffer.from(h, "base64url");
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

export async function credencialesValidas(email: string, password: string): Promise<boolean> {
  if (!authConfigurada) return false;
  // Se evalúan ambas siempre, para no revelar cuál falló
  const okEmail = esCorreoAdmin(email);
  const guardada = await kvGet(CLAVE_GUARDADA);
  const okPass = guardada ? coincide(password, guardada) : iguales(password, ADMIN_PASSWORD);
  return okEmail && okPass;
}

/** Versión actual de las sesiones ("0" si la contraseña nunca se cambió). */
async function versionActual(): Promise<string> {
  return (await kvGet(VERSION_SESION)) ?? "0";
}

/** Guarda una contraseña nueva y cierra todas las sesiones abiertas. */
export async function cambiarClave(nueva: string): Promise<void> {
  await kvSet(CLAVE_GUARDADA, cifrar(nueva));
  await kvSet(VERSION_SESION, Date.now().toString(36));
}

function esSeguro(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto === "https";
  return new URL(request.url).protocol === "https:";
}

/** Cookie Set-Cookie para iniciar sesión. */
export async function cookieDeSesion(request: Request, email: string): Promise<string> {
  const payload = b64url(
    JSON.stringify({ e: email, v: await versionActual(), exp: Math.floor(Date.now() / 1000) + DURACION_SEG })
  );
  const token = `${payload}.${firmar(payload)}`;
  return [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${DURACION_SEG}`,
    esSeguro(request) ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/** Cookie Set-Cookie que borra la sesión. */
export function cookieDeCierre(request: Request): string {
  return [
    `${COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
    esSeguro(request) ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/** Devuelve el correo de la sesión, o null si no hay sesión válida. */
export async function leerSesion(request: Request): Promise<string | null> {
  if (!authConfigurada) return null;
  const cookies = request.headers.get("cookie") ?? "";
  const token = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!token) return null;

  const [payload, firma] = token.split(".");
  if (!payload || !firma || !iguales(firma, firmar(payload))) return null;

  try {
    const datos = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      e: string;
      v?: string;
      exp: number;
    };
    if (datos.exp < Date.now() / 1000) return null;
    // Sesiones abiertas antes del último cambio de contraseña ya no valen
    if ((datos.v ?? "0") !== (await versionActual())) return null;
    return datos.e;
  } catch {
    return null;
  }
}

/**
 * Exige sesión válida. En peticiones que modifican datos exige además
 * el encabezado X-MEB-Admin: un sitio externo no puede enviarlo sin
 * que el navegador lo bloquee (protección CSRF adicional a SameSite).
 */
export async function exigirAdmin(request: Request): Promise<string> {
  const email = await leerSesion(request);
  if (!email) throw new ErrorHttp(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
  if (request.method !== "GET" && request.headers.get("x-meb-admin") !== "1") {
    throw new ErrorHttp(403, "Solicitud no permitida.");
  }
  return email;
}
