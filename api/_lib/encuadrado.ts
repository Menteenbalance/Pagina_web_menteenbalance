// ─────────────────────────────────────────────────────────────
//  RESEÑAS DESDE ENCUADRADO
//
//  Encuadrado no tiene una API pública, así que se lee la página
//  pública del perfil y se extraen las evaluaciones visibles.
//  Se intenta, en orden:
//    1. Datos estructurados (JSON-LD de schema.org), si los publican.
//    2. El HTML de la sección "Evaluaciones": cada reseña es un
//       título con el nombre, seguido de "5 de 5", "· Mes AAAA" y
//       el comentario.
//  Si nada calza, se lanza un error y quien llama usa la última copia
//  buena o la copia de respaldo de src/data.ts.
// ─────────────────────────────────────────────────────────────

import type { Resena, ResenasEncuadrado } from "../../src/types.js";

export const PERFIL_ENCUADRADO = "https://encuadrado.com/p/maria-ignacia-canessa";

const MESES = "enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre";
const ENTIDADES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", iexcl: "¡", iquest: "¿",
};

function decodificar(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTIDADES[e] ?? m;
  });
}

/** HTML → líneas de texto (los bloques pasan a saltos de línea). */
export function aLineas(html: string): string[] {
  const texto = html
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li|ul|ol|section|article|header|footer|span|time|blockquote)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/<[^>]*$/, " "); // etiqueta cortada al final
  return decodificar(texto)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function nota(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

const recortar = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

function limpiar(r: Partial<Resena>): Resena | null {
  const texto = (r.texto ?? "").trim();
  const n = nota(r.nota);
  if (!texto || n === null) return null;
  return {
    nombre: recortar((r.nombre ?? "").trim() || "Usuario anónimo", 60),
    nota: n,
    fecha: recortar((r.fecha ?? "").trim(), 30),
    texto: recortar(texto, 1500),
  };
}

// ── 1. JSON-LD ────────────────────────────────────────────────
function desdeJsonLd(html: string): Omit<ResenasEncuadrado, "actualizado"> | null {
  const bloques = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const resenas: Resena[] = [];
  let promedio: number | null = null;
  let total: number | null = null;
  const fechaLegible = (iso: unknown) => {
    const d = new Date(String(iso ?? ""));
    if (Number.isNaN(d.getTime())) return "";
    const t = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    return t.replace(" de ", " ").replace(/^./, (c) => c.toUpperCase());
  };
  const visitar = (n: unknown): void => {
    if (Array.isArray(n)) return n.forEach(visitar);
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (o.aggregateRating && typeof o.aggregateRating === "object") {
      const a = o.aggregateRating as Record<string, unknown>;
      promedio = nota(a.ratingValue) ?? promedio;
      const c = Number(a.reviewCount ?? a.ratingCount);
      if (Number.isInteger(c)) total = c;
    }
    if (o["@type"] === "Review" || o.reviewBody) {
      const autor = o.author as Record<string, unknown> | string | undefined;
      const rating = o.reviewRating as Record<string, unknown> | undefined;
      const r = limpiar({
        nombre: typeof autor === "string" ? autor : String(autor?.name ?? ""),
        nota: rating?.ratingValue as number,
        fecha: fechaLegible(o.datePublished),
        texto: decodificar(String(o.reviewBody ?? o.description ?? "")),
      });
      if (r) resenas.push(r);
    }
    Object.values(o).forEach(visitar);
  };
  for (const b of bloques) {
    try {
      visitar(JSON.parse(b[1]));
    } catch {
      /* bloque inválido: se ignora */
    }
  }
  return resenas.length ? { promedio, total, resenas } : null;
}

// ── 2. HTML de la sección "Evaluaciones" ─────────────────────
function desdeHtml(html: string): Omit<ResenasEncuadrado, "actualizado"> | null {
  const inicio = html.search(/<h[1-3][^>]*>(?:(?!<\/h[1-3]>)[\s\S])*Evaluaciones(?:(?!<\/h[1-3]>)[\s\S])*<\/h[1-3]>/i);
  if (inicio < 0) return null;
  let seccion = html.slice(inicio);
  // Termina en la paginación ("Anterior · 1 · 2 · Siguiente") o en el pie
  const fin = seccion.search(/<[^<>]*>\s*(Anterior|Siguiente)\s*<|<footer\b/i);
  if (fin > 0) seccion = seccion.slice(0, fin);

  const encabezado = aLineas(seccion.split(/<h[3-6]\b/i)[0]).join(" ");
  const total = Number(encabezado.match(/Basado en\s+(\d+)\s+evaluaci/i)?.[1] ?? NaN);
  const promedio = nota(encabezado.match(/\b([1-5][.,]\d)\b/)?.[1]);

  const resenas: Resena[] = [];
  const partes = seccion.split(/(?=<h[3-6]\b)/i).slice(1);
  for (const parte of partes) {
    const cierre = parte.search(/<\/h[3-6]>/i);
    if (cierre < 0) continue;
    const nombre = aLineas(parte.slice(0, cierre)).join(" ");
    const lineas = aLineas(parte.slice(cierre));
    let n: number | null = null;
    let fecha = "";
    const texto: string[] = [];
    const reNota = /\b([1-5](?:[.,]\d)?)\s*de\s*5\b/i;
    const reFecha = new RegExp(`\\b((?:${MESES})(?:\\s+de)?\\s+\\d{4})\\b`, "i");
    for (const l of lineas) {
      // Una línea es "meta" si, quitando nota, fecha y separadores, no queda nada
      const mNota = l.match(reNota);
      const mFecha = l.match(reFecha);
      const resto = l.replace(reNota, "").replace(reFecha, "").replace(/estrellas?/i, "");
      if ((mNota || mFecha) && /^[·•|\-\s]*$/.test(resto)) {
        if (mNota && n === null) n = nota(mNota[1]);
        if (mFecha && !fecha) fecha = mFecha[1].replace(/\s+de\s+/i, " ").replace(/^./, (c) => c.toUpperCase());
      } else if (/^[·•|\-\s\d]*$/.test(l) || /^(Anterior|Siguiente|Ver más|Comentarios|Todas)$/i.test(l)) {
        continue;
      } else {
        texto.push(l);
      }
    }
    const r = limpiar({ nombre, nota: n ?? undefined, fecha, texto: texto.join(" ") });
    if (r) resenas.push(r);
  }
  return resenas.length
    ? { promedio, total: Number.isInteger(total) ? total : null, resenas }
    : null;
}

/** Extrae las reseñas de la página de Encuadrado (o lanza un error si no puede). */
export function extraerResenas(html: string): Omit<ResenasEncuadrado, "actualizado"> {
  const datos = desdeJsonLd(html) ?? desdeHtml(html);
  if (!datos) throw new Error("No se encontraron reseñas en la página de Encuadrado.");
  return datos;
}

/** Descarga la página pública del perfil y devuelve sus reseñas. */
export async function leerResenasDeEncuadrado(): Promise<ResenasEncuadrado> {
  const res = await fetch(PERFIL_ENCUADRADO, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MenteEnBalanceSitio/1.0; +https://menteenbalance.cl)",
      Accept: "text/html",
      "Accept-Language": "es-CL,es;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Encuadrado respondió ${res.status}.`);
  return { ...extraerResenas(await res.text()), actualizado: new Date().toISOString() };
}
