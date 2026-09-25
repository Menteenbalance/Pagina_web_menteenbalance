// Piezas reutilizables del panel: campos, barra de guardado,
// confirmación de borrado y avisos.

import { useEffect, useId, useState, type ReactNode } from "react";

/* ── Campo con etiqueta arriba, ayuda y error debajo ───────────── */
export function Campo({
  etiqueta,
  ayuda,
  error,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}) {
  const id = useId();
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const describe = [idAyuda, idError].filter(Boolean).join(" ") || undefined;
  return (
    <div className="a-campo">
      <label className="a-campo__label" htmlFor={id}>
        {etiqueta}
      </label>
      {children({ id, "aria-describedby": describe, "aria-invalid": error ? true : undefined })}
      {ayuda && (
        <p className="a-campo__ayuda" id={idAyuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p className="a-campo__error" id={idError}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Barra fija inferior: aparece cuando hay cambios sin guardar ── */
export function BarraGuardar({
  cambios,
  guardando,
  onGuardar,
  onDescartar,
}: {
  cambios: boolean;
  guardando: boolean;
  onGuardar: () => void;
  onDescartar: () => void;
}) {
  // Avisa antes de cerrar la pestaña si hay cambios sin guardar
  useEffect(() => {
    if (!cambios) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [cambios]);

  if (!cambios) return null;
  return (
    <div className="a-barra" role="region" aria-label="Cambios sin guardar">
      <p className="a-barra__texto">Tienes cambios sin guardar</p>
      <div className="a-barra__acciones">
        <button type="button" className="a-btn a-btn--ghost" onClick={onDescartar} disabled={guardando}>
          Descartar
        </button>
        <button type="button" className="a-btn a-btn--primario" onClick={onGuardar} disabled={guardando} aria-busy={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

/* ── Botón de eliminar con confirmación en el mismo lugar ───────── */
export function BotonEliminar({
  que,
  onConfirmar,
}: {
  /** Qué se elimina, ej: "la actividad Sentir Yoga" */
  que: string;
  onConfirmar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);
  if (!confirmando) {
    return (
      <button
        type="button"
        className="a-btn a-btn--peligro-suave"
        onClick={() => setConfirmando(true)}
        aria-label={`Eliminar ${que}`}
      >
        Eliminar
      </button>
    );
  }
  return (
    <span className="a-confirmar" role="group" aria-label={`Confirmar eliminar ${que}`}>
      <span className="a-confirmar__texto">¿Eliminar?</span>
      <button type="button" className="a-btn a-btn--peligro" onClick={onConfirmar} autoFocus>
        Sí, eliminar
      </button>
      <button type="button" className="a-btn a-btn--ghost" onClick={() => setConfirmando(false)}>
        Cancelar
      </button>
    </span>
  );
}

/* ── Aviso temporal (éxito / error) ─────────────────────────────── */
export interface Aviso {
  tipo: "ok" | "error";
  texto: string;
}

export function Avisos({ aviso, onCerrar }: { aviso: Aviso | null; onCerrar: () => void }) {
  useEffect(() => {
    if (aviso?.tipo !== "ok") return;
    const t = setTimeout(onCerrar, 4000);
    return () => clearTimeout(t);
  }, [aviso, onCerrar]);

  return (
    <div className="a-avisos" aria-live="polite" role="status">
      {aviso && (
        <div className={`a-aviso a-aviso--${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" className="a-aviso__cerrar" onClick={onCerrar} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

/** Mover un elemento de una lista hacia arriba (-1) o abajo (+1). */
export function mover<T>(lista: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}

/** Hook: copia editable de una sección + si tiene cambios. */
export function useBorrador<T>(original: T) {
  const [borrador, setBorrador] = useState<T>(original);
  useEffect(() => setBorrador(original), [original]);
  const cambios = JSON.stringify(borrador) !== JSON.stringify(original);
  return { borrador, setBorrador, cambios, descartar: () => setBorrador(original) };
}
