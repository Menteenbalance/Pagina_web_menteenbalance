// ─────────────────────────────────────────────────────────────
//  CORREOS DEL PANEL (Resend, vía su API REST, sin dependencias)
//  Solo se escribe a la administradora (ADMIN_EMAIL).
//
//  Variables:
//    RESEND_API_KEY     la crea la integración de Resend en Vercel
//    CORREO_REMITENTE   opcional; por defecto
//                       "Mente en Balance <panel@menteenbalance.cl>"
//                       (debe ser de un dominio verificado en Resend)
//  Sin RESEND_API_KEY: en desarrollo el correo se muestra en la consola;
//  en Vercel se registra un aviso y no se envía.
// ─────────────────────────────────────────────────────────────

import { enVercel } from "./http.js";

const REMITENTE = process.env.CORREO_REMITENTE?.trim() || "Mente en Balance <panel@menteenbalance.cl>";

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface Correo {
  para: string;
  asunto: string;
  /** Párrafos del mensaje (texto plano; se escapan) */
  parrafos: string[];
  /** Botón opcional */
  boton?: { texto: string; url: string };
  /** Datos en lista (ej: fecha, dispositivo) */
  datos?: [string, string][];
}

function armarHtml(c: Correo): string {
  const p = c.parrafos
    .map((t) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a2430">${escapar(t)}</p>`)
    .join("");
  const datos = c.datos?.length
    ? `<table style="margin:4px 0 18px;font-size:14px;color:#2a2430" cellpadding="4">${c.datos
        .map(([k, v]) => `<tr><td style="color:#736a62;padding-right:14px">${escapar(k)}</td><td>${escapar(v)}</td></tr>`)
        .join("")}</table>`
    : "";
  const boton = c.boton
    ? `<p style="margin:8px 0 22px"><a href="${escapar(c.boton.url)}" style="display:inline-block;background:#067a7a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px">${escapar(c.boton.texto)}</a></p>`
    : "";
  return `<!doctype html><html lang="es"><body style="margin:0;background:#fbf8f2;font-family:Montserrat,Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-family:Georgia,serif;font-size:20px;margin:0 0 22px;color:#2a2430">Mente en Balance</p>
${p}${datos}${boton}
<p style="margin:26px 0 0;font-size:12px;color:#736a62">Correo automático del panel de administración de menteenbalance.cl.</p>
</div></body></html>`;
}

function armarTexto(c: Correo): string {
  return [
    ...c.parrafos,
    ...(c.datos ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(c.boton ? [`${c.boton.texto}: ${c.boton.url}`] : []),
  ].join("\n\n");
}

/** Envía el correo. Devuelve false si no se pudo (nunca lanza error). */
export async function enviarCorreo(c: Correo): Promise<boolean> {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) {
    if (enVercel) console.warn(`[correo] Falta RESEND_API_KEY: no se envió "${c.asunto}".`);
    else console.log(`\n[correo de prueba] Para: ${c.para}\nAsunto: ${c.asunto}\n\n${armarTexto(c)}\n`);
    return !enVercel;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: REMITENTE, to: [c.para], subject: c.asunto, html: armarHtml(c), text: armarTexto(c) }),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) {
      console.error(`[correo] Resend respondió ${r.status}: ${(await r.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[correo] No se pudo enviar:", err);
    return false;
  }
}
