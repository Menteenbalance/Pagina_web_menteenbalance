import { Link } from "react-router-dom";
import type { Post } from "../types";
import { img } from "../images";

// Foto de ambiente para publicaciones sin imagen propia.
const respaldo = [img.consulta, img.retiro1, img.yogaRestaurativa, img.yogaParque, img.claseGrupo, img.balasana];

/**
 * Tarjeta de una publicación del Diario.
 * Si la publicación tiene texto completo, enlaza a su página;
 * si no, se muestra como tarjeta informativa.
 */
export default function TarjetaPost({
  post,
  indice,
  titulo: Titulo = "h3",
}: {
  post: Post;
  indice: number;
  titulo?: "h2" | "h3";
}) {
  const contenido = (
    <>
      <img
        className="post__thumb"
        src={post.imagen || respaldo[indice % respaldo.length].src}
        alt=""
        width={960}
        height={720}
        loading="lazy"
        decoding="async"
      />
      <span className="post__cat">{post.cat}</span>
      <Titulo className="post__title">{post.titulo}</Titulo>
      <p className="post__excerpt">{post.bajada}</p>
      {post.cuerpo && <span className="post__leer" aria-hidden="true">Leer →</span>}
    </>
  );

  return post.cuerpo ? (
    <Link to={`/diario/${post.slug}`} className="post post--link">
      {contenido}
    </Link>
  ) : (
    <article className="post" id={post.slug} tabIndex={-1}>
      {contenido}
    </article>
  );
}
