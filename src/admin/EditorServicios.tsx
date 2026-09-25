import { useState } from "react";
import type { GrupoTarifas, Servicio, Tarifa } from "../types";
import { formatearPrecio } from "../lib/formato";
import type { Guardar } from "./AdminApp";
import { BarraGuardar, BotonEliminar, Campo, mover, useBorrador } from "./ui";

const COLORES = [
  { valor: "var(--plum)", nombre: "Ciruela" },
  { valor: "var(--teal)", nombre: "Turquesa" },
  { valor: "var(--amber)", nombre: "Ámbar" },
  { valor: "var(--lime)", nombre: "Lima" },
];

export default function EditorServicios({
  servicios,
  aranceles,
  guardar,
}: {
  servicios: Servicio[];
  aranceles: GrupoTarifas[];
  guardar: Guardar;
}) {
  const s = useBorrador(servicios);
  const a = useBorrador(aranceles);
  const [guardando, setGuardando] = useState(false);

  async function guardarTodo() {
    setGuardando(true);
    if (s.cambios) await guardar("servicios", s.borrador);
    if (a.cambios) await guardar("aranceles", a.borrador);
    setGuardando(false);
  }

  const editarServicio = (i: number, cambio: Partial<Servicio>) =>
    s.setBorrador(s.borrador.map((x, j) => (j === i ? { ...x, ...cambio } : x)));

  const editarGrupo = (g: number, cambio: Partial<GrupoTarifas>) =>
    a.setBorrador(a.borrador.map((x, j) => (j === g ? { ...x, ...cambio } : x)));

  const editarTarifa = (g: number, t: number, cambio: Partial<Tarifa>) =>
    editarGrupo(g, {
      items: a.borrador[g].items.map((x, j) => (j === t ? { ...x, ...cambio } : x)),
    });

  return (
    <div className="a-seccion">
      <header className="a-seccion__head">
        <h1 className="a-h1">Servicios</h1>
        <p className="a-lead">
          La descripción breve aparece en las tarjetas del Inicio; la extendida, en la página Servicios.
        </p>
      </header>

      <ol className="a-lista">
        {s.borrador.map((sv, i) => (
          <li key={sv.id} className="a-item">
            <div className="a-item__head">
              <span className="a-punto" style={{ background: sv.dot }} aria-hidden="true" />
              <h2 className="a-item__titulo">{sv.title || "Servicio sin nombre"}</h2>
              <div className="a-item__orden">
                <button type="button" className="a-btn a-btn--icono" onClick={() => s.setBorrador(mover(s.borrador, i, -1))} disabled={i === 0} aria-label={`Subir ${sv.title}`}>↑</button>
                <button type="button" className="a-btn a-btn--icono" onClick={() => s.setBorrador(mover(s.borrador, i, 1))} disabled={i === s.borrador.length - 1} aria-label={`Bajar ${sv.title}`}>↓</button>
              </div>
            </div>

            <div className="a-grid-2">
              <Campo etiqueta="Nombre">
                {(p) => <input {...p} className="a-input" value={sv.title} maxLength={60} onChange={(e) => editarServicio(i, { title: e.target.value })} />}
              </Campo>
              <Campo etiqueta="Etiqueta" ayuda="Ej: Online y presencial, 50 minutos.">
                {(p) => <input {...p} className="a-input" value={sv.meta} maxLength={40} onChange={(e) => editarServicio(i, { meta: e.target.value })} />}
              </Campo>
            </div>

            <fieldset className="a-colores">
              <legend className="a-campo__label">Color</legend>
              {COLORES.map((c) => (
                <label key={c.valor} className="a-color">
                  <input type="radio" name={`color-${sv.id}`} checked={sv.dot === c.valor} onChange={() => editarServicio(i, { dot: c.valor })} />
                  <span className="a-punto" style={{ background: c.valor }} aria-hidden="true" />
                  {c.nombre}
                </label>
              ))}
            </fieldset>

            <Campo etiqueta="Descripción breve (Inicio)" ayuda={`${sv.body.length}/200 caracteres`}>
              {(p) => <textarea {...p} className="a-input a-textarea" rows={2} value={sv.body} maxLength={200} onChange={(e) => editarServicio(i, { body: e.target.value })} />}
            </Campo>
            <Campo etiqueta="Descripción extendida (página Servicios)" ayuda={`${sv.largo.length}/900 caracteres`}>
              {(p) => <textarea {...p} className="a-input a-textarea" rows={4} value={sv.largo} maxLength={900} onChange={(e) => editarServicio(i, { largo: e.target.value })} />}
            </Campo>

            <div className="a-item__pie">
              <BotonEliminar que={`el servicio ${sv.title}`} onConfirmar={() => s.setBorrador(s.borrador.filter((_, j) => j !== i))} />
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="a-btn a-btn--suave"
        onClick={() =>
          s.setBorrador([
            ...s.borrador,
            { id: crypto.randomUUID(), title: "", dot: "var(--teal)", meta: "", body: "", largo: "" },
          ])
        }
      >
        + Agregar servicio
      </button>

      <header className="a-seccion__head a-seccion__head--sep">
        <h2 className="a-h1">Aranceles</h2>
        <p className="a-lead">Precios en pesos chilenos, sin puntos (ej: 37000).</p>
      </header>

      {a.borrador.map((g, gi) => (
        <section key={gi} className="a-item" aria-label={`Grupo ${g.categoria}`}>
          <div className="a-item__head">
            <Campo etiqueta="Nombre del grupo">
              {(p) => <input {...p} className="a-input a-input--titulo" value={g.categoria} maxLength={60} onChange={(e) => editarGrupo(gi, { categoria: e.target.value })} />}
            </Campo>
          </div>

          <ul className="a-tarifas">
            {g.items.map((t, ti) => (
              <li key={ti} className="a-tarifa">
                <Campo etiqueta="Nombre">
                  {(p) => <input {...p} className="a-input" value={t.nombre} maxLength={90} onChange={(e) => editarTarifa(gi, ti, { nombre: e.target.value })} />}
                </Campo>
                <Campo etiqueta="Modalidad (opcional)">
                  {(p) => <input {...p} className="a-input" value={t.modalidad ?? ""} maxLength={40} placeholder="Online / Presencial…" onChange={(e) => editarTarifa(gi, ti, { modalidad: e.target.value })} />}
                </Campo>
                <Campo etiqueta="Duración (opcional)">
                  {(p) => <input {...p} className="a-input" value={t.duracion ?? ""} maxLength={40} placeholder="50 min…" onChange={(e) => editarTarifa(gi, ti, { duracion: e.target.value })} />}
                </Campo>
                <Campo etiqueta="Precio" ayuda={formatearPrecio(t.precio)}>
                  {(p) => (
                    <input
                      {...p}
                      className="a-input a-input--num"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={500}
                      value={Number.isFinite(t.precio) ? t.precio : ""}
                      onChange={(e) => editarTarifa(gi, ti, { precio: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                    />
                  )}
                </Campo>
                <div className="a-tarifa__acciones">
                  <button type="button" className="a-btn a-btn--icono" onClick={() => editarGrupo(gi, { items: mover(g.items, ti, -1) })} disabled={ti === 0} aria-label={`Subir ${t.nombre}`}>↑</button>
                  <button type="button" className="a-btn a-btn--icono" onClick={() => editarGrupo(gi, { items: mover(g.items, ti, 1) })} disabled={ti === g.items.length - 1} aria-label={`Bajar ${t.nombre}`}>↓</button>
                  <BotonEliminar que={`el valor ${t.nombre}`} onConfirmar={() => editarGrupo(gi, { items: g.items.filter((_, j) => j !== ti) })} />
                </div>
              </li>
            ))}
          </ul>

          <div className="a-item__pie a-item__pie--entre">
            <button type="button" className="a-btn a-btn--suave" onClick={() => editarGrupo(gi, { items: [...g.items, { nombre: "", precio: 0 }] })}>
              + Agregar valor
            </button>
            <BotonEliminar que={`el grupo ${g.categoria}`} onConfirmar={() => a.setBorrador(a.borrador.filter((_, j) => j !== gi))} />
          </div>
        </section>
      ))}
      <button type="button" className="a-btn a-btn--suave" onClick={() => a.setBorrador([...a.borrador, { categoria: "", items: [{ nombre: "", precio: 0 }] }])}>
        + Agregar grupo de aranceles
      </button>

      <BarraGuardar
        cambios={s.cambios || a.cambios}
        guardando={guardando}
        onGuardar={guardarTodo}
        onDescartar={() => {
          s.descartar();
          a.descartar();
        }}
      />
    </div>
  );
}
