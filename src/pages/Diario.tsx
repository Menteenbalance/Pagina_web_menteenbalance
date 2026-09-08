import { posts } from "../data";
import { img } from "../images";

// Imágenes para las miniaturas del diario (se repiten cíclicamente
// si hay más artículos que fotos).
const diarioImgs = [
  img.consulta,
  img.retiro1,
  img.yogaRestaurativa,
  img.yogaParque,
  img.claseGrupo,
  img.balasana,
];

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
        {posts.map((p, i) => (
          <div className="post" key={`${p.titulo}-${i}`}>
            <img
              className="post__thumb"
              src={diarioImgs[i % diarioImgs.length].src}
              alt={diarioImgs[i % diarioImgs.length].alt}
              loading="lazy"
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
