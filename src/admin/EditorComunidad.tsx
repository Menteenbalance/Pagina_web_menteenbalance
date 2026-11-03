// ─────────────────────────────────────────────────────────────
//  PESTAÑA COMUNIDAD DEL PANEL
//  Mari prepara los mensajes para la comunidad de WhatsApp con el mismo
//  formato de WhatsApp (negrita, cursiva, listas, emojis) y los programa.
//  A la hora fijada le suena un recordatorio en su calendario; desde ahí
//  abre el mensaje y lo envía con dos toques. El envío siempre lo hace
//  ella desde WhatsApp: así su número nunca corre riesgo de bloqueo.
// ─────────────────────────────────────────────────────────────

import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import type { MensajeComunidad } from "../types";
import { formatearFecha } from "../lib/formato";
import { ahoraEnSantiago } from "../lib/tiempo";
import { url as urlDelSitio } from "../config";
import type { Guardar } from "./AdminApp";
import { BotonEliminar, Campo } from "./ui";
import { VistaWhatsApp } from "./formatoWhatsApp";
import { GRUPOS_EMOJIS } from "./emojis";
import { archivoIcs, enlaceGoogleCalendar } from "./calendario";

const MAX_TEXTO = 4000;

type Estado = "pendiente" | "programado" | "borrador" | "enviado";

function estadoDe(m: MensajeComunidad, ahora: string): Estado {
  if (m.enviadoEl) return "enviado";
  if (!m.programadoEl) return "borrador";
  return m.programadoEl <= ahora ? "pendiente" : "programado";
}

/** "lunes, 10 de noviembre de 2026, 08:00" */
function cuandoLegible(v: string): string {
  const [f, h] = v.split("T");
  return `${formatearFecha(f).larga}, ${h}`;
}

