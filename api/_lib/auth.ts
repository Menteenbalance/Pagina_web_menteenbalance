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
//    ADMIN_PASSWORD   contraseña (larga; solo vive en Vercel)
//    SESSION_SECRET   texto aleatorio largo para firmar la cookie
// ─────────────────────────────────────────────────────────────

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { enVercel, ErrorHttp } from "./http.js";

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

export function credencialesValidas(email: string, password: string): boolean {
  if (!authConfigurada) return false;
  // Se evalúan ambas siempre, para no revelar cuál falló
  const okEmail = iguales(email.trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const okPass = iguales(password, ADMIN_PASSWORD);
  return okEmail && okPass;
}

function esSeguro(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto === "https";
  return new URL(request.url).protocol === "https:";
}

/** Cookie Set-Cookie para iniciar sesión. */
export function cookieDeSesion(request: Request, email: string): string {
  const payload = b64url(
    JSON.stringify({ e: email, exp: Math.floor(Date.now() / 1000) + DURACION_SEG })
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
export function leerSesion(request: Request): string | null {
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
      exp: number;
    };
    if (datos.exp < Date.now() / 1000) return null;
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
export function exigirAdmin(request: Request): string {
  const email = leerSesion(request);
  if (!email) throw new ErrorHttp(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
  if (request.method !== "GET" && request.headers.get("x-meb-admin") !== "1") {
    throw new ErrorHttp(403, "Solicitud no permitida.");
  }
  return email;
}
