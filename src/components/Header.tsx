import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { nav, reservaUrl } from "../data";

// Barra superior fija con logo, navegación y botón "Reservar".
// En pantallas chicas los links se agrupan en un menú desplegable,
// y "Reservar" queda siempre visible.
export default function Header() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();

  // Cierra el menú al cambiar de página
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  // Cierra el menú con la tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  return (
    <header className={abierto ? "header is-open" : "header"}>
      <div className="header__inner">
        <Link to="/" className="brand">
          <img
            src="/logo.png"
            alt=""
            width={34}
            height={34}
            className="brand__logo"
          />
          <span className="brand__name" translate="no">
            <span className="brand__title">Mente en Balance</span>
            <span className="brand__tag">Psicología &amp; Yoga</span>
          </span>
        </Link>

        <nav className="nav" id="menu-principal" aria-label="Principal">
          {nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav__link is-active" : "nav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a
          href={reservaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--teal btn--sm header__cta"
          aria-label="Reservar (se abre en una pestaña nueva)"
        >
          Reservar
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto((v) => !v)}
        >
          <span className="menu-toggle__bars" aria-hidden="true" />
          <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
      </div>
    </header>
  );
}
