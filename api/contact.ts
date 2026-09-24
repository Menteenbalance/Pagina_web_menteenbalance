// ─────────────────────────────────────────────────────────────
//  POST /api/contact — Formulario de contacto de Mente en Balance
//
//  1. Valida los datos (y descarta bots con honeypot + tiempo mínimo).
//  2. Aplica rate limit por visitante (IP anonimizada + ID de navegador).
//  3. Envía el mensaje por correo usando Resend.
//
//  Variables de entorno (Vercel → Settings → Environment Variables):
//    RESEND_API_KEY            (obligatoria en producción)
//    CONTACT_TO_EMAIL          destinatario (por defecto el de abajo)
//    CONTACT_FROM_EMAIL        remitente, de un dominio verificado en Resend
//    UPSTASH_REDIS_REST_URL    / KV_REST_API_URL    (rate limit compartido)
//    UPSTASH_REDIS_REST_TOKEN  / KV_REST_API_TOKEN
//    RATE_LIMIT_SALT           texto secreto para anonimizar IPs
// ─────────────────────────────────────────────────────────────

import { hash, revisarLimites, redisConfigurado, type Limite } from "./_lib/rateLimit";

const DESTINO = process.env.CONTACT_TO_EMAIL ?? "ignaciacanessa@menteenbalance.com";
const REMITENTE =
  process.env.CONTACT_FROM_EMAIL ?? "Mente en Balance <formulario@menteenbalance.com>";

// Límites por visitante. La IP tiene algo más de margen porque varias
// personas pueden compartirla (oficina, universidad, red móvil).
const LIMITES_VISITANTE: Limite[] = [
  { nombre: "10m", max: 3, ventanaSeg: 10 * 60 },
  { nombre: "24h", max: 8, ventanaSeg: 24 * 60 * 60 },
];
const LIMITES_IP: Limite[] = [
  { nombre: "10m", max: 5, ventanaSeg: 10 * 60 },
  { nombre: "24h", max: 15, ventanaSeg: 24 * 60 * 60 },
];
// Tope global diario: protege la bandeja y la cuota de Resend ante un ataque.
const LIMITE_GLOBAL: Limite[] = [{ nombre: "24h", max: 150, ventanaSeg: 24 * 60 * 60 }];

const INTERESES = [
  "Terapia individual",
  "Vinyasa Yoga",
  "Meditación",
  "Experiencias y talleres",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Un humano no llena el formulario en menos de esto. */
const TIEMPO_MINIMO_MS = 3000;

interface Payload {
  nombre?: unknown;
  email?: unknown;
  interes?: unknown;
  mensaje?: unknown;
  /** Campo trampa: invisible para personas, los bots lo llenan */
  empresa?: unknown;
  /** Momento en que se mostró el formulario (ms) */
  inicio?: unknown;
  /** ID anónimo del navegador (localStorage) */
  visitante?: unknown;
}

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function escaparHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function obtenerIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip")?.trim() ||
    "desconocida"
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return json(400, { error: "Solicitud inválida." });
  }

  // ── Anti-bots: se responde "ok" para no darles pistas ─────────
  const inicio = Number(body.inicio);
  const esBot =
    texto(body.empresa, 200) !== "" ||
    !Number.isFinite(inicio) ||
    Date.now() - inicio < TIEMPO_MINIMO_MS;
  if (esBot) return json(200, { ok: true });

  // ── Validación ────────────────────────────────────────────────
  const nombre = texto(body.nombre, 100);
  const email = texto(body.email, 254);
  const interes = texto(body.interes, 60);
  const mensaje = texto(body.mensaje, 3000);

  const errores: Record<string, string> = {};
  if (nombre.length < 2) errores.nombre = "Escribe tu nombre.";
  if (!EMAIL_RE.test(email)) errores.email = "Revisa tu correo, parece incompleto.";
  if (!INTERESES.includes(interes as (typeof INTERESES)[number]))
    errores.interes = "Elige una opción.";
  if (mensaje.length < 10)
    errores.mensaje = "Cuéntanos un poco más (al menos 10 caracteres).";
  if (Object.keys(errores).length > 0) return json(422, { errores });

  // ── Rate limit ────────────────────────────────────────────────
  const sal = process.env.RATE_LIMIT_SALT ?? "mente-en-balance";
  const ipHash = (await hash(`${sal}:${obtenerIp(request)}`)).slice(0, 32);
  const visitante = texto(body.visitante, 36);

  const identificadores = [
    { tipo: "ip", valor: ipHash, limites: LIMITES_IP },
    { tipo: "global", valor: "todos", limites: LIMITE_GLOBAL },
  ];
  if (UUID_RE.test(visitante)) {
    identificadores.push({ tipo: "vid", valor: visitante.toLowerCase(), limites: LIMITES_VISITANTE });
  }

  try {
    const { permitido, reintentarEnSeg } = await revisarLimites(identificadores);
    if (!permitido) {
      return json(
        429,
        {
          error: "Recibimos varios mensajes seguidos desde este dispositivo.",
          reintentarEnSeg,
        },
        { "Retry-After": String(reintentarEnSeg) }
      );
    }
  } catch (err) {
    // Si Redis falla, preferimos dejar pasar el mensaje antes que perderlo.
    console.error("[contacto] rate limit no disponible:", err);
  }
  if (!redisConfigurado) {
    console.warn("[contacto] Redis no configurado: rate limit solo en memoria.");
  }

  // ── Envío del correo ──────────────────────────────────────────
  const asunto = `Nuevo mensaje web · ${interes} · ${nombre}`;
  const textoPlano = [
    `Nombre: ${nombre}`,
    `Correo: ${email}`,
    `Le interesa: ${interes}`,
    "",
    mensaje,
    "",
    "— Enviado desde el formulario de menteenbalance",
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#2a2430;line-height:1.6">
      <p style="margin:0 0 4px"><strong>Nombre:</strong> ${escaparHtml(nombre)}</p>
      <p style="margin:0 0 4px"><strong>Correo:</strong> <a href="mailto:${escaparHtml(email)}">${escaparHtml(email)}</a></p>
      <p style="margin:0 0 16px"><strong>Le interesa:</strong> ${escaparHtml(interes)}</p>
      <p style="white-space:pre-wrap;margin:0">${escaparHtml(mensaje)}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0 8px" />
      <p style="font-size:12px;color:#736a62;margin:0">Enviado desde el formulario de contacto de Mente en Balance. Responde a este correo para contestarle directamente.</p>
    </div>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Desarrollo: sin clave, se muestra el correo en la consola.
    console.info(`[contacto] (simulado, falta RESEND_API_KEY) → ${DESTINO}\n${asunto}\n${textoPlano}`);
    return json(200, { ok: true, simulado: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [DESTINO],
        reply_to: email,
        subject: asunto,
        text: textoPlano,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[contacto] Resend respondió", res.status, await res.text());
      return json(502, { error: "No pudimos enviar tu mensaje." });
    }
  } catch (err) {
    console.error("[contacto] error al enviar:", err);
    return json(502, { error: "No pudimos enviar tu mensaje." });
  }

  return json(200, { ok: true });
}
