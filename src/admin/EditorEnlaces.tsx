// ─────────────────────────────────────────────────────────────
//  PESTAÑA ENLACES DEL PANEL
//  Dónde se reservan horas y clases. Lo usan los botones "Reservar",
//  "Reservar hora", "Inscribirme", "Consultar" (salvo organizaciones,
//  que va por correo) y "Reservar en …" bajo las próximas clases.
// ─────────────────────────────────────────────────────────────

import { useState, type FormEvent } from "react";
import type { Enlaces } from "../types";
import { enlaces as originales } from "../data";
import type { Guardar } from "./AdminApp";
import { Campo } from "./ui";

function urlValida(v: string): boolean {
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function EditorEnlaces({ enlaces, guardar }: { enlaces: Enlaces; guardar: Guardar }) {
  const [url, setUrl] = useState(enlaces.reservaUrl);
  const [plataforma, setPlataforma] = useState(enlaces.reservaPlataforma);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambios = url.trim() !== enlaces.reservaUrl || plataforma.trim() !== enlaces.reservaPlataforma;
  const esOriginal = enlaces.reservaUrl === originales.reservaUrl && enlaces.reservaPlataforma === originales.reservaPlataforma;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!urlValida(url)) return setError("Escribe la dirección completa, empezando con https://");
    if (!plataforma.trim()) return setError("Escribe el nombre de la plataforma (por ejemplo, Encuadrado).");
    setError("");
    setGuardando(true);
    await guardar("enlaces", { reservaUrl: url.trim(), reservaPlataforma: plataforma.trim() });
    setGuardando(false);
  }

  return (
    <div className="a-seccion">
      <header className="a-seccion__head">
        <h1 className="a-h1">Enlaces</h1>
        <p className="a-lead">
          La página donde las personas reservan horas y clases. Si algún día dejas de usar Encuadrado, cambia aquí el
          enlace y el nombre: todos los botones de reserva del sitio se actualizan solos.
        </p>
      </header>

      <form className="a-item" onSubmit={enviar}>
        <Campo
          etiqueta="Enlace para reservar"
          ayuda='Lo usan los botones "Reservar", "Reservar hora", "Inscribirme" y "Consultar" (salvo Bienestar para organizaciones, que abre un correo).'
        >
          {(p) => (
            <input
              {...p}
              className="a-input"
              type="url"
              inputMode="url"
              spellCheck={false}
              maxLength={300}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="https://"
              required
            />
          )}
        </Campo>

        <Campo etiqueta="Nombre de la plataforma" ayuda={`Aparece en el botón bajo las próximas clases: "Reservar en ${plataforma.trim() || "…"}".`}>
          {(p) => (
            <input
              {...p}
              className="a-input"
              maxLength={40}
              value={plataforma}
              onChange={(e) => {
                setPlataforma(e.target.value);
                setError("");
              }}
              required
            />
          )}
        </Campo>

        {error && (
          <p className="a-campo__error" role="alert">
            {error}
          </p>
        )}

        <div className="a-item__pie a-item__pie--entre">
          <div className="a-foto__acciones">
            {urlValida(url) && (
              <a className="a-btn a-btn--ghost" href={url.trim()} target="_blank" rel="noopener noreferrer">
                Probar el enlace
              </a>
            )}
            {!esOriginal && (
              <button
                type="button"
                className="a-btn a-btn--ghost"
                onClick={() => {
                  setUrl(originales.reservaUrl);
                  setPlataforma(originales.reservaPlataforma);
                  setError("");
                }}
              >
                Volver a Encuadrado
              </button>
            )}
          </div>
          <button type="submit" className="a-btn a-btn--primario" disabled={guardando || !cambios} aria-busy={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
