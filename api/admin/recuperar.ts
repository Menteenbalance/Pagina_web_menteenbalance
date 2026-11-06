// /api/admin/recuperar  (sin sesión)
//   POST { email }          → si es el correo de la administradora, le envía
//                             un enlace de un solo uso (válido 15 minutos).
//                             La respuesta es siempre la misma, para no
//                             revelar qué correo es el correcto.
//   PUT  { token, clave }   → guarda la contraseña nueva y cierra todas
//                             las sesiones abiertas.

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { authConfigurada, cambiarClave, correoAdmin, esCorreoAdmin } from "../_lib/auth.js";
import { avisarClaveCambiada } from "../_lib/avisos.js";
import { SITE_URL } from "../_lib/config.js";
import { enviarCorreo } from "../_lib/correo.js";
import { ErrorHttp, json, obtenerIp, responderError } from "../_lib/http.js";
import { kvDel, kvGet, kvSet } from "../_lib/kv.js";
import { hash, revisarLimites } from "../_lib/rateLimit.js";

const CLAVE_TOKEN = "meb:auth:recuperar";
const VIGENCIA_SEG = 15 * 60;
export const LARGO_MINIMO = 12;
const SIN_CACHE = { "Cache-Control": "no-store" };

const huella = (token: string) => createHash("sha256").update(token).digest("hex");

function exigirEncabezado(request: Request) {
  if (request.headers.get("x-meb-admin") !== "1") throw new ErrorHttp(403, "Solicitud no permitida.");
  if (!authConfigurada) throw new ErrorHttp(503, "El acceso de administración aún no está configurado.");
}

async function limitar(request: Request, tipo: string, max: number, ventanaSeg: number) {
  const ip = (await hash(`${tipo}:${obtenerIp(request)}`)).slice(0, 32);
  const { permitido, reintentarEnSeg } = await revisarLimites([
    { tipo, valor: ip, limites: [{ nombre: "ventana", max, ventanaSeg }] },
    { tipo, valor: "global", limites: [{ nombre: "dia", max: 30, ventanaSeg: 24 * 60 * 60 }] },
  ]);
  if (!permitido) {
    throw new ErrorHttp(429, `Demasiados intentos. Espera ${Math.ceil(reintentarEnSeg / 60)} minutos e inténtalo de nuevo.`);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    exigirEncabezado(request);
    await limitar(request, "recuperar", 3, 60 * 60);
    const body = (await request.json().catch(() => ({}))) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email : "";

    if (esCorreoAdmin(email)) {
      const token = randomBytes(32).toString("base64url");
      await kvSet(CLAVE_TOKEN, huella(token), VIGENCIA_SEG);
      await enviarCorreo({
        para: correoAdmin,
        asunto: "Crea una contraseña nueva para el panel",
        parrafos: [
          "Pediste cambiar la contraseña del panel de Mente en Balance.",
          "Usa este botón dentro de los próximos 15 minutos. El enlace sirve una sola vez. Si no lo pediste, ignora este correo: tu contraseña sigue igual.",
        ],
        boton: { texto: "Crear contraseña nueva", url: `${SITE_URL}/admin/nueva-clave#${token}` },
      });
    }
    return json(200, { ok: true }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}

export async function PUT(request: Request): Promise<Response> {
  try {
    exigirEncabezado(request);
    await limitar(request, "nueva-clave", 10, 15 * 60);
    const body = (await request.json().catch(() => ({}))) as { token?: unknown; clave?: unknown };
    const token = typeof body.token === "string" ? body.token : "";
    const clave = typeof body.clave === "string" ? body.clave : "";

    const guardada = await kvGet(CLAVE_TOKEN);
    const valido =
      Boolean(guardada && token) &&
      timingSafeEqual(Buffer.from(huella(token)), Buffer.from(guardada!.padEnd(64, "0").slice(0, 64)));
    if (!valido) throw new ErrorHttp(400, "El enlace venció o ya se usó. Pide uno nuevo desde la pantalla de inicio de sesión.");

    if (clave.length < LARGO_MINIMO) throw new ErrorHttp(422, `La contraseña debe tener al menos ${LARGO_MINIMO} caracteres.`);
    if (clave.length > 200) throw new ErrorHttp(422, "La contraseña es demasiado larga.");

    await kvDel(CLAVE_TOKEN); // un solo uso
    await cambiarClave(clave);
    await avisarClaveCambiada(request);
    return json(200, { ok: true }, SIN_CACHE);
  } catch (err) {
    return responderError(err);
  }
}
