// ─────────────────────────────────────────────────────────────
//  PESTAÑA TEXTOS DEL PANEL
//  Todos los textos largos del sitio, agrupados por página y bloque,
//  y la lista "Mi formación" de Detrás de Mente en Balance (agregar,
//  editar, ordenar y quitar estudios). Se guarda todo junto con la
//  barra inferior; cada texto puede volver a su versión original.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Formacion } from "../types";
import { LUGARES_TEXTOS, type LugarTexto } from "../lib/textos";
import type { Guardar } from "./AdminApp";
import { BarraGuardar, BotonEliminar, Campo, mover, useBorrador } from "./ui";

type Textos = Partial<Record<string, string>>;

const PAGINA: Record<string, string> = {
  Inicio: "/",
  "Detrás de Mente en Balance": "/detras-de-mente-en-balance",
  Servicios: "/servicios",
};

const AYUDA: Record<LugarTexto["tipo"], string> = {
  linea: "",
  titulo: "Enter = salto de línea en el título.",
  parrafos: "Deja una línea en blanco entre párrafos. Admite **negrita**, *cursiva* y [enlaces](https://…).",
  lista: "Una frase por línea.",
};

function CampoTexto({
  lugar,
  valor,
  onCambio,
}: {
  lugar: LugarTexto;
  valor: string;
  onCambio: (v: string) => void;
}) {
  const editado = valor.trim() !== lugar.original.trim();
  const ayuda = [AYUDA[lugar.tipo], `${valor.length}/${lugar.max}`].filter(Boolean).join(" ");
  const filas =
    lugar.tipo === "linea"
      ? lugar.max > 120
        ? 2
        : 1
      : Math.min(14, Math.max(lugar.tipo === "titulo" ? 2 : 3, valor.split("\n").length + 1));
  return (
    <div className="a-texto">
      <div className="a-texto__cabeza">
        {editado && <span className="a-estado a-estado--pub">Editado</span>}
        {editado && (
          <button type="button" className="a-btn a-btn--ghost a-btn--chico" onClick={() => onCambio(lugar.original)}>
            Volver al original
          </button>
        )}
      </div>
      <Campo etiqueta={lugar.nombre} ayuda={ayuda}>
        {(p) =>
          filas === 1 ? (
            <input {...p} className="a-input" maxLength={lugar.max} value={valor} onChange={(e) => onCambio(e.target.value)} />
          ) : (
            <textarea
              {...p}
              className="a-input a-textarea"
              rows={filas}
              maxLength={lugar.max}
              value={valor}
              onChange={(e) => onCambio(lugar.tipo === "linea" ? e.target.value.replace(/\n/g, " ") : e.target.value)}
            />
          )
        }
      </Campo>
    </div>
  );
}

