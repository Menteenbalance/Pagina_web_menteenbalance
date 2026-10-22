// ─────────────────────────────────────────────────────────────
//  HISTORIAL Y DESHACER
//  Botón "Historial" de cada pestaña del panel: muestra las últimas
//  versiones guardadas, qué cambiaría al volver a cada una y permite
//  restaurarla. Restaurar también queda en el historial.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import type { Contenido, VersionHistorial } from "../types";
import { api, type Seccion } from "./api";
import { cantidad, compararVersiones } from "./diferencias";

export interface SeccionHistorial {
  seccion: Seccion;
  /** Nombre que ve Mari, ej: "Clases que se repiten" */
  nombre: string;
}

interface Fila extends VersionHistorial {
  seccion: Seccion;
  nombre: string;
}

const relativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const absoluto = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function haceCuanto(iso: string): string {
  const seg = (new Date(iso).getTime() - Date.now()) / 1000;
  const tramos: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unidad, s] of tramos) {
    if (Math.abs(seg) >= s) return relativo.format(Math.round(seg / s), unidad);
  }
  return "recién";
}

function Lista({ titulo, items, clase }: { titulo: string; items: string[]; clase: string }) {
  if (!items.length) return null;
  const visibles = items.slice(0, 6);
  return (
    <p className={`a-hist__cambio ${clase}`}>
      <strong>{titulo}:</strong> {visibles.join(", ")}
      {items.length > visibles.length && ` y ${items.length - visibles.length} más`}
    </p>
  );
}

export default function Historial({
  secciones,
  contenido,
  onRestaurar,
}: {
  secciones: SeccionHistorial[];
  contenido: Contenido;
  onRestaurar: (seccion: Seccion, fecha: string) => Promise<boolean>;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [error, setError] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [restaurando, setRestaurando] = useState(false);
  const claveSecciones = secciones.map((s) => s.seccion).join(",");

  async function cargar() {
    setFilas(null);
    setError("");
    try {
      const listas = await Promise.all(
        secciones.map(async (s) =>
          (await api.historial(s.seccion)).versiones.map((v) => ({ ...v, seccion: s.seccion, nombre: s.nombre }))
        )
      );
      setFilas(listas.flat().sort((a, b) => b.fecha.localeCompare(a.fecha)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    if (!abierto) return;
    dialogo.current?.showModal();
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, claveSecciones]);

  function cerrar() {
    dialogo.current?.close();
  }

  async function restaurar(f: Fila) {
    setRestaurando(true);
    const ok = await onRestaurar(f.seccion, f.fecha);
    setRestaurando(false);
    setConfirmando(null);
    if (ok) cerrar();
  }

  const nombreGrupo = secciones.length === 1 ? secciones[0].nombre : secciones.map((s) => s.nombre).join(" y ");

  return (
    <>
      <button type="button" className="a-btn a-btn--ghost a-hist__abrir" onClick={() => setAbierto(true)}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 3v5h5M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Historial
      </button>

      {abierto && (
        <dialog
          ref={dialogo}
          className="a-hist"
          aria-labelledby="hist-titulo"
          onClose={() => {
            setAbierto(false);
            setConfirmando(null);
          }}
        >
          <header className="a-hist__head">
            <div>
              <h2 id="hist-titulo" className="a-hist__titulo">Historial · {nombreGrupo}</h2>
              <p className="a-campo__ayuda">
                Cada vez que guardas, la versión anterior queda aquí (las últimas 15 por sección). Restaurar
                también se puede deshacer.
              </p>
            </div>
            <button type="button" className="a-btn a-btn--ghost" onClick={cerrar}>
              Cerrar
            </button>
          </header>

          {error && (
            <p className="a-campo__error" role="alert">
              {error}
            </p>
          )}
          {!filas && !error && <p className="a-cargando">Cargando historial…</p>}
          {filas && filas.length === 0 && (
            <p className="a-vacio">Aún no hay versiones anteriores. Aparecerán aquí después de guardar un cambio.</p>
          )}

          {filas && filas.length > 0 && (
            <ol className="a-hist__lista">
              {filas.map((f) => {
                const id = `${f.seccion}|${f.fecha}`;
                const dif = compararVersiones(f.seccion, f.datos, contenido[f.seccion]);
                return (
                  <li key={id} className="a-hist__item">
                    <div className="a-hist__meta">
                      <span className="a-hist__cuando">
                        <time dateTime={f.fecha}>{absoluto.format(new Date(f.fecha))}</time> · {haceCuanto(f.fecha)}
                      </span>
                      {secciones.length > 1 && <span className="a-hist__seccion">{f.nombre}</span>}
                    </div>
                    <p className="a-hist__resumen">
                      {f.original ? "Contenido original del sitio" : "Versión"} con {cantidad(f.seccion, f.datos)}
                      <span className="a-hist__autor"> · reemplazada por {f.autor}</span>
                    </p>
                    {dif.igual ? (
                      <p className="a-hist__cambio">Es igual a lo que tienes ahora.</p>
                    ) : (
                      <div className="a-hist__cambios">
                        <span className="a-hist__si">Si la restauras:</span>
                        <Lista titulo="Vuelve" items={dif.vuelven} clase="is-vuelve" />
                        <Lista titulo="Se quita" items={dif.salen} clase="is-sale" />
                        <Lista titulo="Cambia" items={dif.cambian} clase="is-cambia" />
                      </div>
                    )}
                    {!dif.igual &&
                      (confirmando === id ? (
                        <div className="a-confirmar" role="group" aria-label="Confirmar restauración">
                          <span className="a-confirmar__texto">
                            ¿Restaurar? Lo actual quedará en el historial y se descartan los cambios sin guardar de esta pestaña.
                          </span>
                          <button type="button" className="a-btn a-btn--primario" onClick={() => restaurar(f)} disabled={restaurando} aria-busy={restaurando} autoFocus>
                            {restaurando ? "Restaurando…" : "Sí, restaurar"}
                          </button>
                          <button type="button" className="a-btn a-btn--ghost" onClick={() => setConfirmando(null)} disabled={restaurando}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="a-btn a-btn--ghost" onClick={() => setConfirmando(id)}>
                          Restaurar esta versión
                        </button>
                      ))}
                  </li>
                );
              })}
            </ol>
          )}
        </dialog>
      )}
    </>
  );
}
