// ─────────────────────────────────────────────────────────────
//  RESPALDOS (panel → botón "Respaldos" arriba)
//  - Copia automática cada lunes (se guardan las últimas 12 semanas).
//  - Descargar una copia ahora.
//  - Restaurar desde un archivo de respaldo (cada sección queda en el
//    Historial, así que se puede deshacer).
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { apiRespaldo, type RespaldoGuardado, type Seccion } from "./api";

const NOMBRES: Record<Seccion, string> = {
  servicios: "Servicios",
  aranceles: "Aranceles",
  agenda: "Agenda",
  recurrentes: "Actividades que se repiten",
  posts: "Diario",
  ajustes: "Instagram",
  fotos: "Fotos",
  comunidad: "Comunidad",
  textos: "Textos",
  formacion: "Mi formación",
  enlaces: "Enlaces",
};

interface Archivo {
  nombre: string;
  datos: { creado?: string; secciones?: Record<string, unknown> };
}

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Respaldos() {
  const [lista, setLista] = useState<RespaldoGuardado[] | null>(null);
  const [errorLista, setErrorLista] = useState("");
  const [archivo, setArchivo] = useState<Archivo | null>(null);
  const [error, setError] = useState("");
  const [restaurando, setRestaurando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiRespaldo
      .lista()
      .then((r) => setLista(r.respaldos))
      .catch((e) => {
        setLista([]);
        setErrorLista((e as Error).message);
      });
  }, []);

  async function elegir(f: File | undefined) {
    setError("");
    setArchivo(null);
    if (!f) return;
    try {
      const datos = JSON.parse(await f.text());
      if (datos?.sitio !== "Mente en Balance" || typeof datos.secciones !== "object") throw new Error();
      setArchivo({ nombre: f.name, datos });
    } catch {
      setError("Ese archivo no es un respaldo de Mente en Balance.");
    } finally {
      if (entrada.current) entrada.current.value = "";
    }
  }

  async function restaurar() {
    if (!archivo) return;
    setRestaurando(true);
    setError("");
    try {
      await apiRespaldo.restaurar(archivo.datos);
      // Recarga el panel con el contenido restaurado
      window.location.assign("/admin");
    } catch (e) {
      setError((e as Error).message);
      setRestaurando(false);
    }
  }

  const secciones = archivo ? Object.keys(archivo.datos.secciones ?? {}).filter((s): s is Seccion => s in NOMBRES) : [];

  return (
    <div className="a-seccion">
      <header className="a-seccion__head">
        <h1 className="a-h1">Respaldos</h1>
        <p className="a-lead">
          Cada lunes se guarda solo una copia de todo lo que has editado en el panel; se conservan las últimas 12
          semanas. También puedes descargar una copia ahora y guardarla donde quieras.
        </p>
      </header>

      <section className="a-item a-bloque">
        <h2 className="a-bloque__titulo">Descargar una copia</h2>
        <p className="a-campo__ayuda">Un archivo .json con servicios, agenda, Diario, textos, fotos y mensajes de la comunidad.</p>
        <div className="a-foto__acciones">
          <a className="a-btn a-btn--primario" href="/api/admin/respaldo" download>
            Descargar copia de hoy
          </a>
        </div>
      </section>

      <section className="a-item a-bloque">
        <h2 className="a-bloque__titulo">Copias automáticas</h2>
        {lista === null && <p className="a-campo__ayuda">Cargando…</p>}
        {errorLista && (
          <p className="a-campo__error" role="alert">
            {errorLista}
          </p>
        )}
        {lista?.length === 0 && !errorLista && (
          <p className="a-vacio">Todavía no hay copias automáticas. La primera se crea el próximo lunes.</p>
        )}
        {lista && lista.length > 0 && (
          <ul className="a-respaldos">
            {lista.map((r) => (
              <li key={r.url} className="a-respaldos__item">
                <span className="a-respaldos__fecha">{fechaLarga(r.fecha)}</span>
                <span className="a-respaldos__peso">{Math.max(1, Math.round(r.bytes / 1024))} KB</span>
                <a className="a-btn a-btn--ghost a-btn--chico" href={r.url} download>
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="a-item a-bloque">
        <h2 className="a-bloque__titulo">Restaurar desde un archivo</h2>
        <p className="a-campo__ayuda">
          Reemplaza el contenido actual por el del respaldo. Lo que había queda en el Historial de cada pestaña, así
          que puedes deshacerlo.
        </p>
        <div className="a-foto__acciones">
          <button type="button" className="a-btn a-btn--ghost" onClick={() => entrada.current?.click()} disabled={restaurando}>
            Elegir archivo de respaldo…
          </button>
        </div>
        <input ref={entrada} type="file" accept="application/json,.json" hidden onChange={(e) => elegir(e.target.files?.[0])} />

        {archivo && (
          <div className="a-respaldos__confirmar" role="group" aria-label="Confirmar restauración">
            <p>
              <strong>{archivo.nombre}</strong>
              {archivo.datos.creado && <> · creado el {fechaLarga(archivo.datos.creado)}</>}
            </p>
            <p className="a-campo__ayuda">Se reemplazará: {secciones.map((s) => NOMBRES[s]).join(", ") || "nada"}.</p>
            <div className="a-foto__acciones">
              <button
                type="button"
                className="a-btn a-btn--peligro"
                onClick={restaurar}
                disabled={restaurando || secciones.length === 0}
                aria-busy={restaurando}
              >
                {restaurando ? "Restaurando…" : "Sí, restaurar"}
              </button>
              <button type="button" className="a-btn a-btn--ghost" onClick={() => setArchivo(null)} disabled={restaurando}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        {error && (
          <p className="a-campo__error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
