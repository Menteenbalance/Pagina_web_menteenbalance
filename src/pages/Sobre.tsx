import { Link } from "react-router-dom";
import { contacto, valores } from "../data";
import { useContenido } from "../lib/contenido";
import { Linea, Parrafos, useLista } from "../components/Textos";
import FotoSitio from "../components/FotoSitio";
import Reveal from "../components/Reveal";

// Pasos de la mirada de Mente en Balance (textos editables en el panel)
const PASOS = [1, 2, 3, 4] as const;

// Página "Detrás de Mente en Balance": el espacio, la persona y sus valores.
export default function Sobre() {
  const { formacion } = useContenido();
  const acompanar = useLista("sobre-acompanar-lista");
  return (
    <>
      {/* 1. El espacio */}
      <section className="page db-intro">
        <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
          Detrás de Mente en Balance
        </p>
        <h1 className="page-title db-intro__titulo">
          <Linea clave="sobre-intro-titulo" />
        </h1>
        <div className="prose db-intro__texto">
          <Parrafos clave="sobre-intro-texto" />
        </div>
      </section>

      {/* 2. Qué significa estar en balance */}
      <section className="db-balance">
        <div className="db-balance__inner">
          <Reveal>
            <div className="db-balance__head">
              <h2 className="section-title">
                <Linea clave="sobre-balance-titulo" />
              </h2>
              <p className="db-balance__lead">
                <Linea clave="sobre-balance-lead" />
              </p>
              <div className="db-balance__texto">
                <Parrafos clave="sobre-balance-texto" />
              </div>
            </div>
          </Reveal>
          <ol className="db-pasos">
            {PASOS.map((n, i) => (
              <Reveal key={n} delay={i * 110}>
                <li className="db-paso">
                  {/* Tallo que crece de un paso al siguiente; en cada paso se abre una hoja */}
                  <span className="db-paso__tallo" aria-hidden="true">
                    <svg viewBox="0 0 100 16" preserveAspectRatio="none" focusable="false">
                      <path d="M0 8 C20 3 34 13 52 8 S84 4 100 8" pathLength="1" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg className="db-paso__hoja" viewBox="0 0 30 30" focusable="false">
                      <path d="M15 22 C10 18 4 18 1 11 C8 9 13 13 15 22 Z" fill="#83c6bf" />
                      <path d="M15 22 C17 14 22 9 29 9 C27 16 21 19 15 22 Z" fill="#c8d97f" />
                    </svg>
                    {n === 4 && (
                      <svg className="db-paso__flor" viewBox="0 0 20 20" focusable="false">
                        {[0, 72, 144, 216, 288].map((a) => (
                          <ellipse key={a} cx="10" cy="5" rx="3" ry="4.6" fill="#c696b0" transform={`rotate(${a} 10 10)`} />
                        ))}
                        <circle cx="10" cy="10" r="2.4" fill="#f8ce9a" />
                      </svg>
                    )}
                  </span>
                  <span className="db-paso__verbo">
                    <Linea clave={`sobre-paso-${n}-verbo`} />
                  </span>
                  <span className="db-paso__texto">
                    <Linea clave={`sobre-paso-${n}-texto`} />
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
          <p className="db-balance__cierre">
            <Linea clave="sobre-balance-cierre" />
          </p>
        </div>
      </section>

      {/* 3. La persona */}
      <section className="section db-persona" aria-labelledby="db-persona-titulo">
        <div className="db-persona__media">
          <FotoSitio
            clave="sobre-retrato"
            className="db-persona__foto"
            width={714}
            height={984}
            loading="lazy"
            decoding="async"
          />
          <div className="db-persona__accent" aria-hidden="true" />
        </div>
        <div className="db-persona__texto">
          <h2 className="section-title" id="db-persona-titulo">
            <Linea clave="sobre-persona-titulo" />
          </h2>
          <p className="db-persona__nombre">María Ignacia Canessa</p>
          <p className="db-persona__rol">
            <Linea clave="sobre-persona-rol" />
          </p>
          <div className="prose" style={{ marginTop: 28 }}>
            <Parrafos clave="sobre-persona-texto" />
          </div>
        </div>
      </section>

      {/* 3b. Acompañar y formación */}
      <section className="section db-detalle">
        <div className="db-acompanar">
          <h2 className="db-h3">
            <Linea clave="sobre-acompanar-titulo" />
          </h2>
          <ul className="db-acompanar__lista">
            {acompanar.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="db-formacion">
          <h2 className="db-h3">Mi formación</h2>
          <ol className="db-formacion__lista">
            {formacion.map((f) => (
              <li key={f.id} className="db-formacion__item">
                <span className="db-formacion__anio">{f.anio}</span>
                <span className="db-formacion__cuerpo">
                  <span className="db-formacion__titulo">{f.titulo}</span>
                  {f.lugar && <span className="db-formacion__lugar">{f.lugar}</span>}
                  {f.detalle && <span className="db-formacion__detalle">{f.detalle}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Por qué yoga */}
      <section className="section db-yoga" aria-labelledby="db-yoga-titulo">
        <div className="db-yoga__texto">
          <h2 className="section-title" id="db-yoga-titulo">
            <Linea clave="sobre-yoga-titulo" />
          </h2>
          <div className="prose" style={{ marginTop: 26 }}>
            <Parrafos clave="sobre-yoga-texto" />
          </div>
        </div>
        <FotoSitio
          clave="sobre-yoga"
          className="db-yoga__foto"
          width={960}
          height={1280}
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* 5. Por qué crear comunidad */}
      <section className="db-comunidad" aria-labelledby="db-comunidad-titulo">
        <div className="db-comunidad__inner">
          <h2 className="db-comunidad__titulo" id="db-comunidad-titulo">
            <Linea clave="sobre-comunidad-titulo" />
          </h2>
          <div className="db-comunidad__texto">
            <Parrafos clave="sobre-comunidad-texto" />
          </div>
          <p className="db-comunidad__frase">
            <Linea clave="sobre-comunidad-frase" />
          </p>
          <a
            href={contacto.comunidadWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn db-comunidad__cta"
            aria-label="Unirme a la comunidad de WhatsApp (se abre en una pestaña nueva)"
          >
            Unirme a la comunidad
          </a>
        </div>
      </section>

      {/* 6. Valores del espacio */}
      <section className="section db-valores" aria-labelledby="db-valores-titulo">
        <h2 className="section-title" id="db-valores-titulo">Valores del espacio</h2>
        <ul className="db-valores__grid">
          {valores.map((v, i) => (
            <Reveal key={v.titulo} delay={(i % 3) * 90}>
              <li className="db-valor">
                <span className="db-valor__titulo">{v.titulo}</span>
                <span className="db-valor__desc">{v.desc}</span>
              </li>
            </Reveal>
          ))}
        </ul>
        <div className="db-cierre">
          <p className="db-cierre__texto">
            <Linea clave="sobre-cierre" />
          </p>
          <Link to="/servicios" className="btn btn--plum">
            Ver servicios
          </Link>
        </div>
      </section>
    </>
  );
}
