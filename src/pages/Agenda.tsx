import { Link, useSearchParams } from "react-router-dom";
import { filtros, reservaUrl, type Filtro } from "../data";
import { proximasActividades, useContenido } from "../lib/contenido";
import { formatearFecha, formatearPrecio, slug } from "../lib/formato";

// Página "Agenda": tarjetas de clases con filtros por tipo.
// El filtro queda en la URL (ej: /agenda?tipo=yoga) para poder compartirlo.
export default function Agenda() {
  const [params, setParams] = useSearchParams();
  const agenda = proximasActividades(useContenido().agenda);
  const filtro: Filtro =
    filtros.find((f) => slug(f) === params.get("tipo")) ?? "Todo";

  function elegir(f: Filtro) {
    setParams(f === "Todo" ? {} : { tipo: slug(f) }, { replace: true });
  }

  const eventos =
    filtro === "Todo" ? agenda : agenda.filter((e) => e.tipo === filtro);

  return (
    <div className="page">
      <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
        Agenda
      </p>
      <h1 className="page-title" style={{ maxWidth: "16ch" }}>
        Próximas clases y talleres
      </h1>

      <div className="filtros" role="group" aria-label="Filtrar por tipo de actividad">
        {filtros.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={f === filtro}
            onClick={() => elegir(f)}
            className={f === filtro ? "filtro is-active" : "filtro"}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {eventos.length === 1
          ? "1 actividad"
          : `${eventos.length} actividades`}
      </p>

      {eventos.length === 0 ? (
        <div className="empty">
          <h2 className="empty__title">
            {filtro === "Todo"
              ? "Estamos preparando las próximas fechas"
              : `Por ahora no hay fechas de ${filtro.toLowerCase()}`}
          </h2>
          <p className="empty__text">
            Publicamos nuevas clases cada mes. Revisa las otras actividades o
            escríbenos y te avisamos cuando abramos cupos.
          </p>
          <div className="empty__actions">
            {filtro !== "Todo" && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => elegir("Todo")}
              >
                Ver todas
              </button>
            )}
            <Link to="/contacto" className="text-link">
              Avísenme
            </Link>
          </div>
        </div>
      ) : (
        <div className="agenda-cards">
          {eventos.map((e) => {
            const f = formatearFecha(e.fecha);
            return (
              <article className="event-card" key={e.id}>
                <div className="event-card__top">
                  <time className="event-card__date" dateTime={e.fecha}>
                    {f.corta}
                  </time>
                  <span className="event-card__time">
                    {f.dia} · {e.hora}
                  </span>
                </div>
                <h2 className="event-card__title">{e.titulo}</h2>
                <p className="event-card__desc">{e.desc}</p>
                <p className="event-card__place">{e.lugar}</p>
                <div className="event-card__foot">
                  <span className="event-card__price">
                    {formatearPrecio(e.precio)}
                  </span>
                  <a
                    href={reservaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--teal btn--sm"
                    aria-label={`Inscribirme en ${e.titulo}, ${f.larga} (se abre en una pestaña nueva)`}
                  >
                    Inscribirme
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
