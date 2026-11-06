import { Link } from "react-router-dom";
import type { Post } from "../types";
import FotoSitio from "./FotoSitio";
import type { ClaveFoto } from "../lib/fotos";
import { srcsetDe } from "../lib/srcset";

/** Ancho con que se muestra la tarjeta (para elegir la versión de la foto) */
const TAMANO = "(max-width: 600px) 86vw, 360px";

// Fotos de ambiente para publicaciones sin imagen propia (se cambian
// desde el panel, pestaña Fotos).
const respaldo: ClaveFoto[] = ["diario-1", "diario-2", "diario-3", "diario-4", "diario-5", "diario-6"];

/**
 * Tarjeta de una publicación del Diario.
 * Si la publicación tiene texto completo, enlaza a su página;
 * si no, se muestra como tarjeta informativa.
 */
export default function TarjetaPost({
  post,
  indice,
  titulo: Titulo = "h3",
  prioritaria = false,
}: {
  post: Post;
  indice: number;
  titulo?: "h2" | "h3";
  /** true = se ve al abrir la página: se carga de inmediato (no diferida) */
  prioritaria?: boolean;
}) {
  const carga = prioritaria
    ? ({ loading: "eager", fetchPriority: "high" } as const)
    : ({ loading: "lazy" } as const);
  // Si la tarjeta es un enlace, el título ya lo nombra: la foto es decorativa
  // (así el lector de pantalla no repite). En tarjetas informativas sí se
  // describe la foto propia; las de ambiente son siempre decorativas.
  const alt = !post.cuerpo && post.imagen ? post.imagenAlt ?? "" : "";

  const contenido = (
    <>
      {post.imagen ? (
        <img
          className="post__thumb"
          src={post.imagen}
          srcSet={srcsetDe(post.imagen)}
          sizes={TAMANO}
          alt={alt}
          width={960}
          height={720}
          {...carga}
          decoding="async"
        />
      ) : (
        <FotoSitio
          clave={respaldo[indice % respaldo.length]}
          decorativa
          className="post__thumb"
          sizes={TAMANO}
          width={960}
          height={720}
          {...carga}
          decoding="async"
        />
      )}
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
