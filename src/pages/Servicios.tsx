import { contacto } from "../data";
import { formatearPrecio, slug } from "../lib/formato";
import { useContenido, useReserva } from "../lib/contenido";
import { Linea } from "../components/Textos";
import IconoServicio from "../components/IconoServicio";

/** Servicio que se consulta por correo en vez de reservar en Encuadrado
 *  (por su id original o, si Mari lo volvió a crear, por su nombre). */
const porCorreo = (s: { id: string; title: string }) =>
  s.id === "bienestar-para-organizaciones" || /organizaciones/i.test(s.title);

/** Correo listo para escribir a Mari sobre el programa para organizaciones. */
function correoOrganizaciones(titulo: string): string {
  const asunto = `Consulta: ${titulo}`;
  const cuerpo = [
    "Hola Mari,",
    "",
    `Te escribo desde la página de Mente en Balance porque me interesa el programa de ${titulo.toLowerCase()}.`,
    "",
    "Organización:",
    "Cantidad aproximada de personas:",
    "Qué nos gustaría trabajar:",
    "",
    "Saludos,",
  ].join("\n");
  return `mailto:${contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

// Página "Servicios": lista extendida de cada servicio + aranceles.
export default function Servicios() {
  const { servicios, aranceles } = useContenido();
  const reserva = useReserva();
  return (
    <div className="page">
      <p className="eyebrow eyebrow--teal" style={{ marginBottom: 24 }}>
        Servicios
      </p>
      <h1 className="page-title" style={{ maxWidth: "16ch" }}>
        <Linea clave="servicios-titulo" />
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
              <IconoServicio color={s.dot} className="icono-servicio servicio-row__dot" />
              <h2 className="servicio-row__title" id={`${slug(s.title)}-titulo`}>
                {s.title}
              </h2>
            </div>
            <p className="servicio-row__desc">{s.largo}</p>
            <div className="servicio-row__aside">
              <span className="servicio-row__meta">{s.meta}</span>
              {porCorreo(s) ? (
                <a
                  href={correoOrganizaciones(s.title)}
                  className="btn btn--outline btn--outline-plum btn--sm"
                  aria-label={`Consultar por ${s.title} por correo a ${contacto.email}`}
                >
                  Consultar
                </a>
              ) : (
                <a
                  href={reserva.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--outline-plum btn--sm"
                  aria-label={`Consultar por ${s.title} (se abre en una pestaña nueva)`}
                >
                  Consultar
                </a>
              )}
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
                href={reserva.url}
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
          <Linea clave="servicios-nota-precios" />
        </p>
      </section>
    </div>
  );
}
