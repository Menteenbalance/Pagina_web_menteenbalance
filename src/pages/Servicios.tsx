import { Link } from "react-router-dom";
import { servicios } from "../data";

// Página "Servicios": lista extendida con la descripción larga de cada uno.
export default function Servicios() {
  return (
    <div className="page">
      <p className="eyebrow eyebrow--teal" style={{ marginBottom: 24 }}>
        Servicios
      </p>
      <h1 className="page-title" style={{ maxWidth: "16ch" }}>
        Terapia, práctica y comunidad
      </h1>

      <div className="servicios-list">
        {servicios.map((s) => (
          <div className="servicio-row" key={s.title}>
            <div className="servicio-row__head">
              <span
                className="dot servicio-row__dot"
                style={{ background: s.dot }}
              />
              <h2 className="servicio-row__title">{s.title}</h2>
            </div>
            <p className="servicio-row__desc">{s.largo}</p>
            <div className="servicio-row__aside">
              <span className="servicio-row__meta">{s.meta}</span>
              <Link
                to="/contacto"
                className="btn btn--outline btn--outline-plum btn--sm"
              >
                Consultar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
