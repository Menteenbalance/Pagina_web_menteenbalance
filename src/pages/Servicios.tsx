import { reservaUrl } from "../data";
import { formatearPrecio, slug } from "../lib/formato";
import { useContenido } from "../lib/contenido";

// Página "Servicios": lista extendida de cada servicio + aranceles.
export default function Servicios() {
  const { servicios, aranceles } = useContenido();
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
          <section
            className="servicio-row"
            key={s.id}
            id={slug(s.title)}
            tabIndex={-1}
            aria-labelledby={`${slug(s.title)}-titulo`}
          >
            <div className="servicio-row__head">
              <span
                className="dot servicio-row__dot"
                style={{ background: s.dot }}
                aria-hidden="true"
              />
              <h2 className="servicio-row__title" id={`${slug(s.title)}-titulo`}>
                {s.title}
              </h2>
            </div>
            <p className="servicio-row__desc">{s.largo}</p>
            <div className="servicio-row__aside">
              <span className="servicio-row__meta">{s.meta}</span>
              <a
                href={reservaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--outline-plum btn--sm"
                aria-label={`Consultar por ${s.title} (se abre en una pestaña nueva)`}
              >
                Consultar
              </a>
            </div>
          </section>
        ))}
      </div>

      {/* Aranceles: dos bloques separados (Psicoterapia y Yoga Vinyasa) */}
      <section className="precios">
        <p
          className="eyebrow eyebrow--plum"
          style={{ marginBottom: 24, marginTop: 96 }}
        >
          Aranceles
        </p>
        <h2 className="section-title" style={{ marginBottom: 44 }}>
          Valores por servicio
        </h2>

        <div className="precios-grid">
          {aranceles.map((grupo) => (
            <div className="precio-group" key={grupo.categoria}>
              <h3 className="precio-group__title">{grupo.categoria}</h3>
              <ul className="precio-list">
                {grupo.items.map((item) => (
                  <li className="precio-item" key={item.nombre}>
                    <div className="precio-item__info">
                      <span className="precio-item__name">{item.nombre}</span>
                      {(item.modalidad || item.duracion) && (
                        <span className="precio-item__meta">
                          {[item.modalidad, item.duracion]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                    <span className="precio-item__price">
                      {formatearPrecio(item.precio)}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={reservaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--teal btn--sm precio-group__cta"
                aria-label={`Reservar ${grupo.categoria} (se abre en una pestaña nueva)`}
              >
                Reservar {grupo.categoria}
              </a>
            </div>
          ))}
        </div>

        <p className="precios-note">
          Valores en pesos chilenos (CLP). Reservas y pagos se gestionan a través
          de Encuadrado.
        </p>
      </section>
    </div>
  );
}
