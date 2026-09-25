// Llamadas del panel a la API de administración.

import type { Contenido } from "../types";

export type Seccion = "servicios" | "aranceles" | "agenda" | "posts" | "ajustes";

export class ErrorApi extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function pedir<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "same-origin",
      ...init,
      headers: { "X-MEB-Admin": "1", ...(init.headers ?? {}) },
    });
  } catch {
    throw new ErrorApi(0, "Sin conexión. Revisa tu internet e inténtalo otra vez.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ErrorApi(res.status, data.error ?? "No se pudo completar la acción.");
  }
  return data as T;
}

export const api = {
  sesion: () => pedir<{ email: string }>("/api/admin/session"),

  entrar: (email: string, password: string) =>
    pedir<{ email: string }>("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  salir: () => pedir<{ ok: true }>("/api/admin/session", { method: "DELETE" }),

  contenido: () => pedir<Contenido>("/api/admin/content"),

  guardar: <T>(seccion: Seccion, datos: T) =>
    pedir<{ ok: true; datos: T }>("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seccion, datos }),
    }),

  subirImagen: (archivo: Blob) =>
    pedir<{ url: string }>("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": archivo.type },
      body: archivo,
    }),
};
