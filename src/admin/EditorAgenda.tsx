import { useMemo, useState, type FormEvent } from "react";
import type { Evento, TipoEvento } from "../types";
import { formatearFecha, formatearPrecio } from "../lib/formato";
import { hoyEnSantiago } from "../lib/contenido";
import type { Guardar } from "./AdminApp";
import { BotonEliminar, Campo } from "./ui";

const TIPOS: TipoEvento[] = ["Yoga", "Meditación", "Talleres"];

/** "11 hrs." / "19:30 hrs." → "11:00" / "19:30" para el campo de hora */
function aHoraInput(hora: string): string {
  const m = hora.match(/(\d{1,2})(?::(\d{2}))?/);
  return m ? `${m[1].padStart(2, "0")}:${m[2] ?? "00"}` : "";
}
/** "09:00" → "09 hrs." · "19:30" → "19:30 hrs." (mismo estilo del sitio) */
function aHoraTexto(valor: string): string {
  const [h, m] = valor.split(":");
  return m === "00" ? `${h} hrs.` : `${h}:${m} hrs.`;
}

function vacio(): Evento {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    tipo: "Yoga",
    fecha: hoyEnSantiago(),
    hora: "19 hrs.",
    desc: "",
    lugar: "",
    precio: 0,
  };
}

