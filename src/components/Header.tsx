import { Link, NavLink } from "react-router-dom";
import { nav } from "../data";

// Barra superior fija con logo, navegación y botón "Reservar".
export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="Mente en Balance" className="brand__logo" />
          <span className="brand__name">
            <span className="brand__title">Mente en Balance</span>
            <span className="brand__tag">Psicología &amp; Yoga</span>
          </span>
        </Link>

        <nav className="nav">
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
          <Link to="/contacto" className="btn btn--teal btn--sm">
            Reservar
          </Link>
        </nav>
      </div>
    </header>
  );
}
