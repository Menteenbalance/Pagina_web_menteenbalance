// Lee todo el contenido editable, usando el contenido inicial del
// sitio (src/data.ts) para las secciones que aún no se han editado.

import { contenidoInicial } from "../../src/data";
import type { Contenido } from "../../src/types";
import { leer } from "./store";
import { SECCIONES } from "./validar";

export async function leerContenido(): Promise<Contenido> {
  const valores = await Promise.all(SECCIONES.map((s) => leer(s)));
  const contenido = { ...contenidoInicial } as Record<string, unknown>;
  SECCIONES.forEach((s, i) => {
    if (valores[i] !== null) contenido[s] = valores[i];
  });

  // Ajustes guardados con un formato anterior (ej: feed de Behold):
  // se completan con los valores iniciales campo por campo.
  const guardado = (contenido.ajustes ?? {}) as Partial<Contenido["ajustes"]>;
  contenido.ajustes = {
    instagram: {
      visible: guardado.instagram?.visible ?? contenidoInicial.ajustes.instagram.visible,
      texto:
        typeof guardado.instagram?.texto === "string"
          ? guardado.instagram.texto
          : contenidoInicial.ajustes.instagram.texto,
    },
  };
  return contenido as unknown as Contenido;
}
