// ─────────────────────────────────────────────────────────────
//  CLASES QUE SE REPITEN (pestaña Agenda del panel)
//  Mari crea la serie una vez ("Vinyasa · lunes y miércoles 20:00")
//  y el sitio muestra solas las fechas de las próximas semanas.
//  Puede cancelar una fecha puntual sin tocar el resto.
// ─────────────────────────────────────────────────────────────

import { useState, type FormEvent } from "react";
import type { ActividadRecurrente, DiaSemana } from "../types";
import { formatearFecha, formatearPrecio } from "../lib/formato";
import {
  NOMBRES_DIAS,
  SEMANAS_VISIBLES,
  fechasDeLaSerie,
  hoyEnSantiago,
  sumarDias,
  textoRepeticion,
} from "../lib/recurrentes";
import type { Guardar } from "./AdminApp";
import { BotonEliminar, Campo } from "./ui";
import { TIPOS, aHoraInput, aHoraTexto } from "./agendaComun";

const DIAS: DiaSemana[] = [1, 2, 3, 4, 5, 6, 7];
/** Semanas que se listan en el panel para poder cancelar fechas con anticipación */
const SEMANAS_PANEL = 8;

function vacia(): ActividadRecurrente {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    tipo: "Yoga",
    dias: [],
    hora: "20 hrs.",
    desde: hoyEnSantiago(),
    desc: "",
    lugar: "",
    precio: 0,
    excepciones: [],
  };
}

function claseTag(tipo: string) {
  return `a-tag a-tag--${tipo === "Meditación" ? "meditacion" : tipo.toLowerCase()}`;
}

