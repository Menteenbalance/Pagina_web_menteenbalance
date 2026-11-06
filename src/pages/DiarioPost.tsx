import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useContenido } from "../lib/contenido";
import { formatearFecha } from "../lib/formato";
import { TextoConFormato, minutosDeLectura } from "../lib/texto";
import NoEncontrada from "./NoEncontrada";
import { SITE_URL, url } from "../config";

// Página de una publicación del Diario: /diario/:slug
export default function DiarioPost() {
  const { slug } = useParams();
  const { posts, listo } = useContenido();
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.titulo} | Diario | Mente en Balance`;

    // Datos estructurados del artículo para Google (se quitan al salir)
    const imagen = post.imagen ? (/^https?:/.test(post.imagen) ? post.imagen : url(post.imagen)) : undefined;
    const fecha = (post.publicarEl ?? post.fecha).slice(0, 10);
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.titulo.slice(0, 110),
      description: post.bajada,
      ...(imagen && { image: [imagen] }),
      datePublished: fecha,
      inLanguage: "es-CL",
      articleSection: post.cat,
      mainEntityOfPage: url(`/diario/${post.slug}`),
      author: { "@id": `${SITE_URL}/#mari`, "@type": "Person", name: "María Ignacia Canessa" },
      publisher: { "@id": `${SITE_URL}/#negocio` },
    });
    document.head.appendChild(ld);
    return () => ld.remove();
  }, [post]);

  if (!post) {
    // Mientras llega el contenido del servidor no se muestra el 404
    return listo ? <NoEncontrada contexto="diario" /> : <div className="page" aria-busy="true" />;
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
          alt={post.imagenAlt ?? ""}
          width={1600}
          height={1000}
          decoding="async"
        />
      )}

      <div className="articulo__cuerpo prose">
        <TextoConFormato texto={post.cuerpo} />
      </div>

      <p className="articulo__aviso">
        Este texto es informativo y no reemplaza una atención psicológica.{" "}
        <Link to="/privacidad#aviso-legal">Aviso legal</Link>.
      </p>

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
