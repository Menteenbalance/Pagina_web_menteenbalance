import { posts } from "../data";
import { img } from "../images";
import { slug } from "../lib/formato";

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
          <article
            className="post"
            key={`${p.titulo}-${i}`}
            id={slug(p.titulo)}
            tabIndex={-1}
          >
            {/* Foto de ambiente (decorativa): no describe el artículo */}
            <img
              className="post__thumb"
              src={diarioImgs[i % diarioImgs.length].src}
              alt=""
              width={960}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <span className="post__cat">{p.cat}</span>
            <h2 className="post__title">{p.titulo}</h2>
            <p className="post__excerpt">{p.bajada}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
