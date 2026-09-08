import { Link } from "react-router-dom";
import Placeholder from "../components/Placeholder";
import Reveal from "../components/Reveal";
import { servicios, agenda, posts, reservaUrl } from "../data";
import { img } from "../images";

// Página de inicio: hero, cinta, "sobre nosotras", servicios,
// agenda corta, cita destacada y últimos artículos del diario.
export default function Inicio() {
  const agendaCorta = agenda.slice(0, 3);

  // Imagen para cada artículo del diario (según su orden).
  const postImgs = [img.consulta, img.retiro1, img.yogaRestaurativa];

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
      <Reveal>
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
      </Reveal>

      {/* Sobre nosotras */}
      <Reveal>
        <section className="section">
          <div className="split">
          <div className="portrait">
            <img
              className="portrait__img"
              src={img.meditacionGrupo.src}
              alt={img.meditacionGrupo.alt}
              loading="lazy"
              decoding="async"
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
                Mente en Balance nace del encuentro entre la psicología y el
                yoga. María Ignacia Canessa —psicóloga clínica y profesora de
                yoga— acompaña procesos de bienestar emocional para una vida más
                consciente.
              </p>
              <p>
                Unimos la mirada clínica de las Terapias de Tercera Generación
                con la práctica de yoga y meditación: un mismo espacio para
                cuidar la mente, habitar el cuerpo y crear comunidad.
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
      </Reveal>

      {/* Servicios */}
      <section className="band band--plum">
        <div className="band__inner">
          <Reveal>
            <p className="eyebrow eyebrow--plum">Servicios</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="section-title" style={{ marginBottom: 52 }}>
              Formas de acompañarte
            </h2>
          </Reveal>
          <div className="cards">
            {servicios.map((s, i) => (
              <Reveal key={s.title} delay={200 + i * 90}>
                <div className="card">
                  <span
                    className="dot card__dot"
                    style={{ background: s.dot }}
                  />
                  <h3 className="card__title">{s.title}</h3>
                  <p className="card__body">{s.body}</p>
                  <span className="card__meta">{s.meta}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Agenda corta */}
      <section className="section">
        <Reveal>
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
        </Reveal>
        <div className="agenda-list">
          {agendaCorta.map((e, i) => (
            <Reveal key={e.titulo} delay={i * 120}>
              <div className="agenda-row">
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cita destacada */}
      <Reveal>
        <section className="quote">
          <div className="quote__inner">
            <p className="quote__eyebrow">Recordatorio</p>
            <p className="quote__text">
              Ven a moverte, respirar y volver a ti.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Diario */}
      <section className="section">
        <Reveal>
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
        </Reveal>
        <div className="posts">
          {posts.slice(0, 3).map((p, i) => (
            <Reveal key={p.titulo} delay={i * 120}>
              <Link to="/diario" className="post">
                <img
                  className="post__thumb"
                  src={postImgs[i].src}
                  alt={postImgs[i].alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="post__cat">{p.cat}</span>
                <h3 className="post__title">{p.titulo}</h3>
                <p className="post__excerpt">{p.bajada}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
