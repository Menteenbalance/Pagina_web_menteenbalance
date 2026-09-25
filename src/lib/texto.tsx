// ─────────────────────────────────────────────────────────────
//  FORMATO DE LAS PUBLICACIONES DEL DIARIO
//
//  Mari escribe en texto simple con marcas fáciles:
//    ## Subtítulo
//    **negrita**   *cursiva*   [texto del enlace](https://...)
//    - elemento de lista        > cita destacada
//  Una línea en blanco separa párrafos.
//
//  Se convierte a elementos de React (nunca a HTML crudo), así que
//  no hay forma de inyectar código en la página.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

function enlaceSeguro(url: string): string | null {
  return /^(https?:\/\/|mailto:|\/)/i.test(url) ? url : null;
}

/** Negrita, cursiva y enlaces dentro de una línea. */
function enLinea(texto: string, clave: string): ReactNode[] {
  const partes: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((\S+?)\)/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index));
    const k = `${clave}-${i++}`;
    if (m[1] !== undefined) partes.push(<strong key={k}>{m[1]}</strong>);
    else if (m[2] !== undefined) partes.push(<em key={k}>{m[2]}</em>);
    else {
      const url = enlaceSeguro(m[4]);
      const externo = url?.startsWith("http");
      partes.push(
        url ? (
          <a
            key={k}
            href={url}
            {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {m[3]}
          </a>
        ) : (
          m[3]
        )
      );
    }
    ultimo = re.lastIndex;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

/** Convierte el texto de una publicación en bloques de React. */
export function TextoConFormato({ texto }: { texto: string }) {
  const bloques = texto.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <>
      {bloques.map((bloque, b) => {
        const lineas = bloque.split("\n").filter((l) => l.trim() !== "");
        if (lineas.length === 0) return null;
        const k = `b${b}`;

        if (/^#{2,3}\s/.test(lineas[0]) && lineas.length === 1) {
          const nivel3 = lineas[0].startsWith("###");
          const contenido = enLinea(lineas[0].replace(/^#{2,3}\s+/, ""), k);
          return nivel3 ? <h3 key={k}>{contenido}</h3> : <h2 key={k}>{contenido}</h2>;
        }
        if (lineas.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={k}>
              {lineas.map((l, i) => (
                <li key={i}>{enLinea(l.replace(/^\s*[-*]\s+/, ""), `${k}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        if (lineas.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={k}>
              {lineas.map((l, i) => (
                <li key={i}>{enLinea(l.replace(/^\s*\d+[.)]\s+/, ""), `${k}-${i}`)}</li>
              ))}
            </ol>
          );
        }
        if (lineas.every((l) => l.startsWith(">"))) {
          return (
            <blockquote key={k}>
              {enLinea(lineas.map((l) => l.replace(/^>\s?/, "")).join(" "), k)}
            </blockquote>
          );
        }
        return (
          <p key={k}>
            {lineas.map((l, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {enLinea(l, `${k}-${i}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

/** Minutos de lectura aproximados (200 palabras por minuto). */
export function minutosDeLectura(texto: string): number {
  const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
