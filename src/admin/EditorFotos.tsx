// ─────────────────────────────────────────────────────────────
//  PESTAÑA FOTOS DEL PANEL
//  Muestra cada lugar del sitio que tiene foto, con la foto actual en
//  su proporción real. Mari puede cambiarla, describirla, elegir el
//  punto que debe quedar siempre visible o volver a la original.
//  Al guardar, el sitio usa la foto nueva (en menos de un minuto).
// ─────────────────────────────────────────────────────────────

import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { Contenido, FotoEditada } from "../types";
import { LUGARES_FOTOS, type ClaveFoto, type LugarFoto } from "../lib/fotos";
import type { Guardar } from "./AdminApp";
import { api } from "./api";
import { comprimirImagen } from "./imagen";
import { Campo } from "./ui";

type Fotos = Contenido["fotos"];

const PAGINA_DEL_GRUPO: Record<string, string> = {
  Inicio: "/",
  "Detrás de Mente en Balance": "/detras-de-mente-en-balance",
  "Módulo de Instagram (Inicio)": "/#ig-titulo",
  "Fotos de ambiente del Diario": "/diario",
  "Página no encontrada": "/esta-pagina-no-existe",
};

interface Borrador {
  src: string;
  alt: string;
  posicion?: string;
  /** true si la foto es nueva (recién subida) */
  nueva: boolean;
}

/** "50% 30%" ↔ { x: 50, y: 30 } */
function aPunto(pos: string | undefined): { x: number; y: number } {
  const m = pos?.match(/(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%/);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : { x: 50, y: 50 };
}

function Vista({
  lugar,
  src,
  alt,
  posicion,
  onEnfoque,
}: {
  lugar: LugarFoto;
  src: string;
  alt: string;
  posicion?: string;
  /** Si se pasa, tocar la foto elige el punto de enfoque */
  onEnfoque?: (pos: string) => void;
}) {
  const p = aPunto(posicion ?? lugar.enfoque);
  const elegir = (e: MouseEvent<HTMLDivElement>) => {
    if (!onEnfoque) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    onEnfoque(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };
  const conTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onEnfoque) return;
    const paso = 5;
    const mover: Record<string, [number, number]> = {
      ArrowLeft: [-paso, 0],
      ArrowRight: [paso, 0],
      ArrowUp: [0, -paso],
      ArrowDown: [0, paso],
    };
    const d = mover[e.key];
    if (!d) return;
    e.preventDefault();
    const x = Math.min(100, Math.max(0, p.x + d[0]));
    const y = Math.min(100, Math.max(0, p.y + d[1]));
    onEnfoque(`${x}% ${y}%`);
  };
  return (
    <div
      className={onEnfoque ? "a-foto__vista is-enfoque" : "a-foto__vista"}
      style={{ aspectRatio: String(lugar.proporcion), width: `min(100%, ${Math.round(300 * lugar.proporcion)}px)` }}
      onClick={elegir}
      onKeyDown={conTeclado}
      tabIndex={onEnfoque ? 0 : undefined}
      role={onEnfoque ? "application" : undefined}
      aria-label={onEnfoque ? "Punto de enfoque: toca la foto o usa las flechas del teclado" : undefined}
    >
      <img src={src} alt={alt} style={{ objectPosition: `${p.x}% ${p.y}%` }} />
      {onEnfoque && (
        <span className="a-foto__punto" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden="true" />
      )}
    </div>
  );
}