export default function EditorRecurrentes({
  recurrentes,
  lugares,
  guardar,
}: {
  recurrentes: ActividadRecurrente[];
  lugares: string[];
  guardar: Guardar;
}) {
  const [editando, setEditando] = useState<ActividadRecurrente | null>(null);
  const [esNueva, setEsNueva] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const hoy = hoyEnSantiago();

  async function persistir(lista: ActividadRecurrente[]) {
    setGuardando(true);
    const ok = await guardar("recurrentes", lista);
    setGuardando(false);
    return ok;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    if (editando.dias.length === 0) {
      setError("Elige al menos un día de la semana.");
      return;
    }
    if (editando.hasta && editando.hasta < editando.desde) {
      setError("La fecha de término no puede ser anterior a la de inicio.");
      return;
    }
    setError("");
    const lista = esNueva
      ? [...recurrentes, editando]
      : recurrentes.map((x) => (x.id === editando.id ? editando : x));
    if (await persistir(lista)) setEditando(null);
  }

  /** Cancela o reactiva una fecha puntual (las fechas ya pasadas se limpian solas). */
  function alternarFecha(serie: ActividadRecurrente, fecha: string) {
    const canceladas = new Set(serie.excepciones.filter((f) => f >= hoy));
    if (canceladas.has(fecha)) canceladas.delete(fecha);
    else canceladas.add(fecha);
    const actualizada = { ...serie, excepciones: [...canceladas].sort() };
    return persistir(recurrentes.map((x) => (x.id === serie.id ? actualizada : x)));
  }

  const cambiar = (c: Partial<ActividadRecurrente>) => setEditando((x) => (x ? { ...x, ...c } : x));
  const alternarDia = (d: DiaSemana) => {
    setError("");
    cambiar({
      dias: editando!.dias.includes(d)
        ? editando!.dias.filter((x) => x !== d)
        : [...editando!.dias, d].sort((a, b) => a - b),
    });
  };

  return (
    <section className="a-recurrentes" aria-labelledby="titulo-recurrentes">
      <div className="a-recurrentes__head">
        <div>
          <h2 className="a-h2" id="titulo-recurrentes">
            Clases que se repiten ({recurrentes.length})
          </h2>
          <p className="a-campo__ayuda">
            Se crean una vez y el sitio muestra solas las fechas de las próximas {SEMANAS_VISIBLES} semanas.
          </p>
        </div>
        {!editando && (
          <button
            type="button"
            className="a-btn a-btn--ghost"
            onClick={() => {
              setEsNueva(true);
              setError("");
              setEditando(vacia());
            }}
          >
            + Clase que se repite
          </button>
        )}
      </div>

      {editando && (
        <form
          key={editando.id}
          className="a-item a-form-evento"
          onSubmit={enviar}
          aria-label={esNueva ? "Nueva clase que se repite" : "Editar clase que se repite"}
        >
          <h3 className="a-item__titulo">{esNueva ? "Nueva clase que se repite" : "Editar clase que se repite"}</h3>
          {!esNueva && (
            <p className="a-campo__ayuda">Los cambios se aplican a todas las fechas que vienen.</p>
          )}

          <Campo etiqueta="Título">
            {(p) => (
              <input
                {...p}
                className="a-input"
                required
                maxLength={80}
                value={editando.titulo}
                placeholder="Ej: Vinyasa Yoga"
                onChange={(e) => cambiar({ titulo: e.target.value })}
                autoFocus
              />
            )}
          </Campo>

          <fieldset className="a-chips">
            <legend className="a-campo__label">Tipo de actividad</legend>
            {TIPOS.map((t) => (
              <label key={t} className={editando.tipo === t ? "a-chip is-activo" : "a-chip"}>
                <input type="radio" name="tipo-serie" value={t} checked={editando.tipo === t} onChange={() => cambiar({ tipo: t })} />
                {t}
              </label>
            ))}
          </fieldset>

          <fieldset className="a-chips" aria-describedby={error ? "error-serie" : undefined}>
            <legend className="a-campo__label">Se repite los días</legend>
            {DIAS.map((d) => (
              <label key={d} className={editando.dias.includes(d) ? "a-chip is-activo" : "a-chip"}>
                <input type="checkbox" checked={editando.dias.includes(d)} onChange={() => alternarDia(d)} />
                {NOMBRES_DIAS[d].slice(0, 3)}
                <span className="sr-only">{NOMBRES_DIAS[d].slice(3)}</span>
              </label>
            ))}
          </fieldset>
          {editando.dias.length > 0 && <p className="a-campo__ayuda">{textoRepeticion(editando.dias)}</p>}

          <div className="a-grid-3">
            <Campo etiqueta="Hora">
              {(p) => (
                <input {...p} className="a-input" type="time" required value={aHoraInput(editando.hora)} onChange={(e) => cambiar({ hora: aHoraTexto(e.target.value) })} />
              )}
            </Campo>
            <Campo etiqueta="Desde">
              {(p) => (
                <input {...p} className="a-input" type="date" required value={editando.desde} onChange={(e) => cambiar({ desde: e.target.value })} />
              )}
            </Campo>
            <Campo etiqueta="Hasta (opcional)" ayuda="Vacío = sin fecha de término.">
              {(p) => (
                <input {...p} className="a-input" type="date" min={editando.desde} value={editando.hasta ?? ""} onChange={(e) => cambiar({ hasta: e.target.value || undefined })} />
              )}
            </Campo>
          </div>

          <Campo etiqueta="Descripción" ayuda={`${editando.desc.length}/280 caracteres`}>
            {(p) => (
              <textarea {...p} className="a-input a-textarea" rows={2} required maxLength={280} value={editando.desc} placeholder="Una o dos frases sobre la clase…" onChange={(e) => cambiar({ desc: e.target.value })} />
            )}
          </Campo>

          <Campo etiqueta="Lugar" ayuda="Escribe o elige uno usado antes.">
            {(p) => (
              <>
                <input {...p} className="a-input" required maxLength={140} list="lugares-serie" value={editando.lugar} onChange={(e) => cambiar({ lugar: e.target.value })} />
                <datalist id="lugares-serie">
                  {lugares.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </>
            )}
          </Campo>

          <div className="a-grid-2">
            <Campo etiqueta="Valor por clase (CLP)" ayuda={formatearPrecio(editando.precio)}>
              {(p) => (
                <input {...p} className="a-input a-input--num" type="number" inputMode="numeric" min={0} step={500} value={editando.precio} onChange={(e) => cambiar({ precio: Math.max(0, Math.round(Number(e.target.value) || 0)) })} />
              )}
            </Campo>
            <label className="a-check">
              <input type="checkbox" checked={editando.precio === 0} onChange={(e) => cambiar({ precio: e.target.checked ? 0 : 5000 })} />
              Actividad gratuita
            </label>
          </div>

          {error && (
            <p className="a-campo__error" id="error-serie" role="alert">
              {error}
            </p>
          )}

          <div className="a-item__pie a-item__pie--entre">
            <button type="button" className="a-btn a-btn--ghost" onClick={() => setEditando(null)} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="a-btn a-btn--primario" disabled={guardando} aria-busy={guardando}>
              {guardando ? "Guardando…" : esNueva ? "Publicar clase" : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}

      {recurrentes.length === 0 ? (
        !editando && (
          <p className="a-vacio">
            Aún no hay clases fijas. Ideal para las que se repiten cada semana, como "Vinyasa lunes y miércoles 20:00".
          </p>
        )
      ) : (
        <ul className="a-eventos">
          {recurrentes.map((s) => {
            const terminada = !!s.hasta && s.hasta < hoy;
            const fechas = fechasDeLaSerie(s, hoy, sumarDias(hoy, SEMANAS_PANEL * 7 - 1), { incluirCanceladas: true });
            const canceladas = new Set(s.excepciones);
            return (
              <li key={s.id} className={terminada ? "a-serie is-pasado" : "a-serie"}>
                <div className="a-evento">
                  <div className="a-evento__fecha">
                    <span className="a-evento__dia a-serie__dias">
                      {s.dias.map((d) => NOMBRES_DIAS[d].slice(0, 3)).join(" · ")}
                    </span>
                    <span className="a-evento__hora">{s.hora}</span>
                  </div>
                  <div className="a-evento__cuerpo">
                    <span className={claseTag(s.tipo)}>{s.tipo}</span>
                    <h3 className="a-evento__titulo">{s.titulo}</h3>
                    <p className="a-evento__meta">
                      {textoRepeticion(s.dias)} · {s.lugar} · {formatearPrecio(s.precio)}
                    </p>
                    <p className="a-evento__meta">
                      {terminada
                        ? `Terminó el ${formatearFecha(s.hasta!).larga}`
                        : s.desde > hoy
                          ? `Comienza el ${formatearFecha(s.desde).larga}`
                          : "Activa"}
                      {!terminada && s.hasta && ` · hasta el ${formatearFecha(s.hasta).larga}`}
                    </p>
                  </div>
                  <div className="a-evento__acciones">
                    <button
                      type="button"
                      className="a-btn a-btn--ghost"
                      onClick={() => {
                        setEsNueva(false);
                        setError("");
                        setEditando(s);
                      }}
                      aria-label={`Editar ${s.titulo}`}
                    >
                      Editar
                    </button>
                    <BotonEliminar
                      que={`la clase ${s.titulo} y todas sus fechas`}
                      onConfirmar={() => persistir(recurrentes.filter((x) => x.id !== s.id))}
                    />
                  </div>
                </div>

                {fechas.length > 0 && (
                  <details className="a-serie__fechas">
                    <summary>
                      Próximas fechas ({fechas.filter((f) => !canceladas.has(f)).length}
                      {(() => {
                        const n = fechas.filter((f) => canceladas.has(f)).length;
                        return n > 0 ? `, ${n} cancelada${n > 1 ? "s" : ""}` : "";
                      })()})
                    </summary>
                    <ul>
                      {fechas.map((f) => {
                        const cancelada = canceladas.has(f);
                        const txt = formatearFecha(f);
                        return (
                          <li key={f} className={cancelada ? "is-cancelada" : undefined}>
                            <span>
                              {txt.dia} {txt.corta}
                              {cancelada && <span className="a-serie__estado"> · cancelada</span>}
                            </span>
                            <button
                              type="button"
                              className={cancelada ? "a-btn a-btn--ghost" : "a-btn a-btn--peligro-suave"}
                              disabled={guardando}
                              onClick={() => alternarFecha(s, f)}
                              aria-label={`${cancelada ? "Reactivar" : "Cancelar"} ${s.titulo} del ${txt.larga}`}
                            >
                              {cancelada ? "Reactivar" : "Cancelar esta fecha"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
