import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useContenido } from "../lib/contenido";
import { formatearFecha } from "../lib/formato";
import { TextoConFormato, minutosDeLectura } from "../lib/texto";
import NoEncontrada from "./NoEncontrada";

// Página de una publicación del Diario: /diario/:slug
export default function DiarioPost() {
  const { slug } = useParams();
  const { posts, listo } = useContenido();
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) document.title = `${post.titulo} | Diario | Mente en Balance`;
  }, [post]);

  if (!post) {
    // Mientras llega el contenido del servidor no se muestra el 404
    return listo ? <NoEncontrada /> : <div className="page" aria-busy="true" />;
  }

  const f = formatearFecha(post.fecha);
  const otros = posts.filter((p) => p.id !== post.id && p.cuerpo).slice(0, 2);

  return (
    <article className="page articulo">
      <Link to="/diario" className="text-link articulo__volver">
        ← Volver al Diario
      </Link>

      <header className="articulo__head">
        <p className="post__cat">{post.cat}</p>
        <h1 className="page-title articulo__titulo">{post.titulo}</h1>
        <p className="articulo__bajada">{post.bajada}</p>
        <p className="articulo__meta">
          <time dateTime={post.fecha}>{f.larga}</time>
          <span aria-hidden="true"> · </span>
          {minutosDeLectura(post.cuerpo)} min de lectura
        </p>
      </header>

      {post.imagen && (
        <img
          className="articulo__imagen"
          src={post.imagen}
          alt=""
          width={1600}
          height={1000}
          decoding="async"
        />
      )}

      <div className="articulo__cuerpo prose">
        <TextoConFormato texto={post.cuerpo} />
      </div>

      {otros.length > 0 && (
        <nav className="articulo__mas" aria-label="Más publicaciones">
          <h2 className="articulo__mas-titulo">Seguir leyendo</h2>
          <ul>
            {otros.map((o) => (
              <li key={o.id}>
                <Link to={`/diario/${o.slug}`} className="articulo__mas-link">
                  <span className="post__cat">{o.cat}</span>
                  <span className="articulo__mas-nombre">{o.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
