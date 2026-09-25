import TarjetaPost from "../components/TarjetaPost";
import { postsRecientes, useContenido } from "../lib/contenido";

// Página "Diario": todas las publicaciones, de la más nueva a la más antigua.
export default function Diario() {
  const { posts, listo } = useContenido();
  const lista = postsRecientes(posts);

  return (
    <div className="page">
      <p className="eyebrow eyebrow--teal" style={{ marginBottom: 24 }}>
        Diario
      </p>
      <h1 className="page-title" style={{ maxWidth: "16ch" }}>
        Recursos para la práctica
      </h1>

      {lista.length === 0 && listo ? (
        <div className="empty">
          <h2 className="empty__title">Pronto publicaremos nuevas lecturas</h2>
          <p className="empty__text">
            Mientras tanto, puedes seguirnos en Instagram para prácticas y recordatorios.
          </p>
        </div>
      ) : (
        <div className="posts posts--wide">
          {lista.map((p, i) => (
            <TarjetaPost key={p.id} post={p} indice={i} titulo="h2" />
          ))}
        </div>
      )}
    </div>
  );
}