/** Abre WhatsApp para elegir el chat (la comunidad) con el texto listo. */
function enlaceCompartir(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

const ETIQUETA: Record<Estado, { texto: string; clase: string }> = {
  pendiente: { texto: "Toca enviarlo", clase: "a-estado a-estado--alerta" },
  programado: { texto: "Programado", clase: "a-estado a-estado--prog" },
  borrador: { texto: "Borrador", clase: "a-estado" },
  enviado: { texto: "Enviado", clase: "a-estado a-estado--pub" },
};

export default function EditorComunidad({ mensajes, guardar }: { mensajes: MensajeComunidad[]; guardar: Guardar }) {
  return (
    <Routes>
      <Route index element={<Lista mensajes={mensajes} guardar={guardar} />} />
      <Route path="nuevo" element={<Formulario key="nuevo" mensajes={mensajes} guardar={guardar} />} />
      <Route path=":id" element={<FormularioPorId mensajes={mensajes} guardar={guardar} />} />
    </Routes>
  );
}

function FormularioPorId(props: { mensajes: MensajeComunidad[]; guardar: Guardar }) {
  const { id } = useParams();
  return <Formulario key={id} {...props} />;
}

/* ── Lista ─────────────────────────────────────────────────────── */
function Lista({ mensajes, guardar }: { mensajes: MensajeComunidad[]; guardar: Guardar }) {
  const ahora = ahoraEnSantiago();
  const grupos = useMemo(() => {
    const por = (e: Estado) => mensajes.filter((m) => estadoDe(m, ahora) === e);
    const asc = (a: MensajeComunidad, b: MensajeComunidad) => (a.programadoEl ?? "").localeCompare(b.programadoEl ?? "");
    return {
      pendiente: por("pendiente").sort(asc),
      programado: por("programado").sort(asc),
      borrador: por("borrador"),
      enviado: por("enviado").sort((a, b) => (b.enviadoEl ?? "").localeCompare(a.enviadoEl ?? "")),
    };
  }, [mensajes, ahora]);

  const fila = (m: MensajeComunidad) => {
    const e = estadoDe(m, ahora);
    const primera = m.texto.split("\n").find((l) => l.trim()) ?? "";
    return (
      <li key={m.id} className={e === "pendiente" ? "a-msj is-pendiente" : "a-msj"}>
        <div className="a-msj__cuerpo">
          <div className="a-foto__titulo">
            <span className={ETIQUETA[e].clase}>{ETIQUETA[e].texto}</span>
            {m.programadoEl && e !== "enviado" && <span className="a-msj__cuando">{cuandoLegible(m.programadoEl)}</span>}
            {e === "enviado" && m.enviadoEl && (
              <span className="a-msj__cuando">
                Enviado el {formatearFecha(ahoraEnSantiago(new Date(m.enviadoEl)).slice(0, 10)).larga}
              </span>
            )}
          </div>
          <h3 className="a-evento__titulo">{m.titulo || "Mensaje sin nombre"}</h3>
          <p className="a-msj__extracto">{primera.replace(/[*_~`]/g, "")}</p>
        </div>
        <div className="a-evento__acciones">
          {e !== "enviado" && (
            <a className="a-btn a-btn--primario" href={enlaceCompartir(m.texto)} target="_blank" rel="noopener noreferrer" aria-label={`Enviar ${m.titulo || "mensaje"} por WhatsApp`}>
              Enviar
            </a>
          )}
          <Link className="a-btn a-btn--ghost" to={m.id} aria-label={`Abrir ${m.titulo || "mensaje"}`}>
            Abrir
          </Link>
          <BotonEliminar que={`el mensaje ${m.titulo || ""}`} onConfirmar={() => guardar("comunidad", mensajes.filter((x) => x.id !== m.id))} />
        </div>
      </li>
    );
  };

  return (
    <div className="a-seccion">
      <header className="a-seccion__head a-seccion__head--fila">
        <div>
          <h1 className="a-h1">Comunidad</h1>
          <p className="a-lead">
            Prepara y programa los mensajes para la comunidad de WhatsApp. A la hora fijada te suena un recordatorio y
            lo envías con dos toques.
          </p>
        </div>
        <Link to="nuevo" className="a-btn a-btn--primario">
          + Nuevo mensaje
        </Link>
      </header>

      {grupos.pendiente.length > 0 && (
        <>
          <h2 className="a-h2">Toca enviarlos ({grupos.pendiente.length})</h2>
          <ul className="a-msjs">{grupos.pendiente.map(fila)}</ul>
        </>
      )}

      <h2 className="a-h2">Programados ({grupos.programado.length})</h2>
      {grupos.programado.length === 0 ? (
        <p className="a-vacio">No hay mensajes programados.</p>
      ) : (
        <ul className="a-msjs">{grupos.programado.map(fila)}</ul>
      )}

      {grupos.borrador.length > 0 && (
        <>
          <h2 className="a-h2">Borradores ({grupos.borrador.length})</h2>
          <ul className="a-msjs">{grupos.borrador.map(fila)}</ul>
        </>
      )}

      {grupos.enviado.length > 0 && (
        <details className="a-pasadas">
          <summary className="a-h2">Enviados ({grupos.enviado.length})</summary>
          <ul className="a-msjs">{grupos.enviado.map(fila)}</ul>
        </details>
      )}
    </div>
  );
}

/* ── Escribir / programar / enviar ────────────────────────────── */
function Formulario({ mensajes, guardar }: { mensajes: MensajeComunidad[]; guardar: Guardar }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const existente = id ? mensajes.find((m) => m.id === id) : undefined;
  const [msj, setMsj] = useState<MensajeComunidad>(
    () => existente ?? { id: crypto.randomUUID(), titulo: "", texto: "" }
  );
  const [programar, setProgramar] = useState(() => !!existente?.programadoEl);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [emojisAbiertos, setEmojisAbiertos] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  if (id && !existente) {
    return (
      <div className="a-seccion">
        <p className="a-vacio">Este mensaje ya no existe.</p>
        <Link to="/admin/comunidad" className="a-btn a-btn--ghost">Volver a Comunidad</Link>
      </div>
    );
  }

  const cambio = (c: Partial<MensajeComunidad>) => setMsj((m) => ({ ...m, ...c }));
  const sinGuardar = !existente || JSON.stringify(existente) !== JSON.stringify(final());

  function final(): MensajeComunidad {
    return { ...msj, programadoEl: programar ? msj.programadoEl : undefined };
  }

  /** Inserta texto o envuelve la selección con una marca de formato. */
  function aplicar(antes: string, despues = antes, porLinea = false) {
    const t = area.current;
    if (!t) return;
    const { selectionStart: a, selectionEnd: b, value } = t;
    let nuevo: string;
    let cursor: [number, number];
    if (porLinea) {
      const inicio = value.lastIndexOf("\n", a - 1) + 1;
      const bloque = value.slice(inicio, b);
      const lineas = bloque.split("\n").map((l, i) => `${antes === "1. " ? `${i + 1}. ` : antes}${l}`);
      const res = lineas.join("\n");
      nuevo = value.slice(0, inicio) + res + value.slice(b);
      cursor = [inicio, inicio + res.length];
    } else {
      const sel = value.slice(a, b) || "texto";
      nuevo = value.slice(0, a) + antes + sel + despues + value.slice(b);
      cursor = [a + antes.length, a + antes.length + sel.length];
    }
    cambio({ texto: nuevo.slice(0, MAX_TEXTO) });
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(...cursor);
    });
  }

  function insertar(texto: string) {
    const t = area.current;
    if (!t) return;
    const { selectionStart: a, selectionEnd: b, value } = t;
    cambio({ texto: (value.slice(0, a) + texto + value.slice(b)).slice(0, MAX_TEXTO) });
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(a + texto.length, a + texto.length);
    });
  }

  async function guardarMensaje(e?: FormEvent) {
    e?.preventDefault();
    const m = final();
    if (!m.texto.trim()) return setError("Escribe el mensaje antes de guardarlo.");
    if (programar && !m.programadoEl) return setError("Elige el día y la hora del envío.");
    if (programar && m.programadoEl && m.programadoEl <= ahoraEnSantiago() && !existente?.programadoEl)
      return setError("Elige una fecha y hora futuras.");
    setError("");
    setGuardando(true);
    const lista = existente ? mensajes.map((x) => (x.id === m.id ? m : x)) : [m, ...mensajes];
    const ok = await guardar("comunidad", lista);
    setGuardando(false);
    if (ok && !existente) navegar(`/admin/comunidad/${m.id}`, { replace: true });
  }

  async function marcarEnviado(enviado: boolean) {
    if (!existente) return;
    const m = { ...final(), enviadoEl: enviado ? new Date().toISOString() : undefined };
    setGuardando(true);
    const ok = await guardar("comunidad", mensajes.map((x) => (x.id === m.id ? m : x)));
    setGuardando(false);
    if (ok) setMsj(m);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(msj.texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      area.current?.select();
    }
  }

  function descargarIcs() {
    if (!existente?.programadoEl) return;
    const blob = archivoIcs(recordatorio(existente));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `recordatorio-comunidad-${existente.programadoEl.slice(0, 10)}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const recordatorio = (m: MensajeComunidad) => ({
    id: m.id,
    titulo: m.titulo || "Mensaje",
    cuando: m.programadoEl!,
    detalle: m.texto.slice(0, 300),
    enlace: urlDelSitio(`/admin/comunidad/${m.id}`),
  });

  const estado = existente ? estadoDe(existente, ahoraEnSantiago()) : "borrador";
  const herramientas: [string, string, () => void][] = [
    ["N", "Negrita (*texto*)", () => aplicar("*")],
    ["C", "Cursiva (_texto_)", () => aplicar("_")],
    ["T", "Tachado (~texto~)", () => aplicar("~")],
    ["</>", "Monoespaciado (```texto```)", () => aplicar("```")],
    ["•", "Lista", () => aplicar("- ", "", true)],
    ["1.", "Lista numerada", () => aplicar("1. ", "", true)],
    ["❝", "Cita", () => aplicar("> ", "", true)],
  ];

  return (
    <div className="a-seccion">
      <Link to="/admin/comunidad" className="a-volver">← Volver a Comunidad</Link>
      <header className="a-seccion__head">
        <h1 className="a-h1">{existente ? existente.titulo || "Mensaje" : "Nuevo mensaje"}</h1>
        {existente && (
          <p className="a-lead">
            <span className={ETIQUETA[estado].clase}>{ETIQUETA[estado].texto}</span>{" "}
            {existente.programadoEl && estado !== "enviado" && cuandoLegible(existente.programadoEl)}
          </p>
        )}
      </header>

      {/* Envío: lo primero que ve Mari al abrir el recordatorio */}
      {existente && estado !== "enviado" && (
        <section className="a-item a-enviar" aria-labelledby="titulo-enviar">
          <h2 className="a-item__titulo" id="titulo-enviar">Enviar a la comunidad</h2>
          <ol className="a-enviar__pasos">
            <li>Toca <strong>Abrir WhatsApp</strong>.</li>
            <li>Elige el grupo de avisos de la comunidad.</li>
            <li>Revisa y toca enviar. Luego vuelve y márcalo como enviado.</li>
          </ol>
          <div className="a-foto__acciones">
            <a className="a-btn a-btn--primario" href={enlaceCompartir(msj.texto)} target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp
            </a>
            <button type="button" className="a-btn a-btn--ghost" onClick={copiar} aria-live="polite">
              {copiado ? "¡Copiado!" : "Copiar texto"}
            </button>
            <button type="button" className="a-btn a-btn--ghost" onClick={() => marcarEnviado(true)} disabled={guardando}>
              Marcar como enviado
            </button>
          </div>
        </section>
      )}
      {existente && estado === "enviado" && (
        <div className="a-item a-enviar">
          <p className="a-campo__ayuda">Ya marcaste este mensaje como enviado.</p>
          <div className="a-foto__acciones">
            <button type="button" className="a-btn a-btn--ghost" onClick={() => marcarEnviado(false)} disabled={guardando}>
              Marcar como no enviado
            </button>
            <button
              type="button"
              className="a-btn a-btn--ghost"
              onClick={() => {
                const copia: MensajeComunidad = { id: crypto.randomUUID(), titulo: `${existente.titulo} (copia)`.trim(), texto: existente.texto };
                guardar("comunidad", [copia, ...mensajes]).then((ok) => ok && navegar(`/admin/comunidad/${copia.id}`));
              }}
            >
              Usar como base para uno nuevo
            </button>
          </div>
        </div>
      )}

      <form className="a-comunidad" onSubmit={guardarMensaje}>
        <div className="a-item a-comunidad__editor">
          <Campo etiqueta="Nombre interno (solo lo ves tú)">
            {(p) => (
              <input {...p} className="a-input" maxLength={80} value={msj.titulo} placeholder="Ej: Recordatorio clase del lunes" onChange={(e) => cambio({ titulo: e.target.value })} autoFocus={!existente} />
            )}
          </Campo>

          <div className="a-campo">
            <span className="a-campo__label" id="etiqueta-texto">Mensaje</span>
            <div className="a-wa-barra" role="toolbar" aria-label="Formato del mensaje">
              {herramientas.map(([icono, nombre, accion]) => (
                <button key={nombre} type="button" className={`a-wa-boton a-wa-boton--${icono === "N" ? "n" : icono === "C" ? "c" : icono === "T" ? "t" : "x"}`} onClick={accion} title={nombre} aria-label={nombre}>
                  {icono}
                </button>
              ))}
              <button type="button" className="a-wa-boton" aria-expanded={emojisAbiertos} aria-controls="emojis" onClick={() => setEmojisAbiertos((v) => !v)} title="Emojis" aria-label="Emojis">
                😊
              </button>
            </div>
            {emojisAbiertos && (
              <div className="a-emojis" id="emojis" role="group" aria-label="Elegir emoji">
                {GRUPOS_EMOJIS.map((g) => (
                  <div key={g.nombre} className="a-emojis__grupo">
                    <span className="a-emojis__nombre">{g.nombre}</span>
                    <div className="a-emojis__lista">
                      {g.emojis.map((e) => (
                        <button key={e} type="button" className="a-emoji" onClick={() => insertar(e)} aria-label={`Insertar ${e}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="a-campo__ayuda">Más emojis: el teclado del celular, o Windows + . (punto) en el computador.</p>
              </div>
            )}
            <textarea
              ref={area}
              className="a-input a-textarea a-textarea--largo"
              rows={12}
              maxLength={MAX_TEXTO}
              value={msj.texto}
              aria-labelledby="etiqueta-texto"
              aria-describedby="ayuda-texto"
              placeholder={"¡Hola comunidad! 🌿\n\nEste lunes retomamos *Vinyasa Yoga* a las 20:00 en Casa Lunay.\n\n- Trae tu mat\n- Llega 10 min antes\n\nLas espero 🙏"}
              onChange={(e) => cambio({ texto: e.target.value })}
            />
            <p className="a-campo__ayuda" id="ayuda-texto">
              Selecciona texto y usa los botones, o escribe *negrita*, _cursiva_, ~tachado~ como en WhatsApp. {msj.texto.length}/{MAX_TEXTO}
            </p>
          </div>

          <div className="a-programar">
            <label className="a-check">
              <input type="checkbox" checked={programar} onChange={(e) => { setProgramar(e.target.checked); setError(""); }} />
              Programar el envío
            </label>
            {programar && (
              <Campo etiqueta="Enviar el" ayuda="Hora de Chile. Ese día te sonará un recordatorio para enviarlo.">
                {(p) => (
                  <input {...p} className="a-input a-input--fecha-hora" type="datetime-local" required value={msj.programadoEl ?? ""} onChange={(e) => { setError(""); cambio({ programadoEl: e.target.value || undefined }); }} />
                )}
              </Campo>
            )}
          </div>

          {error && <p className="a-campo__error" role="alert">{error}</p>}

          <div className="a-item__pie a-item__pie--entre">
            <Link to="/admin/comunidad" className="a-btn a-btn--ghost">Cancelar</Link>
            <button type="submit" className="a-btn a-btn--primario" disabled={guardando || !sinGuardar} aria-busy={guardando}>
              {guardando ? "Guardando…" : !sinGuardar ? "Guardado" : programar ? "Guardar y programar" : "Guardar borrador"}
            </button>
          </div>

          {/* Recordatorio en el calendario (con la versión guardada) */}
          {existente?.programadoEl && estado !== "enviado" && !sinGuardar && (
            <div className="a-recordatorio">
              <h2 className="a-item__titulo">Recordatorio</h2>
              <p className="a-campo__ayuda">
                Agrégalo a tu calendario: te avisará el {cuandoLegible(existente.programadoEl)} con el enlace a este mensaje.
              </p>
              <div className="a-foto__acciones">
                <a className="a-btn a-btn--ghost" href={enlaceGoogleCalendar(recordatorio(existente))} target="_blank" rel="noopener noreferrer">
                  Google Calendar
                </a>
                <button type="button" className="a-btn a-btn--ghost" onClick={descargarIcs}>
                  iPhone / Outlook (.ics)
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="a-comunidad__previa" aria-label="Vista previa en WhatsApp">
          <span className="a-campo__label">Así se verá en WhatsApp</span>
          <div className="wa-fondo">
            <div className="wa-burbuja">
              {msj.texto.trim() ? <VistaWhatsApp texto={msj.texto} /> : <span className="wa-vacio">Escribe tu mensaje…</span>}
              <span className="wa-hora">{msj.programadoEl && programar ? msj.programadoEl.slice(11) : "ahora"} ✓✓</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
