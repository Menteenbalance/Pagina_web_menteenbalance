import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import type { Post } from "../types";
import { formatearFecha, slug as crearSlug } from "../lib/formato";
import { hoyEnSantiago } from "../lib/contenido";
import { TextoConFormato } from "../lib/texto";
import type { Guardar } from "./AdminApp";
import { api } from "./api";
import { comprimirImagen } from "./imagen";
import { BotonEliminar, Campo } from "./ui";

const CATEGORIAS = ["Psicología", "Yoga", "Meditación", "Comunidad"];

export default function EditorDiario({ posts, guardar }: { posts: Post[]; guardar: Guardar }) {
  return (
    <Routes>
      <Route index element={<Lista posts={posts} guardar={guardar} />} />
      <Route path="nueva" element={<Formulario posts={posts} guardar={guardar} />} />
      <Route path=":id" element={<Formulario posts={posts} guardar={guardar} />} />
    </Routes>
  );
}

/* ── Lista de publicaciones ─────────────────────────────────────── */
function Lista({ posts, guardar }: { posts: Post[]; guardar: Guardar }) {
  const ordenados = useMemo(() => [...posts].sort((a, b) => b.fecha.localeCompare(a.fecha)), [posts]);

  return (
    <div className="a-seccion">
      <header className="a-seccion__head a-seccion__head--fila">
        <div>
          <h1 className="a-h1">Diario</h1>
          <p className="a-lead">
            Publicaciones del blog. Los borradores no se ven en el sitio hasta que los publiques.
          </p>
        </div>
        <Link to="nueva" className="a-btn a-btn--primario">
          + Nueva publicación
        </Link>
      </header>

      {ordenados.length === 0 ? (
        <p className="a-vacio">Aún no hay publicaciones. Crea la primera.</p>
      ) : (
        <ul className="a-posts">
          {ordenados.map((p) => (
            <li key={p.id} className="a-post">
              {p.imagen ? (
                <img className="a-post__img" src={p.imagen} alt="" width={96} height={72} loading="lazy" />
              ) : (
                <span className="a-post__img a-post__img--vacia" aria-hidden="true" />
              )}
              <div className="a-post__cuerpo">
                <span className={p.publicado ? "a-estado a-estado--pub" : "a-estado"}>
                  {p.publicado ? "Publicado" : "Borrador"}
                </span>
                <h2 className="a-post__titulo">{p.titulo}</h2>
                <p className="a-post__meta">
                  {p.cat} · {formatearFecha(p.fecha).larga}
                  {!p.cuerpo && " · sin texto completo"}
                </p>
              </div>
              <div className="a-evento__acciones">
                {p.publicado && p.cuerpo && (
                  <a className="a-btn a-btn--ghost" href={`/diario/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${p.titulo} en el sitio`}>
                    Ver
                  </a>
                )}
                <Link className="a-btn a-btn--ghost" to={p.id} aria-label={`Editar ${p.titulo}`}>
                  Editar
                </Link>
                <BotonEliminar que={`la publicación ${p.titulo}`} onConfirmar={() => guardar("posts", posts.filter((x) => x.id !== p.id))} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Crear / editar una publicación ─────────────────────────────── */
function Formulario({ posts, guardar }: { posts: Post[]; guardar: Guardar }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const existente = id ? posts.find((p) => p.id === id) : undefined;

  const [post, setPost] = useState<Post>(
    () =>
      existente ?? {
        id: crypto.randomUUID(),
        slug: "",
        titulo: "",
        cat: "Psicología",
        bajada: "",
        cuerpo: "",
        fecha: hoyEnSantiago(),
        publicado: false,
      }
  );
  const [vista, setVista] = useState<"escribir" | "previa">("escribir");
  const [subiendo, setSubiendo] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const [guardando, setGuardando] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  if (id && !existente) {
    return (
      <div className="a-seccion">
        <p className="a-vacio">Esta publicación ya no existe.</p>
        <Link to="/admin/diario" className="a-btn a-btn--ghost">Volver al Diario</Link>
      </div>
    );
  }

  const cambio = (c: Partial<Post>) => setPost((p) => ({ ...p, ...c }));

  async function elegirImagen(archivo: File | undefined) {
    if (!archivo) return;
    setErrorImagen("");
    setSubiendo(true);
    try {
      const liviana = await comprimirImagen(archivo);
      const { url } = await api.subirImagen(liviana);
      cambio({ imagen: url });
    } catch (err) {
      setErrorImagen((err as Error).message);
    } finally {
      setSubiendo(false);
      if (inputArchivo.current) inputArchivo.current.value = "";
    }
  }

  async function guardarComo(publicado: boolean) {
    // La dirección (slug) se fija al crear y no cambia después,
    // para no romper enlaces ya compartidos.
    let slug = post.slug || crearSlug(post.titulo);
    const ocupados = new Set(posts.filter((p) => p.id !== post.id).map((p) => p.slug));
    let n = 2;
    const base = slug;
    while (ocupados.has(slug)) slug = `${base}-${n++}`;

    const final = { ...post, slug, publicado };
    const lista = existente ? posts.map((p) => (p.id === post.id ? final : p)) : [final, ...posts];
    setGuardando(true);
    const ok = await guardar("posts", lista);
    setGuardando(false);
    if (ok) navegar("/admin/diario");
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    guardarComo(true);
  }

  return (
    <div className="a-seccion">
      <Link to="/admin/diario" className="a-volver">← Volver al Diario</Link>
      <header className="a-seccion__head">
        <h1 className="a-h1">{existente ? "Editar publicación" : "Nueva publicación"}</h1>
        {existente?.publicado && (
          <p className="a-lead">
            Publicada en <span className="a-mono">/diario/{existente.slug}</span>
          </p>
        )}
      </header>

      <form className="a-item" onSubmit={enviar}>
        <Campo etiqueta="Título">
          {(p) => <input {...p} className="a-input a-input--titulo" required maxLength={120} value={post.titulo} placeholder="Ej: Respirar para volver al presente…" onChange={(e) => cambio({ titulo: e.target.value })} autoFocus={!existente} />}
        </Campo>

        <div className="a-grid-2">
          <Campo etiqueta="Categoría" ayuda="Elige una o escribe otra.">
            {(p) => (
              <>
                <input {...p} className="a-input" required maxLength={30} list="categorias" value={post.cat} onChange={(e) => cambio({ cat: e.target.value })} />
                <datalist id="categorias">
                  {[...new Set([...CATEGORIAS, ...posts.map((x) => x.cat)])].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </>
            )}
          </Campo>
          <Campo etiqueta="Fecha de publicación">
            {(p) => <input {...p} className="a-input" type="date" required value={post.fecha} onChange={(e) => cambio({ fecha: e.target.value })} />}
          </Campo>
        </div>

        <Campo etiqueta="Bajada" ayuda={`Resumen que aparece en las tarjetas. ${post.bajada.length}/280`}>
          {(p) => <textarea {...p} className="a-input a-textarea" rows={2} required maxLength={280} value={post.bajada} onChange={(e) => cambio({ bajada: e.target.value })} />}
        </Campo>

        <div className="a-campo">
          <span className="a-campo__label" id="img-label">Imagen principal (opcional)</span>
          {post.imagen ? (
            <div className="a-imagen">
              <img src={post.imagen} alt="Imagen principal elegida" width={320} height={200} />
              <div className="a-imagen__acciones">
                <button type="button" className="a-btn a-btn--ghost" onClick={() => inputArchivo.current?.click()} disabled={subiendo}>
                  Cambiar
                </button>
                <button type="button" className="a-btn a-btn--ghost" onClick={() => cambio({ imagen: undefined })} disabled={subiendo}>
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="a-subir" onClick={() => inputArchivo.current?.click()} disabled={subiendo} aria-describedby="img-label">
              {subiendo ? "Subiendo foto…" : "Elegir foto"}
              <span className="a-subir__ayuda">JPG, PNG o WebP. Se optimiza automáticamente.</span>
            </button>
          )}
          <input ref={inputArchivo} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => elegirImagen(e.target.files?.[0])} />
          {subiendo && post.imagen && <p className="a-campo__ayuda">Subiendo foto…</p>}
          {errorImagen && <p className="a-campo__error" role="alert">{errorImagen}</p>}
        </div>

        <div className="a-campo">
          <div className="a-editor__barra">
            <span className="a-campo__label">Texto de la publicación</span>
            <div className="a-segmento" role="group" aria-label="Modo del editor">
              <button type="button" aria-pressed={vista === "escribir"} className={vista === "escribir" ? "is-activo" : ""} onClick={() => setVista("escribir")}>Escribir</button>
              <button type="button" aria-pressed={vista === "previa"} className={vista === "previa" ? "is-activo" : ""} onClick={() => setVista("previa")}>Vista previa</button>
            </div>
          </div>
          {vista === "escribir" ? (
            <>
              <textarea
                className="a-input a-textarea a-textarea--largo"
                rows={16}
                maxLength={40000}
                value={post.cuerpo}
                aria-label="Texto de la publicación"
                aria-describedby="ayuda-formato"
                placeholder={"Escribe aquí. Deja una línea en blanco entre párrafos.\n\n## Un subtítulo\n\nTexto con **negrita** y *cursiva*…"}
                onChange={(e) => cambio({ cuerpo: e.target.value })}
              />
              <details className="a-ayuda-formato" id="ayuda-formato">
                <summary>Cómo dar formato</summary>
                <ul>
                  <li><code>## Subtítulo</code> en su propia línea</li>
                  <li><code>**negrita**</code> y <code>*cursiva*</code></li>
                  <li><code>- elemento</code> para listas</li>
                  <li><code>&gt; frase</code> para una cita destacada</li>
                  <li><code>[texto](https://enlace.cl)</code> para enlaces</li>
                  <li>Una línea en blanco separa párrafos</li>
                </ul>
              </details>
            </>
          ) : (
            <div className="a-previa prose">
              {post.cuerpo.trim() ? <TextoConFormato texto={post.cuerpo} /> : <p className="a-vacio">Aún no hay texto.</p>}
            </div>
          )}
        </div>

        <div className="a-item__pie a-item__pie--entre">
          <button type="button" className="a-btn a-btn--ghost" onClick={() => guardarComo(false)} disabled={guardando || subiendo}>
            {existente?.publicado ? "Pasar a borrador" : "Guardar borrador"}
          </button>
          <button type="submit" className="a-btn a-btn--primario" disabled={guardando || subiendo} aria-busy={guardando}>
            {guardando ? "Guardando…" : existente?.publicado ? "Guardar y mantener publicada" : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
