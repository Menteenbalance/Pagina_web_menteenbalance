// Piezas para mostrar los textos editables del sitio (pestaña Textos del panel).

import { Fragment } from "react";
import { useTexto } from "../lib/contenido";
import { TextoConFormato } from "../lib/texto";
import type { ClaveTexto } from "../lib/textos";

/** Texto de una línea (va dentro del elemento que lo contiene). */
export function Linea({ clave }: { clave: ClaveTexto }) {
  return <>{useTexto(clave)}</>;
}

/** Título que puede ir en varias líneas: cada salto de línea es un <br>. */
export function Titulo({ clave }: { clave: ClaveTexto }) {
  const lineas = useTexto(clave).split("\n");
  return (
    <>
      {lineas.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {l}
        </Fragment>
      ))}
    </>
  );
}

/** Párrafos (con **negrita**, *cursiva* y enlaces, como el Diario). */
export function Parrafos({ clave }: { clave: ClaveTexto }) {
  return <TextoConFormato texto={useTexto(clave)} />;
}

/** Una frase por línea, como elementos de una lista. */
export function useLista(clave: ClaveTexto): string[] {
  return useTexto(clave)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
