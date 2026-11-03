// ─────────────────────────────────────────────────────────────
//  FORMATO DE WHATSAPP
//  Vista previa del mensaje con las mismas reglas que usa WhatsApp:
//    *negrita*  _cursiva_  ~tachado~  ```monoespaciado```  `código`
//    "- " o "* " lista · "1. " lista numerada · "> " cita
//  Se arma con elementos de React (nunca HTML crudo).
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

const MARCAS: { ch: string; tag: "strong" | "em" | "s" | "code" }[] = [
  { ch: "*", tag: "strong" },
  { ch: "_", tag: "em" },
  { ch: "~", tag: "s" },
  { ch: "`", tag: "code" },
];

/** Aplica negrita, cursiva, tachado y código dentro de una línea. */
function enLinea(texto: string, clave = "l"): ReactNode[] {
  // ```mono``` primero (no admite otros formatos adentro)
  const partesMono = texto.split(/(```[^`]+```)/g);
  if (partesMono.length > 1) {
    return partesMono.flatMap((p, i): ReactNode[] =>
      p.startsWith("```") && p.endsWith("```") && p.length > 6
        ? [<code key={`${clave}m${i}`} className="wa-mono">{p.slice(3, -3)}</code>]
        : enLinea(p, `${clave}m${i}`)
    );
  }
  for (const { ch, tag } of MARCAS) {
    const e = ch.replace(/[*~`]/g, "\\$&");
    // La marca debe abrir junto a texto y cerrar junto a texto (como WhatsApp)
    const re = new RegExp(`(^|[\\s([{¡¿"'])${e}(?=\\S)([^${e}\\n]*?\\S)${e}(?=$|[\\s.,;:!?)\\]}"'])`);
    const m = texto.match(re);
    if (m && m.index !== undefined) {
      const antes = texto.slice(0, m.index) + m[1];
      const despues = texto.slice(m.index + m[0].length);
      const Tag = tag;
      return [
        ...enLinea(antes, `${clave}a`),
        <Tag key={`${clave}${ch}`}>{enLinea(m[2], `${clave}${ch}i`)}</Tag>,
        ...enLinea(despues, `${clave}d`),
      ];
    }
  }
  // Enlaces visibles como en WhatsApp
  const partes = texto.split(/(https?:\/\/[^\s]+)/g);
  return partes.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <span key={`${clave}u${i}`} className="wa-enlace">
        {p}
      </span>
    ) : (
      p
    )
  );
}

/** Mensaje completo: líneas, listas y citas. */
export function VistaWhatsApp({ texto }: { texto: string }) {
  const lineas = texto.split("\n");
  return (
    <>
      {lineas.map((l, i) => {
        const lista = l.match(/^\s*[-*•]\s+(.*)$/);
        const numerada = l.match(/^\s*(\d+)\.\s+(.*)$/);
        const cita = l.match(/^>\s?(.*)$/);
        if (lista)
          return (
            <div key={i} className="wa-lista">
              <span aria-hidden="true">•</span> <span>{enLinea(lista[1], `${i}`)}</span>
            </div>
          );
        if (numerada)
          return (
            <div key={i} className="wa-lista">
              <span>{numerada[1]}.</span> <span>{enLinea(numerada[2], `${i}`)}</span>
            </div>
          );
        if (cita)
          return (
            <div key={i} className="wa-cita">
              {enLinea(cita[1], `${i}`)}
            </div>
          );
        return (
          <div key={i} className="wa-linea">
            {l ? enLinea(l, `${i}`) : " "}
          </div>
        );
      })}
    </>
  );
}
