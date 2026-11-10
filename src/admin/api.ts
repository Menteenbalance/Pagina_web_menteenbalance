// Llamadas del panel a la API de administración.

import type { Contenido, VersionHistorial } from "../types";

export type Seccion = "servicios" | "aranceles" | "agenda" | "recurrentes" | "posts" | "ajustes" | "fotos" | "comunidad" | "textos" | "formacion" | "enlaces";

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
    // Errores que responde Vercel antes de llegar a la función (sin JSON)
    const porEstado: Record<number, string> = {
      413: "La foto pesa demasiado para subirla. Prueba con otra o recórtala.",
      502: "El servidor no respondió bien. Inténtalo de nuevo en un momento.",
      503: "El servicio no está disponible ahora. Inténtalo de nuevo en un momento.",
      504: "Tardó demasiado en responder. Revisa tu conexión e inténtalo otra vez.",
    };
    throw new ErrorApi(res.status, data.error ?? porEstado[res.status] ?? `No se pudo completar la acción (error ${res.status}).`);
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

  historial: (seccion: Seccion) =>
    pedir<{ versiones: VersionHistorial[] }>(`/api/admin/historial?seccion=${seccion}`),

  restaurar: <T>(seccion: Seccion, fecha: string) =>
    pedir<{ ok: true; datos: T }>("/api/admin/historial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seccion, fecha }),
    }),

  subirImagen: (archivo: Blob, carpeta: "diario" | "fotos" = "diario") =>
    pedir<{ url: string }>(`/api/admin/upload?carpeta=${carpeta}`, {
      method: "POST",
      headers: { "Content-Type": archivo.type },
      body: archivo,
    }),
};

export interface RespaldoGuardado {
  fecha: string;
  url: string;
  bytes: number;
}

export const apiRespaldo = {
  lista: () => pedir<{ respaldos: RespaldoGuardado[] }>("/api/admin/respaldo?lista=1"),
  restaurar: (respaldo: unknown) =>
    pedir<{ ok: true; restauradas: Seccion[] }>("/api/admin/respaldo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respaldo }),
    }),
};
