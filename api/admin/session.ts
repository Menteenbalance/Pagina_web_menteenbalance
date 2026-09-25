// /api/admin/session
//   GET    → ¿hay sesión? { email }
//   POST   → iniciar sesión { email, password }
//   DELETE → cerrar sesión

import {
  authConfigurada,
  cookieDeCierre,
  cookieDeSesion,
  credencialesValidas,
  leerSesion,
} from "../_lib/auth.js";
import { json, obtenerIp, responderError } from "../_lib/http.js";
import { hash, revisarLimites } from "../_lib/rateLimit.js";

export async function GET(request: Request): Promise<Response> {
  const email = leerSesion(request);
  return email ? json(200, { email }) : json(401, { error: "Sin sesión." });
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (!authConfigurada) {
      return json(503, {
        error: "El acceso de administración aún no está configurado en el servidor.",
      });
    }

    // Máximo 8 intentos cada 15 minutos por IP (frena ataques de fuerza bruta)
    const ip = (await hash(`login:${obtenerIp(request)}`)).slice(0, 32);
    const { permitido, reintentarEnSeg } = await revisarLimites([
      { tipo: "login", valor: ip, limites: [{ nombre: "15m", max: 8, ventanaSeg: 15 * 60 }] },
    ]);
    if (!permitido) {
      return json(
        429,
        {
          error: `Demasiados intentos. Espera ${Math.ceil(reintentarEnSeg / 60)} minutos e inténtalo de nuevo.`,
        },
        { "Retry-After": String(reintentarEnSeg) }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      password?: unknown;
    };
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!credencialesValidas(email, password)) {
      return json(401, { error: "Correo o contraseña incorrectos." });
    }
    return json(
      200,
      { email: email.trim().toLowerCase() },
      { "Set-Cookie": cookieDeSesion(request, email.trim().toLowerCase()) }
    );
  } catch (err) {
    return responderError(err);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  return json(200, { ok: true }, { "Set-Cookie": cookieDeCierre(request) });
}
