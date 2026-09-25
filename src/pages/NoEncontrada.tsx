import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { img } from "../images";

// Caminos útiles para seguir (idea de la 404 de Airbnb: nunca un callejón sin salida).
const caminos = [
  { to: "/servicios", titulo: "Servicios", texto: "Psicología, yoga y meditación" },
  { to: "/agenda", titulo: "Agenda", texto: "Próximas clases y talleres" },
  { to: "/diario", titulo: "Diario", texto: "Lecturas para la práctica" },
  { to: "/contacto", titulo: "Contacto", texto: "Escríbenos, te respondemos" },
];

interface Props {
  /** "diario" cuando falta una publicación: ajusta el mensaje */
  contexto?: "general" | "diario";
}

/**
 * Página 404 de Mente en Balance.
 * Se muestra en cualquier dirección que no existe (también llega aquí
 * quien entra a /api/... desde el navegador, con ?ruta=).
 */
export default function NoEncontrada({ contexto = "general" }: Props) {
  const { pathname, search } = useLocation();
  // Si viene redirigida desde /api, muestra la ruta original
  const rutaOriginal = new URLSearchParams(search).get("ruta");
  const buscada = rutaOriginal && rutaOriginal.startsWith("/") ? rutaOriginal : pathname;
  const esDiario = contexto === "diario";

  useEffect(() => {
    document.title = esDiario
      ? "Publicación no disponible | Mente en Balance"
      : "Página no encontrada | Mente en Balance";
    // Los buscadores no deben indexar esta dirección
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [esDiario]);

  return (
    <div className="nf">
      <div className="nf__copy">
        <p className="nf__codigo">Error 404</p>
        <h1 className="nf__titulo">
          {esDiario ? "Esta publicación no está disponible" : "Esta página no existe"}
        </h1>
        <p className="nf__texto">
          {esDiario
            ? "Puede que se haya retirado o que el enlace esté incompleto. Tómate un respiro y sigue leyendo en el Diario."
            : "Puede que el enlace esté incompleto o que la página se haya movido. Tómate un respiro y elige por dónde seguir."}
        </p>
        <p className="nf__ruta">
          Buscaste <code translate="no">{buscada.length > 64 ? `${buscada.slice(0, 61)}…` : buscada}</code>
        </p>

        <div className="nf__acciones">
          <Link to={esDiario ? "/diario" : "/"} className="btn btn--plum">
            {esDiario ? "Ir al Diario" : "Volver al inicio"}
          </Link>
        </div>

        <nav className="nf__caminos" aria-label="Secciones del sitio">
          <h2 className="nf__caminos-titulo">O visita</h2>
          <ul>
            {(esDiario
              ? [
                  ...caminos.filter((c) => c.to !== "/diario"),
                  { to: "/", titulo: "Inicio", texto: "Volver a la portada" },
                ]
              : caminos
            ).map((c) => (
                <li key={c.to}>
                  <Link to={c.to} className="nf__camino">
                    <span className="nf__camino-nombre">{c.titulo}</span>
                    <span className="nf__camino-texto">{c.texto}</span>
                    <span className="nf__camino-flecha" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      <div className="nf__media" aria-hidden="true">
        <div className="nf__halo" />
        <img
          className="nf__foto"
          src={img.balasana.src}
          alt=""
          width={738}
          height={1600}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}
