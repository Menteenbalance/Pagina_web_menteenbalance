import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * En desarrollo (`npm run dev`) sirve /api/contact con la misma función
 * que usa Vercel en producción, para poder probar el formulario localmente.
 * Si no hay RESEND_API_KEY en .env.local, el correo se muestra en la consola.
 */
function apiLocal(): Plugin {
  return {
    name: "api-local",
    configureServer(server) {
      server.middlewares.use("/api/contact", async (req, res) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headers.set(k, v);
          }
          if (!headers.has("x-forwarded-for")) {
            headers.set("x-forwarded-for", req.socket.remoteAddress ?? "local");
          }
          const request = new Request("http://localhost/api/contact", {
            method: req.method,
            headers,
            body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
          });
          const mod = await server.ssrLoadModule("/api/contact.ts");
          const handler = mod[req.method ?? "GET"];
          const response: Response = handler
            ? await handler(request)
            : new Response("Método no permitido", { status: 405 });
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(await response.text());
        } catch (err) {
          server.config.logger.error(String(err));
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Error interno" }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga .env / .env.local también para el código de /api en desarrollo
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return { plugins: [react(), apiLocal()] };
});
