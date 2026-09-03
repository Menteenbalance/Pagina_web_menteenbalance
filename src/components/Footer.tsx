import { Link } from "react-router-dom";
import { nav, contacto } from "../data";

// Pie de página con marca, navegación y datos de contacto.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <div className="footer__brand">
            <img src="/logo.png" alt="" className="footer__logo" />
            <span className="footer__brand-name">Mente en Balance</span>
          </div>
          <p className="footer__text">
            Un espacio para generar comunidad y crear bienestar desde el
            autoconocimiento, compasión y atención plena.
          </p>
        </div>

        <div className="footer__col">
          <span className="footer__heading">Navegar</span>
          {nav.map((item) => (
            <Link key={item.path} to={item.path} className="footer__link">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="footer__col">
          <span className="footer__heading">Contacto</span>
          <a
            href={contacto.instagram.url}
            className="footer__link"
            target="_blank"
            rel="noreferrer"
          >
            {contacto.instagram.label}
          </a>
          {contacto.direccion.map((linea) => (
            <span key={linea} className="footer__link">
              {linea}
            </span>
          ))}
        </div>
      </div>

      <div className="footer__meta">
        Mente en Balance by PRODIS · Psicología &amp; Yoga
      </div>
    </footer>
  );
}
