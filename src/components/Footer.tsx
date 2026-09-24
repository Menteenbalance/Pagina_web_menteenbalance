import { Link } from "react-router-dom";
import { nav, contacto } from "../data";

// Pie de página con marca, navegación y datos de contacto.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <div className="footer__brand">
            <img
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              className="footer__logo"
            />
            <span className="footer__brand-name" translate="no">
              Mente en Balance
            </span>
          </div>
          <p className="footer__text">
            Un espacio para generar comunidad y crear bienestar desde el
            autoconocimiento, compasión y atención plena.
          </p>
        </div>

        <nav className="footer__col" aria-label="Pie de página">
          <h2 className="footer__heading">Navegar</h2>
          {nav.map((item) => (
            <Link key={item.path} to={item.path} className="footer__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="footer__col">
          <h2 className="footer__heading">Contacto</h2>
          <a
            href={contacto.instagram.url}
            className="footer__link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram ${contacto.instagram.label} (se abre en una pestaña nueva)`}
          >
            {contacto.instagram.label}
          </a>
          <address className="footer__address">
            {contacto.direccion.map((linea) => (
              <span key={linea}>{linea}</span>
            ))}
          </address>
        </div>
      </div>

      <div className="footer__meta">
        <span translate="no">Mente en Balance</span> by PRODIS · Psicología
        &amp; Yoga
      </div>
    </footer>
  );
}
