import { Link } from "react-router-dom";
import Placeholder from "../components/Placeholder";
import { servicios, agenda, posts, reservaUrl } from "../data";

// Página de inicio: hero, cinta, "sobre nosotras", servicios,
// agenda corta, cita destacada y últimos artículos del diario.
export default function Inicio() {
  const agendaCorta = agenda.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Santiago · Presencial y online</p>
          <h1 className="hero__title">
            Un día
            <br />a la vez
          </h1>
          <p className="hero__lead">
            Un espacio para generar comunidad y crear bienestar desde el
            autoconocimiento, compasión y atención plena.
          </p>
          <div className="hero__actions">
            <a
              href={reservaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--plum"
            >
              Reservar hora
            </a>
            <Link to="/agenda" className="btn btn--outline">
              Ver próximas clases
            </Link>
          </div>
        </div>
        <div className="hero__media">
          <div className="hero__halo" />
          <Placeholder
            label="foto · práctica de yoga"
            className="placeholder hero__photo"
          />
        </div>
      </section>

      {/* Cinta de palabras */}
      <section className="ribbon">
        <div className="ribbon__inner">
          <span>Psicología</span>
          <span>Terapia individual</span>
          <span>Vinyasa Yoga</span>
          <span>Meditación</span>
          <span>Experiencias</span>
          <span>Comunidad</span>
        </div>
      </section>

      {/* Sobre nosotras */}
      <section className="section">
        <div className="split">
          <div className="portrait">
            <Placeholder
              label="retrato · equipo"
              className="placeholder portrait__img"
            />
            <div className="portrait__accent" />
          </div>
          <div>
            <p className="eyebrow eyebrow--teal">Sobre nosotras</p>
            <h2 className="section-title" style={{ lineHeight: 1.16 }}>
              Mente, cuerpo y alma en un mismo lugar
            </h2>
            <div className="prose" style={{ marginTop: 26 }}>
              <p>
                Texto placeholder sobre la historia del proyecto: quiénes somos,
                cómo nace Mente en Balance y por qué unimos la psicología clínica
                con la práctica de yoga.
              </p>
              <p>
                Segundo párrafo placeholder sobre el enfoque: acompañamiento
                respetuoso, atención plena y trabajo corporal como una sola
                conversación.
              </p>
            </div>
            <Link
              to="/sobre"
              className="text-link"
              style={{ marginTop: 32 }}
            >
              Conocer el enfoque
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="band band--plum">
        <div className="band__inner">
          <p className="eyebrow eyebrow--plum">Servicios</p>
          <h2 className="section-title" style={{ marginBottom: 52 }}>
            Formas de acompañarte
          </h2>
          <div className="cards">
            {servicios.map((s) => (
              <div className="card" key={s.title}>
                <span className="dot card__dot" style={{ background: s.dot }} />
                <h3 className="card__title">{s.title}</h3>
                <p className="card__body">{s.body}</p>
                <span className="card__meta">{s.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agenda corta */}
      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--teal" style={{ marginBottom: 18 }}>
              Agenda
            </p>
            <h2 className="section-title">Próximas clases y talleres</h2>
          </div>
          <Link to="/agenda" className="text-link">
            Calendario completo
          </Link>
        </div>
        <div className="agenda-list">
          {agendaCorta.map((e) => (
            <div className="agenda-row" key={e.titulo}>
              <div>
                <div className="agenda-row__date">
                  <div className="agenda-row__day">{e.fecha}</div>
                  <div className="agenda-row__time">{e.hora}</div>
                </div>
              </div>
              <div className="agenda-row__body">
                <h3 className="agenda-row__title">{e.titulo}</h3>
                <p className="agenda-row__desc">{e.desc}</p>
                <p className="agenda-row__place">{e.lugar}</p>
              </div>
              <div className="agenda-row__aside">
                <span className="agenda-row__price">{e.valor}</span>
                <a
                  href={reservaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--sm"
                >
                  Inscribirme
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cita destacada */}
      <section className="quote">
        <div className="quote__inner">
          <p className="quote__eyebrow">Recordatorio</p>
          <p className="quote__text">Frase muy bonita corta con sentido</p>
        </div>
      </section>

      {/* Diario */}
      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--plum" style={{ marginBottom: 18 }}>
              Diario
            </p>
            <h2 className="section-title">Recursos para la práctica</h2>
          </div>
          <Link to="/diario" className="text-link">
            Ver todo
          </Link>
        </div>
        <div className="posts">
          {posts.map((p) => (
            <Link to="/diario" className="post" key={p.titulo}>
              <Placeholder
                label="imagen · artículo"
                className="placeholder post__thumb"
              />
              <span className="post__cat">{p.cat}</span>
              <h3 className="post__title">{p.titulo}</h3>
              <p className="post__excerpt">{p.bajada}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
