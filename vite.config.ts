import { existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * En desarrollo (`npm run dev`) sirve las funciones de /api con el mismo
 * código que usa Vercel en producción:
 *   /api/contact        → api/contact.ts
 *   /api/admin/session  → api/admin/session.ts   (etc.)
 * Sin Upstash ni Resend configurados, todo funciona en modo local:
 * el contenido se guarda en .data/ y los correos se muestran en consola.
 */
function apiLocal(): Plugin {
  return {
    name: "api-local",
    configureServer(server) {
      // Fotos subidas desde el panel en modo local (en producción van a Vercel Blob)
      server.middlewares.use("/uploads", (req, res, next) => {
        const ruta = (req.url ?? "").split("?")[0];
        if (!/^\/[\w/-]+\.(webp|jpg|png)$/.test(ruta) || ruta.includes("..")) return next();
        const archivo = path.join(server.config.root, "public", "uploads", ruta);
        if (!existsSync(archivo)) return next();
        const ext = ruta.split(".").pop();
        res.setHeader("Content-Type", ext === "jpg" ? "image/jpeg" : `image/${ext}`);
        createReadStream(archivo).pipe(res);
      });

      server.middlewares.use("/api", async (req, res) => {
        const ruta = (req.url ?? "/").split("?")[0].replace(/\/+$/, "");
        const archivo = path.join(server.config.root, "api", `${ruta}.ts`);
        // Solo rutas simples; las carpetas que empiezan con _ son internas.
        // Nada bajo /api se sirve como archivo (igual que en Vercel).
        if (!/^(\/[a-z0-9-]+)+$/i.test(ruta) || ruta.includes("/_") || !existsSync(archivo)) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "No encontrado" }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headers.set(k, v);
            else if (Array.isArray(v)) headers.set(k, v.join(", "));
          }
          if (!headers.has("x-forwarded-for")) {
            headers.set("x-forwarded-for", req.socket.remoteAddress ?? "local");
          }
          const metodo = req.method ?? "GET";
          const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url}`, {
            method: metodo,
            headers,
            body: metodo === "GET" || metodo === "HEAD" ? undefined : Buffer.concat(chunks),
          });
          const mod = await server.ssrLoadModule(archivo);
          const handler = mod[metodo];
          const response: Response = handler
            ? await handler(request)
            : new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405 });
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.config.logger.error(String((err as Error)?.stack ?? err));
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
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
  return {
    plugins: [react(), apiLocal()],
    server: {
      // No recargar la página cuando el panel guarda contenido o fotos locales
      watch: { ignored: ["**/.data/**", "**/public/uploads/**"] },
    },
  };
});
