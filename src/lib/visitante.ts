// ID anónimo del navegador, usado solo para el rate limit del formulario.
// No contiene datos personales: es un número aleatorio guardado en este
// navegador. Si el almacenamiento está bloqueado, se usa uno por sesión.

const CLAVE = "meb:visitante";
let enMemoria: string | null = null;

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Respaldo para navegadores antiguos (formato UUID v4)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function obtenerVisitanteId(): string {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return guardado;
    const id = nuevoId();
    localStorage.setItem(CLAVE, id);
    return id;
  } catch {
    enMemoria ??= nuevoId();
    return enMemoria;
  }
}