export default function EditorAgenda({ agenda, guardar }: { agenda: Evento[]; guardar: Guardar }) {
  const [editando, setEditando] = useState<Evento | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const hoy = hoyEnSantiago();

  const ordenada = useMemo(() => [...agenda].sort((a, b) => a.fecha.localeCompare(b.fecha)), [agenda]);
  const proximas = ordenada.filter((e) => e.fecha >= hoy);
  const pasadas = ordenada.filter((e) => e.fecha < hoy).reverse();
  const lugares = useMemo(() => [...new Set(agenda.map((e) => e.lugar))], [agenda]);

  async function persistir(lista: Evento[]) {
    setGuardando(true);
    const ok = await guardar("agenda", lista);
    setGuardando(false);
    return ok;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    const lista = esNuevo ? [...agenda, editando] : agenda.map((x) => (x.id === editando.id ? editando : x));
    if (await persistir(lista)) setEditando(null);
  }

  const tarjeta = (ev: Evento, pasada = false) => {
    const f = formatearFecha(ev.fecha);
    return (
      <li key={ev.id} className={pasada ? "a-evento is-pasado" : "a-evento"}>
        <div className="a-evento__fecha">
          <span className="a-evento__dia">{f.corta}</span>
          <span className="a-evento__hora">{f.dia} · {ev.hora}</span>
        </div>
        <div className="a-evento__cuerpo">
          <span className={`a-tag a-tag--${ev.tipo === "Meditación" ? "meditacion" : ev.tipo.toLowerCase()}`}>{ev.tipo}</span>
          <h3 className="a-evento__titulo">{ev.titulo}</h3>
          <p className="a-evento__meta">{ev.lugar} · {formatearPrecio(ev.precio)}</p>
        </div>
        <div className="a-evento__acciones">
          <button
            type="button"
            className="a-btn a-btn--ghost"
            onClick={() => {
              setEsNuevo(false);
              setEditando(ev);
            }}
            aria-label={`Editar ${ev.titulo}`}
          >
            Editar
          </button>
          <BotonEliminar que={`la actividad ${ev.titulo}`} onConfirmar={() => persistir(agenda.filter((x) => x.id !== ev.id))} />
        </div>
      </li>
    );
  };

  return (
    <div className="a-seccion">
      <header className="a-seccion__head a-seccion__head--fila">
        <div>
          <h1 className="a-h1">Agenda</h1>
          <p className="a-lead">Las actividades pasadas se ocultan solas del sitio.</p>
        </div>
        {!editando && (
          <button
            type="button"
            className="a-btn a-btn--primario"
            onClick={() => {
              setEsNuevo(true);
              setEditando(vacio());
            }}
          >
            + Nueva actividad
          </button>
        )}
      </header>

      {editando && (
        <form className="a-item a-form-evento" onSubmit={enviar} aria-label={esNuevo ? "Nueva actividad" : "Editar actividad"}>
          <h2 className="a-item__titulo">{esNuevo ? "Nueva actividad" : "Editar actividad"}</h2>

          <Campo etiqueta="Título">
            {(p) => <input {...p} className="a-input" required maxLength={80} value={editando.titulo} placeholder="Ej: Sentir Yoga…" onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} autoFocus />}
          </Campo>

          <fieldset className="a-chips">
            <legend className="a-campo__label">Tipo de actividad</legend>
            {TIPOS.map((t) => (
              <label key={t} className={editando.tipo === t ? "a-chip is-activo" : "a-chip"}>
                <input type="radio" name="tipo" value={t} checked={editando.tipo === t} onChange={() => setEditando({ ...editando, tipo: t })} />
                {t}
              </label>
            ))}
          </fieldset>

          <div className="a-grid-2">
            <Campo etiqueta="Fecha">
              {(p) => <input {...p} className="a-input" type="date" required value={editando.fecha} onChange={(e) => setEditando({ ...editando, fecha: e.target.value })} />}
            </Campo>
            <Campo etiqueta="Hora">
              {(p) => <input {...p} className="a-input" type="time" required value={aHoraInput(editando.hora)} onChange={(e) => setEditando({ ...editando, hora: aHoraTexto(e.target.value) })} />}
            </Campo>
          </div>

          <Campo etiqueta="Descripción" ayuda={`${editando.desc.length}/280 caracteres`}>
            {(p) => <textarea {...p} className="a-input a-textarea" rows={2} required maxLength={280} value={editando.desc} placeholder="Una o dos frases sobre la actividad…" onChange={(e) => setEditando({ ...editando, desc: e.target.value })} />}
          </Campo>

          <Campo etiqueta="Lugar" ayuda="Escribe o elige uno usado antes.">
            {(p) => (
              <>
                <input {...p} className="a-input" required maxLength={140} list="lugares" value={editando.lugar} onChange={(e) => setEditando({ ...editando, lugar: e.target.value })} />
                <datalist id="lugares">
                  {lugares.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </>
            )}
          </Campo>

          <div className="a-grid-2">
            <Campo etiqueta="Valor (CLP)" ayuda={formatearPrecio(editando.precio)}>
              {(p) => <input {...p} className="a-input a-input--num" type="number" inputMode="numeric" min={0} step={500} value={editando.precio} onChange={(e) => setEditando({ ...editando, precio: Math.max(0, Math.round(Number(e.target.value) || 0)) })} />}
            </Campo>
            <label className="a-check">
              <input type="checkbox" checked={editando.precio === 0} onChange={(e) => setEditando({ ...editando, precio: e.target.checked ? 0 : 5000 })} />
              Actividad gratuita
            </label>
          </div>

          <div className="a-item__pie a-item__pie--entre">
            <button type="button" className="a-btn a-btn--ghost" onClick={() => setEditando(null)} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="a-btn a-btn--primario" disabled={guardando} aria-busy={guardando}>
              {guardando ? "Guardando…" : esNuevo ? "Publicar actividad" : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}

      <h2 className="a-h2">Próximas ({proximas.length})</h2>
      {proximas.length === 0 ? (
        <p className="a-vacio">No hay actividades próximas. El sitio mostrará un mensaje invitando a escribir.</p>
      ) : (
        <ul className="a-eventos">{proximas.map((e) => tarjeta(e))}</ul>
      )}

      {pasadas.length > 0 && (
        <details className="a-pasadas">
          <summary className="a-h2">Pasadas ({pasadas.length})</summary>
          <ul className="a-eventos">{pasadas.map((e) => tarjeta(e, true))}</ul>
        </details>
      )}
    </div>
  );
}
