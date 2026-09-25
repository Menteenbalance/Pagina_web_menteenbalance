import { Component, createRef, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Al cambiar (ej: la ruta), se limpia el error y se vuelve a intentar */
  clave?: string;
}
interface Estado {
  error: Error | null;
}

/** ¿Falló la descarga de una parte del sitio? (típico justo después de publicar una versión nueva) */
function esErrorDeCarga(e: Error): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    e.message
  );
}

/**
 * Captura errores inesperados de la interfaz y muestra una pantalla
 * amable con opciones para seguir, en vez de una página en blanco.
 */
export default class LimiteDeError extends Component<Props, Estado> {
  state: Estado = { error: null };
  private titulo = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[sitio] error inesperado:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props, prevEstado: Estado) {
    if (this.state.error && prev.clave !== this.props.clave) {
      this.setState({ error: null });
      return;
    }
    // Al aparecer el error, el foco va al título (teclado y lectores de pantalla)
    if (this.state.error && !prevEstado.error) {
      this.titulo.current?.focus();
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const carga = esErrorDeCarga(error);
    return (
      <div className="nf nf--error">
        <div className="nf__copy">
          <a href="/" className="nf__marca" aria-label="Mente en Balance, ir al inicio">
            <img src="/logo.png" alt="" width={36} height={36} />
          </a>
          <p className="nf__codigo">{carga ? "Nueva versión disponible" : "Algo salió mal"}</p>
          <h1 className="nf__titulo" ref={this.titulo} tabIndex={-1}>
            {carga ? "Actualizamos el sitio mientras navegabas" : "Algo no salió como esperábamos"}
          </h1>
          <p className="nf__texto">
            {carga
              ? "Recarga la página para ver la versión más reciente. No perderás nada."
              : "Fue un problema de nuestra parte, no tuyo. Recarga la página o vuelve al inicio."}
          </p>
          <div className="nf__acciones">
            <button type="button" className="btn btn--plum" onClick={() => window.location.reload()}>
              Recargar página
            </button>
            <a href="/" className="btn btn--outline">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
