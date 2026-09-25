// Utilidades HTTP compartidas por las funciones de /api.

export function json(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

/** IP del visitante (Vercel la entrega en estos encabezados). */
export function obtenerIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip")?.trim() ||
    "desconocida"
  );
}

/** true cuando corre en Vercel (producción o preview). */
export const enVercel = Boolean(process.env.VERCEL);

export class ErrorHttp extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Convierte cualquier error en una respuesta JSON con mensaje en español. */
export function responderError(err: unknown): Response {
  if (err instanceof ErrorHttp) return json(err.status, { error: err.message });
  console.error("[api] error inesperado:", err);
  return json(500, { error: "Ocurrió un error inesperado. Inténtalo de nuevo." });
}
