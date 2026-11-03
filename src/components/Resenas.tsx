import { useEffect, useState } from "react";
import { encuadradoEvaluaciones, resenasRespaldo } from "../data";
import type { Resena, ResenasEncuadrado } from "../types";
import Reveal from "./Reveal";

/** Reseñas que se muestran como máximo en el Inicio. */
const MAXIMO = 6;
/** Sobre este largo, el comentario se recorta con "Leer completa". */
const LARGO_CORTO = 240;

function Estrellas({ nota, tam = 15 }: { nota: number; tam?: number }) {
  const llenas = Math.round(nota);
  return (
    <span className="resena__estrellas" role="img" aria-label={`${nota.toLocaleString("es-CL")} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" focusable="false" className={i <= llenas ? "is-llena" : undefined}>
          <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Tarjeta({ r }: { r: Resena }) {
  const [abierta, setAbierta] = useState(false);
  const larga = r.texto.length > LARGO_CORTO;
  const texto = larga && !abierta ? `${r.texto.slice(0, LARGO_CORTO).replace(/\s+\S*$/, "")}…` : r.texto;
  return (
    <figure className="resena">
      <Estrellas nota={r.nota} />
      <blockquote className="resena__texto">
        <p>{texto}</p>
      </blockquote>
      {larga && (
        <button type="button" className="resena__mas" aria-expanded={abierta} onClick={() => setAbierta((v) => !v)}>
          {abierta ? "Mostrar menos" : "Leer completa"}
        </button>
      )}
      <figcaption className="resena__autor">
        <span className="resena__nombre">{r.nombre}</span>
        {r.fecha && <span className="resena__fecha">{r.fecha}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * Reseñas de Encuadrado en el Inicio.
 * Se muestran de inmediato con la copia de respaldo y se actualizan con
 * lo que entrega /api/resenas (leído desde Encuadrado cada pocas horas).
 */
export default function Resenas() {
  const [datos, setDatos] = useState<ResenasEncuadrado>(resenasRespaldo);

  useEffect(() => {
    let vivo = true;
    fetch("/api/resenas")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: ResenasEncuadrado) => {
        if (vivo && Array.isArray(d.resenas) && d.resenas.length) setDatos(d);
      })
      .catch(() => {
        /* se queda con la copia de respaldo */
      });
    return () => {
      vivo = false;
    };
  }, []);

  const resenas = datos.resenas.filter((r) => r.texto).slice(0, MAXIMO);
  if (resenas.length === 0) return null;

  return (
    <section className="section resenas" aria-labelledby="resenas-titulo">
      <Reveal>
      <div className="section-head">
        <div>
          <p className="eyebrow eyebrow--plum" style={{ marginBottom: 18 }}>
            Reseñas
          </p>
          <h2 className="section-title" id="resenas-titulo">
            Lo que cuentan quienes han venido
          </h2>
        </div>
        <a
          href={encuadradoEvaluaciones}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
          aria-label="Ver todas las evaluaciones en Encuadrado (se abre en una pestaña nueva)"
        >
          Ver todas en Encuadrado
        </a>
      </div>
      </Reveal>

      {datos.promedio !== null && (
        <div className="resenas__resumen">
          <span className="resenas__promedio">{datos.promedio.toFixed(1).replace(".", ",")}</span>
          <div>
            <Estrellas nota={datos.promedio} tam={18} />
            <p className="resenas__total">
              {datos.total ? `${datos.total} evaluaciones en Encuadrado` : "Evaluaciones en Encuadrado"}
              <span> · solo pueden evaluar personas que tuvieron una sesión</span>
            </p>
          </div>
        </div>
      )}

      <div className="resenas__lista">
        {resenas.map((r, i) => (
          <Tarjeta key={`${r.nombre}-${r.fecha}-${i}`} r={r} />
        ))}
      </div>
    </section>
  );
}