function TarjetaFoto({ lugar, fotos, guardar }: { lugar: LugarFoto; fotos: Fotos; guardar: Guardar }) {
  const editada = fotos[lugar.clave];
  const actual = editada ?? { src: lugar.original.src, alt: lugar.original.alt, posicion: undefined };
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [confirmarOriginal, setConfirmarOriginal] = useState(false);
  const [error, setError] = useState("");
  const archivo = useRef<HTMLInputElement>(null);

  async function elegir(f: File | undefined) {
    if (!f) return;
    setError("");
    setSubiendo(true);
    try {
      const liviana = await comprimirImagen(f);
      const { url } = await api.subirImagen(liviana, "fotos");
      // Foto nueva: la descripción anterior ya no corresponde
      setBorrador({ src: url, alt: "", posicion: undefined, nueva: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubiendo(false);
      if (archivo.current) archivo.current.value = "";
    }
  }

  async function publicar() {
    if (!borrador) return;
    if (!lugar.decorativa && !borrador.alt.trim()) {
      setError("Describe la foto en una frase antes de guardarla.");
      return;
    }
    setGuardando(true);
    const foto: FotoEditada = {
      src: borrador.src,
      alt: borrador.alt.trim(),
      ...(borrador.posicion && { posicion: borrador.posicion }),
    };
    const ok = await guardar("fotos", { ...fotos, [lugar.clave]: foto });
    setGuardando(false);
    if (ok) setBorrador(null);
  }

  async function volverAOriginal() {
    const resto = { ...fotos };
    delete resto[lugar.clave];
    setGuardando(true);
    await guardar("fotos", resto);
    setGuardando(false);
    setConfirmarOriginal(false);
  }

  return (
    <li className="a-foto">
      {borrador ? (
        <Vista
          lugar={lugar}
          src={borrador.src}
          alt={borrador.alt}
          posicion={borrador.posicion}
          onEnfoque={(posicion) => setBorrador({ ...borrador, posicion })}
        />
      ) : (
        <Vista lugar={lugar} src={actual.src} alt={actual.alt} posicion={actual.posicion} />
      )}

      <div className="a-foto__cuerpo">
        <div className="a-foto__titulo">
          <h3 className="a-evento__titulo">{lugar.nombre}</h3>
          <span className={editada ? "a-estado a-estado--pub" : "a-estado"}>{editada ? "Cambiada" : "Original"}</span>
        </div>
        <p className="a-evento__meta">{lugar.descripcion}</p>

        {borrador ? (
          <div className="a-foto__borrador">
            <p className="a-campo__ayuda">
              Toca la foto para elegir el punto que debe quedar siempre visible (por ejemplo, una cara). Así se verá en el sitio.
            </p>
            <Campo
              etiqueta={lugar.decorativa ? "Describe la foto (opcional)" : "Describe la foto en una frase"}
              ayuda={
                lugar.decorativa
                  ? "Esta foto es decorativa: los lectores de pantalla la omiten."
                  : 'La leen los lectores de pantalla y ayuda a Google. Ej: "Mari guiando una clase de yoga en la sala".'
              }
            >
              {(p) => (
                <input
                  {...p}
                  className="a-input"
                  maxLength={200}
                  required={!lugar.decorativa}
                  value={borrador.alt}
                  onChange={(e) => {
                    setError("");
                    setBorrador({ ...borrador, alt: e.target.value });
                  }}
                  autoFocus
                />
              )}
            </Campo>
            {error && (
              <p className="a-campo__error" role="alert">
                {error}
              </p>
            )}
            <div className="a-foto__acciones">
              <button type="button" className="a-btn a-btn--ghost" onClick={() => setBorrador(null)} disabled={guardando}>
                Cancelar
              </button>
              <button type="button" className="a-btn a-btn--primario" onClick={publicar} disabled={guardando} aria-busy={guardando}>
                {guardando ? "Guardando…" : "Guardar y publicar"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <p className="a-campo__error" role="alert">
                {error}
              </p>
            )}
            <div className="a-foto__acciones">
              <button
                type="button"
                className="a-btn a-btn--primario"
                onClick={() => archivo.current?.click()}
                disabled={subiendo || guardando}
                aria-busy={subiendo}
                aria-label={`Cambiar la foto: ${lugar.nombre}`}
              >
                {subiendo ? "Subiendo…" : "Cambiar foto"}
              </button>
              <button
                type="button"
                className="a-btn a-btn--ghost"
                onClick={() => setBorrador({ src: actual.src, alt: actual.alt, posicion: actual.posicion ?? lugar.enfoque, nueva: false })}
                disabled={subiendo || guardando}
                aria-label={`Ajustar encuadre y descripción: ${lugar.nombre}`}
              >
                Ajustar
              </button>
              {editada &&
                (confirmarOriginal ? (
                  <span className="a-confirmar" role="group" aria-label="Confirmar volver a la foto original">
                    <span className="a-confirmar__texto">¿Volver a la original?</span>
                    <button type="button" className="a-btn a-btn--peligro" onClick={volverAOriginal} disabled={guardando} autoFocus>
                      Sí, volver
                    </button>
                    <button type="button" className="a-btn a-btn--ghost" onClick={() => setConfirmarOriginal(false)}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button type="button" className="a-btn a-btn--peligro-suave" onClick={() => setConfirmarOriginal(true)}>
                    Volver a la original
                  </button>
                ))}
            </div>
          </>
        )}
        <input
          ref={archivo}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          hidden
          onChange={(e) => elegir(e.target.files?.[0])}
        />
      </div>
    </li>
  );
}

export default function EditorFotos({ fotos, guardar }: { fotos: Fotos; guardar: Guardar }) {
  const grupos = [...new Set(LUGARES_FOTOS.map((l) => l.grupo))];
  const cambiadas = Object.keys(fotos).length;

  return (
    <div className="a-seccion">
      <header className="a-seccion__head">
        <h1 className="a-h1">Fotos</h1>
        <p className="a-lead">
          Todas las fotos del sitio. Sube una nueva y se verá en la página en menos de un minuto; si algo no te convence,
          vuelve a la original o usa el Historial. {cambiadas > 0 && `Has cambiado ${cambiadas} de ${LUGARES_FOTOS.length}.`}
        </p>
        <p className="a-campo__ayuda">
          Las fotos de cada publicación se cambian en la pestaña Diario. JPG, PNG o WebP: se optimizan solas antes de subir.
        </p>
      </header>

      {grupos.map((g) => (
        <section key={g} className="a-fotos__grupo" aria-labelledby={`grupo-${g}`}>
          <div className="a-fotos__grupo-head">
            <h2 className="a-h2" id={`grupo-${g}`}>
              {g}
            </h2>
            {PAGINA_DEL_GRUPO[g] && (
              <a className="a-btn a-btn--ghost" href={PAGINA_DEL_GRUPO[g]} target="_blank" rel="noopener noreferrer">
                Ver en el sitio
              </a>
            )}
          </div>
          <ul className="a-fotos">
            {LUGARES_FOTOS.filter((l) => l.grupo === g).map((l) => (
              <TarjetaFoto key={l.clave as ClaveFoto} lugar={l} fotos={fotos} guardar={guardar} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
