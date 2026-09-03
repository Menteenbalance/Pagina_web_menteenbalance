import { useState } from "react";
import { Link } from "react-router-dom";
import { agenda, filtros, type Filtro } from "../data";

// Página "Agenda": tarjetas de clases con filtros por tipo.
export default function Agenda() {
  const [filtro, setFiltro] = useState<Filtro>("Todo");

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

      <div className="filtros">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={f === filtro ? "filtro is-active" : "filtro"}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="agenda-cards">
        {eventos.map((e) => (
          <div className="event-card" key={e.titulo}>
            <div className="event-card__top">
              <span className="event-card__date">{e.fecha}</span>
              <span className="event-card__time">{e.hora}</span>
            </div>
            <h2 className="event-card__title">{e.titulo}</h2>
            <p className="event-card__desc">{e.desc}</p>
            <p className="event-card__place">{e.lugar}</p>
            <div className="event-card__foot">
              <span className="event-card__price">{e.valor}</span>
              <Link to="/contacto" className="btn btn--teal btn--sm">
                Inscribirme
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
