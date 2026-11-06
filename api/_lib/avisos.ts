// ─────────────────────────────────────────────────────────────
//  AVISOS DE SEGURIDAD DEL PANEL (por correo a la administradora)
//  - Inicio de sesión desde un navegador o dispositivo nuevo.
//  - Contraseña cambiada.
//  Los dispositivos conocidos se guardan como huella (navegador + sistema),
//  sin IP ni datos personales.
// ─────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { correoAdmin } from "./auth.js";
import { SITE_URL } from "./config.js";
import { enviarCorreo } from "./correo.js";
import { kvGet, kvSet } from "./kv.js";

const DISPOSITIVOS = "meb:auth:dispositivos";
const MAX_DISPOSITIVOS = 20;

/** "Chrome en Windows", "Safari en iPhone"… a partir del user-agent. */
export function describirDispositivo(ua: string): string {
  const sistema =
    /iPhone/.test(ua) ? "iPhone" :
    /iPad/.test(ua) ? "iPad" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X|Macintosh/.test(ua) ? "Mac" :
    /CrOS/.test(ua) ? "ChromeOS" :
    /Linux/.test(ua) ? "Linux" : "otro sistema";
  const navegador =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /SamsungBrowser/.test(ua) ? "Samsung Internet" :
    /Firefox\/|FxiOS/.test(ua) ? "Firefox" :
    /Chrome\/|CriOS/.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" : "otro navegador";
  return `${navegador} en ${sistema}`;
}

function ubicacion(request: Request): string {
  const h = request.headers;
  const ciudad = h.get("x-vercel-ip-city");
  const pais = h.get("x-vercel-ip-country");
  const partes = [ciudad && decodeURIComponent(ciudad), pais].filter(Boolean);
  return partes.length ? `${partes.join(", ")} (aproximada)` : "desconocida";
}

const ahoraEnChile = () =>
  new Date().toLocaleString("es-CL", { timeZone: "America/Santiago", dateStyle: "full", timeStyle: "short" });

const enlaceRecuperar = () => `${SITE_URL}/admin?recuperar=1`;

/** Tras un inicio de sesión correcto: avisa si el dispositivo es nuevo. Nunca lanza error. */
export async function avisarInicioDeSesion(request: Request): Promise<void> {
  try {
    const dispositivo = describirDispositivo(request.headers.get("user-agent") ?? "");
    const huella = createHash("sha256").update(dispositivo).digest("hex").slice(0, 16);
    const conocidos = JSON.parse((await kvGet(DISPOSITIVOS)) ?? "[]") as string[];
    if (conocidos.includes(huella)) return;
    await kvSet(DISPOSITIVOS, JSON.stringify([huella, ...conocidos].slice(0, MAX_DISPOSITIVOS)));
    await enviarCorreo({
      para: correoAdmin,
      asunto: "Nuevo inicio de sesión en el panel de Mente en Balance",
      parrafos: [
        "Se inició sesión en el panel de administración desde un dispositivo o navegador que no se había usado antes.",
        "Si fuiste tú, no tienes que hacer nada. Si no reconoces este inicio de sesión, cambia tu contraseña ahora: al hacerlo se cierran todas las sesiones abiertas.",
      ],
      datos: [
        ["Fecha", ahoraEnChile()],
        ["Dispositivo", dispositivo],
        ["Ubicación", ubicacion(request)],
      ],
      boton: { texto: "Cambiar mi contraseña", url: enlaceRecuperar() },
    });
  } catch (err) {
    console.error("[avisos] No se pudo revisar el dispositivo:", err);
  }
}

export async function avisarClaveCambiada(request: Request): Promise<void> {
  await enviarCorreo({
    para: correoAdmin,
    asunto: "Tu contraseña del panel cambió",
    parrafos: [
      "La contraseña del panel de Mente en Balance se cambió correctamente y se cerraron todas las sesiones abiertas.",
      "Si no fuiste tú, pide un nuevo enlace de recuperación ahora y avísale a quien administra el sitio.",
    ],
    datos: [
      ["Fecha", ahoraEnChile()],
      ["Dispositivo", describirDispositivo(request.headers.get("user-agent") ?? "")],
      ["Ubicación", ubicacion(request)],
    ],
    boton: { texto: "Ir al panel", url: `${SITE_URL}/admin` },
  });
}
