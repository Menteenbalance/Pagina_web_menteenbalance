import Placeholder from "../components/Placeholder";
import { postsTodos } from "../data";

// Página "Diario": grilla completa de artículos.
export default function Diario() {
  return (
    <div className="page">
      <p className="eyebrow eyebrow--teal" style={{ marginBottom: 24 }}>
        Diario
      </p>
      <h1 className="page-title" style={{ maxWidth: "16ch" }}>
        Recursos para la práctica
      </h1>

      <div className="posts posts--wide">
        {postsTodos.map((p, i) => (
          <div className="post" key={`${p.titulo}-${i}`}>
            <Placeholder
              label="imagen · artículo"
              className="placeholder post__thumb"
            />
            <span className="post__cat">{p.cat}</span>
            <h2 className="post__title">{p.titulo}</h2>
            <p className="post__excerpt">{p.bajada}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
