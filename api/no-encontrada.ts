// Respuesta para cualquier dirección bajo /api que no existe.
// - Navegador (pide HTML): lo lleva a la página 404 del sitio.
// - Programas (piden JSON): error 404 en JSON, en español.
// vercel.json envía aquí todo /api/... que no coincide con una función.

function responder(request: Request): Response {
  // vercel.json entrega la ruta original en ?ruta= (sin el prefijo /api/)
  const capturada = new URL(request.url).searchParams.get("ruta") ?? "";
  const ruta = `/api/${capturada}`.replace(/\/+$/, "") || "/api";

  const aceptaHtml = (request.headers.get("accept") ?? "").includes("text/html");
  if (request.method === "GET" && aceptaHtml) {
    const destino = `/pagina-no-encontrada?ruta=${encodeURIComponent(ruta.slice(0, 200))}`;
    return new Response(null, { status: 302, headers: { Location: destino, "Cache-Control": "no-store" } });
  }
  return new Response(JSON.stringify({ error: "No encontrado." }), {
    status: 404,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const GET = responder;
export const POST = responder;
export const PUT = responder;
export const PATCH = responder;
export const DELETE = responder;
