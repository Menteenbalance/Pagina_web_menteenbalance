import { useState, type FormEvent } from "react";
import { contacto } from "../data";

// Página "Contacto": formulario + datos + suscripción al newsletter.
export default function Contacto() {
  const [enviado, setEnviado] = useState(false);
  const [suscrito, setSuscrito] = useState(false);

  function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviado(true);
  }

  return (
    <div className="page">
      <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
        Contacto
      </p>
      <h1 className="page-title" style={{ maxWidth: "15ch" }}>
        Conecta con tu cuerpo
      </h1>

      <div className="contacto-grid">
        {/* Columna izquierda: formulario o mensaje de éxito */}
        <div>
          {enviado ? (
            <div className="sent">
              <h2 className="sent__title">Gracias, te escribiremos pronto</h2>
              <p className="sent__text">
                Respondemos dentro de 48 horas hábiles. Mientras tanto, respira:
                un día a la vez.
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={enviar}>
              <label className="field">
                <span className="field__label">Nombre</span>
                <input className="input" type="text" placeholder="Tu nombre" />
              </label>
              <label className="field">
                <span className="field__label">Correo</span>
                <input
                  className="input"
                  type="email"
                  placeholder="tucorreo@mail.com"
                />
              </label>
              <label className="field">
                <span className="field__label">Me interesa</span>
                <select className="select">
                  <option>Terapia individual</option>
                  <option>Vinyasa Yoga</option>
                  <option>Meditación</option>
                  <option>Experiencias y talleres</option>
                </select>
              </label>
              <label className="field">
                <span className="field__label">Mensaje</span>
                <textarea
                  className="textarea"
                  rows={4}
                  placeholder="Cuéntanos brevemente qué buscas"
                />
              </label>
              <button type="submit" className="btn btn--plum form__submit">
                Enviar
              </button>
            </form>
          )}
        </div>

        {/* Columna derecha: datos de contacto y newsletter */}
        <div className="contacto-aside">
          <div className="info-card">
            <h2 className="info-card__title">Dónde estamos</h2>
            <p className="info-card__text">
              {contacto.direccion[0]}
              <br />
              {contacto.direccion[1]}
            </p>
            <p className="info-card__text" style={{ marginTop: 14 }}>
              Sesiones online disponibles
            </p>
          </div>

          <div className="info-card info-card--links">
            <h2 className="info-card__title">Escríbenos</h2>
            <a
              className="info-card__link"
              href={contacto.instagram.url}
              target="_blank"
              rel="noreferrer"
            >
              {contacto.instagram.label}
            </a>
            <span className="info-card__link">{contacto.whatsapp}</span>
            <a
              className="info-card__link"
              href={`mailto:${contacto.email}`}
            >
              {contacto.email}
            </a>
          </div>

          <div className="newsletter">
            <h2 className="newsletter__title">Súmate a la comunidad</h2>
            <p className="newsletter__text">
              Una carta al mes con prácticas, lecturas y fechas de clases.
            </p>
            <div className="newsletter__row">
              <input
                className="newsletter__input"
                type="email"
                placeholder="tucorreo@mail.com"
              />
              <button
                className="btn btn--dark newsletter__btn"
                onClick={() => setSuscrito(true)}
              >
                {suscrito ? "Listo" : "Sumarme"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