function EditorFormacion({
  lista,
  setLista,
}: {
  lista: Formacion[];
  setLista: (l: Formacion[]) => void;
}) {
  const editar = (i: number, c: Partial<Formacion>) => setLista(lista.map((f, j) => (j === i ? { ...f, ...c } : f)));
  const agregar = () =>
    setLista([
      { id: crypto.randomUUID(), anio: String(new Date().getFullYear()), titulo: "", lugar: "" },
      ...lista,
    ]);
  const ordenar = () =>
    setLista([...lista].sort((a, b) => (parseInt(b.anio, 10) || 9999) - (parseInt(a.anio, 10) || 9999)));

  return (
    <div className="a-bloque" id="formacion">
      <div className="a-bloque__cabeza">
        <h3 className="a-bloque__titulo">Mi formación</h3>
        <div className="a-foto__acciones">
          <button type="button" className="a-btn a-btn--ghost" onClick={ordenar} disabled={lista.length < 2}>
            Ordenar por año
          </button>
          <button type="button" className="a-btn a-btn--primario" onClick={agregar}>
            + Agregar estudio
          </button>
        </div>
      </div>
      <p className="a-campo__ayuda">
        Se muestra en este orden. El estudio nuevo aparece primero; usa las flechas o "Ordenar por año" para moverlo.
      </p>
      {lista.length === 0 && <p className="a-vacio">No hay estudios. Agrega el primero.</p>}
      <ol className="a-formacion">
        {lista.map((f, i) => (
          <li key={f.id} className="a-item a-formacion__item">
            <div className="a-grid-formacion">
              <Campo etiqueta="Año">
                {(p) => <input {...p} className="a-input" maxLength={20} value={f.anio} placeholder="2026 o En curso" onChange={(e) => editar(i, { anio: e.target.value })} />}
              </Campo>
              <Campo etiqueta="Título o certificación">
                {(p) => (
                  <input {...p} className="a-input" maxLength={140} value={f.titulo} placeholder="Ej: Diplomado en Mindfulness" onChange={(e) => editar(i, { titulo: e.target.value })} autoFocus={!f.titulo} />
                )}
              </Campo>
            </div>
            <Campo etiqueta="Institución y lugar">
              {(p) => <input {...p} className="a-input" maxLength={140} value={f.lugar} placeholder="Ej: Universidad de Chile" onChange={(e) => editar(i, { lugar: e.target.value })} />}
            </Campo>
            <Campo etiqueta="Detalle (opcional)" ayuda={`${(f.detalle ?? "").length}/400`}>
              {(p) => (
                <textarea {...p} className="a-input a-textarea" rows={2} maxLength={400} value={f.detalle ?? ""} placeholder="Contenidos, horas, mención…" onChange={(e) => editar(i, { detalle: e.target.value || undefined })} />
              )}
            </Campo>
            <div className="a-item__pie a-item__pie--entre">
              <div className="a-foto__acciones">
                <button type="button" className="a-btn a-btn--icono" onClick={() => setLista(mover(lista, i, -1))} disabled={i === 0} aria-label={`Subir ${f.titulo || "estudio"}`}>↑</button>
                <button type="button" className="a-btn a-btn--icono" onClick={() => setLista(mover(lista, i, 1))} disabled={i === lista.length - 1} aria-label={`Bajar ${f.titulo || "estudio"}`}>↓</button>
              </div>
              <BotonEliminar que={`el estudio ${f.titulo}`} onConfirmar={() => setLista(lista.filter((_, j) => j !== i))} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function EditorTextos({
  textos,
  formacion,
  guardar,
}: {
  textos: Textos;
  formacion: Formacion[];
  guardar: Guardar;
}) {
  const t = useBorrador<Textos>(textos);
  const f = useBorrador<Formacion[]>(formacion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const valor = (l: LugarTexto) => t.borrador[l.clave] ?? l.original;
  const cambiar = (l: LugarTexto, v: string) => {
    const nuevo = { ...t.borrador };
    if (v.trim() === l.original.trim()) delete nuevo[l.clave];
    else nuevo[l.clave] = v;
    t.setBorrador(nuevo);
  };

  async function guardarTodo() {
    const incompleto = f.borrador.find((x) => !x.titulo.trim() || !x.anio.trim());
    if (incompleto) {
      setError("En Mi formación, cada estudio necesita año y título.");
      document.getElementById("formacion")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError("");
    setGuardando(true);
    if (t.cambios) await guardar("textos", t.borrador);
    if (f.cambios) await guardar("formacion", f.borrador);
    setGuardando(false);
  }

  const grupos = [...new Set(LUGARES_TEXTOS.map((l) => l.grupo))];
  const editados = Object.keys(textos).length;

  return (
    <div className="a-seccion">
      <header className="a-seccion__head">
        <h1 className="a-h1">Textos</h1>
        <p className="a-lead">
          Los textos de las páginas y tu formación. Cambia lo que quieras y guarda con la barra de abajo; cada texto puede
          volver a su versión original. {editados > 0 && `Has editado ${editados} de ${LUGARES_TEXTOS.length}.`}
        </p>
        <p className="a-campo__ayuda">
          Los servicios y las publicaciones se editan en sus propias pestañas.{" "}
          <a href="#formacion">Ir a Mi formación ↓</a>
        </p>
      </header>

      {error && (
        <p className="a-campo__error" role="alert">
          {error}
        </p>
      )}

      {grupos.map((g) => {
        const lugares = LUGARES_TEXTOS.filter((l) => l.grupo === g) as readonly LugarTexto[];
        const bloques = [...new Set(lugares.map((l) => l.bloque))];
        return (
          <section key={g} className="a-fotos__grupo" aria-labelledby={`textos-${g}`}>
            <div className="a-fotos__grupo-head">
              <h2 className="a-h2" id={`textos-${g}`}>
                {g}
              </h2>
              {PAGINA[g] && (
                <a className="a-btn a-btn--ghost" href={PAGINA[g]} target="_blank" rel="noopener noreferrer">
                  Ver en el sitio
                </a>
              )}
            </div>
            {bloques.map((b) => (
              <div key={b}>
                <div className="a-item a-bloque">
                  <h3 className="a-bloque__titulo">{b}</h3>
                  {lugares
                    .filter((l) => l.bloque === b)
                    .map((l) => (
                      <CampoTexto key={l.clave} lugar={l} valor={valor(l)} onCambio={(v) => cambiar(l, v)} />
                    ))}
                </div>
                {g === "Detrás de Mente en Balance" && b === "Acompañar" && (
                  <EditorFormacion lista={f.borrador} setLista={f.setBorrador} />
                )}
              </div>
            ))}
          </section>
        );
      })}

      <BarraGuardar
        cambios={t.cambios || f.cambios}
        guardando={guardando}
        onGuardar={guardarTodo}
        onDescartar={() => {
          t.descartar();
          f.descartar();
          setError("");
        }}
      />
    </div>
  );
}
