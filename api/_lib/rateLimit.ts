// ─────────────────────────────────────────────────────────────
//  RATE LIMIT del formulario de contacto
//
//  Cuenta envíos por identificador de visitante en ventanas fijas.
//  - En producción usa Upstash Redis (vía REST, sin dependencias),
//    para que el límite se comparta entre todas las instancias.
//  - Si Redis no está configurado, cae a memoria (solo sirve en
//    desarrollo: en Vercel cada instancia tendría su propio contador).
// ─────────────────────────────────────────────────────────────

export interface Limite {
  /** Nombre corto, se usa en la clave de Redis (ej: "ip-10m") */
  nombre: string;
  /** Máximo de envíos permitidos dentro de la ventana */
  max: number;
  /** Duración de la ventana en segundos */
  ventanaSeg: number;
}

export interface ResultadoLimite {
  permitido: boolean;
  /** Segundos que faltan para poder volver a enviar (si fue bloqueado) */
  reintentarEnSeg: number;
}

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const redisConfigurado = Boolean(REDIS_URL && REDIS_TOKEN);

// ── Contador en Redis ──────────────────────────────────────────
async function incrementarRedis(
  clave: string,
  ventanaSeg: number
): Promise<{ cuenta: number; ttl: number }> {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", clave],
      ["EXPIRE", clave, String(ventanaSeg), "NX"],
      ["TTL", clave],
    ]),
  });
  if (!res.ok) throw new Error(`Redis respondió ${res.status}`);
  const data = (await res.json()) as { result?: number; error?: string }[];
  const [incr, , ttl] = data;
  if (incr?.error) throw new Error(incr.error);
  return { cuenta: Number(incr?.result ?? 0), ttl: Number(ttl?.result ?? ventanaSeg) };
}

// ── Contador en memoria (fallback de desarrollo) ───────────────
const memoria = new Map<string, { cuenta: number; expira: number }>();

function incrementarMemoria(clave: string, ventanaSeg: number) {
  const ahora = Date.now();
  const actual = memoria.get(clave);
  if (!actual || actual.expira <= ahora) {
    memoria.set(clave, { cuenta: 1, expira: ahora + ventanaSeg * 1000 });
    return { cuenta: 1, ttl: ventanaSeg };
  }
  actual.cuenta += 1;
  return { cuenta: actual.cuenta, ttl: Math.ceil((actual.expira - ahora) / 1000) };
}

/**
 * Registra un intento para cada identificador y límite.
 * Se bloquea si CUALQUIERA de los contadores supera su máximo.
 */
export async function revisarLimites(
  identificadores: { tipo: string; valor: string; limites: Limite[] }[]
): Promise<ResultadoLimite> {
  let reintentarEnSeg = 0;

  for (const id of identificadores) {
    for (const limite of id.limites) {
      const clave = `meb:contacto:${id.tipo}:${limite.nombre}:${id.valor}`;
      const { cuenta, ttl } = redisConfigurado
        ? await incrementarRedis(clave, limite.ventanaSeg)
        : incrementarMemoria(clave, limite.ventanaSeg);

      if (cuenta > limite.max) {
        reintentarEnSeg = Math.max(reintentarEnSeg, ttl > 0 ? ttl : limite.ventanaSeg);
      }
    }
  }

  return { permitido: reintentarEnSeg === 0, reintentarEnSeg };
}

/** SHA-256 en hex. Se usa para no guardar IPs en texto plano. */
export async function hash(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
