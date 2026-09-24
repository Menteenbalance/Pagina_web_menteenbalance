import { Link } from "react-router-dom";

// Página 404: aparece cuando alguien entra a una dirección que no existe.
export default function NoEncontrada() {
  return (
    <div className="page not-found">
      <h1 className="page-title" style={{ maxWidth: "14ch" }}>
        Esta página no existe
      </h1>
      <p className="not-found__text">
        Puede que el enlace esté incompleto o que la página se haya movido.
        Respira, y vuelve a un lugar conocido.
      </p>
      <div className="hero__actions">
        <Link to="/" className="btn btn--plum">
          Ir al inicio
        </Link>
        <Link to="/agenda" className="btn btn--outline">
          Ver próximas clases
        </Link>
      </div>
    </div>
  );
}
