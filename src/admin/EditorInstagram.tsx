import { useState, type FormEvent } from "react";
import type { Ajustes } from "../types";
import { contacto } from "../data";
import type { Guardar } from "./AdminApp";
import { Campo } from "./ui";

export default function EditorInstagram({ ajustes, guardar }: { ajustes: Ajustes; guardar: Guardar }) {
  const [visible, setVisible] = useState(ajustes.instagram.visible);
  const [texto, setTexto] = useState(ajustes.instagram.texto);
  const [guardando, setGuardando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await guardar("ajustes", { ...ajustes, instagram: { visible, texto: texto.trim() } });
    setGuardando(false);
  }

  return (
    <div className="a-seccion">
      <header className="a-seccion__head">
        <h1 className="a-h1">Instagram</h1>
        <p className="a-lead">
          El módulo "Síguenos en Instagram" aparece al final del Inicio, con fotos de la práctica y un
          botón que lleva a{" "}
          <a href={contacto.instagram.url} target="_blank" rel="noopener noreferrer">
            {contacto.instagram.label}
          </a>
          .
        </p>
      </header>

      <form className="a-item" onSubmit={enviar}>
        <label className="a-check">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Mostrar el módulo de Instagram en el Inicio
        </label>

        <Campo etiqueta="Frase del módulo" ayuda={`Aparece bajo el título. ${texto.length}/160 caracteres`}>
          {(p) => (
            <textarea
              {...p}
              className="a-input a-textarea"
              rows={2}
              maxLength={160}
              value={texto}
              disabled={!visible}
              onChange={(e) => setTexto(e.target.value)}
            />
          )}
        </Campo>

        <div className="a-item__pie">
          <button type="submit" className="a-btn a-btn--primario" disabled={guardando} aria-busy={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
