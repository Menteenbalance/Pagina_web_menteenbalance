import { useState, type FormEvent } from "react";
import { api } from "./api";

type Modo = "entrar" | "recuperar" | "enviado";

export default function Login({
  motivo,
  onEntrar,
}: {
  motivo?: string;
  onEntrar: (email: string) => void;
}) {
  // El correo de aviso de inicio de sesión enlaza a /admin?recuperar=1
  const [modo, setModo] = useState<Modo>(() =>
    new URLSearchParams(window.location.search).has("recuperar") ? "recuperar" : "entrar"
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  function cambiarModo(m: Modo) {
    setModo(m);
    setError("");
    setEnviando(false);
  }

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    setError("");
    try {
      const s = await api.entrar(String(datos.get("email")), String(datos.get("password")));
      onEntrar(s.email);
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  }

  async function recuperar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    setError("");
    try {
      await api.recuperar(String(datos.get("email")));
      cambiarModo("enviado");
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  }

  return (
    <main className="a-login">
      <img src="/logo.svg" alt="" width={44} height={44} className="a-login__logo" />
      <h1 className="a-login__titulo">{modo === "entrar" ? "Panel de administración" : "Recuperar contraseña"}</h1>
      <p className="a-login__sub">
        <span translate="no">Mente en Balance</span>
      </p>
      {motivo && modo === "entrar" && <p className="a-login__motivo">{motivo}</p>}

      {modo === "entrar" && (
        <form className="a-form" onSubmit={entrar}>
          <div className="a-campo">
            <label className="a-campo__label" htmlFor="login-email">
              Correo
            </label>
            <input id="login-email" className="a-input" type="email" name="email" autoComplete="username" spellCheck={false} required />
          </div>
          <div className="a-campo">
            <label className="a-campo__label" htmlFor="login-pass">
              Contraseña
            </label>
            <input id="login-pass" className="a-input" type="password" name="password" autoComplete="current-password" required />
          </div>
          {error && (
            <p className="a-campo__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="a-btn a-btn--primario a-btn--ancho" disabled={enviando} aria-busy={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </button>
          <button type="button" className="a-login__enlace" onClick={() => cambiarModo("recuperar")}>
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      )}

      {modo === "recuperar" && (
        <form className="a-form" onSubmit={recuperar}>
          <p className="a-campo__ayuda">Escribe el correo del panel y te enviaremos un enlace para crear una contraseña nueva.</p>
          <div className="a-campo">
            <label className="a-campo__label" htmlFor="recuperar-email">
              Correo
            </label>
            <input id="recuperar-email" className="a-input" type="email" name="email" autoComplete="username" spellCheck={false} required autoFocus />
          </div>
          {error && (
            <p className="a-campo__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="a-btn a-btn--primario a-btn--ancho" disabled={enviando} aria-busy={enviando}>
            {enviando ? "Enviando…" : "Enviarme el enlace"}
          </button>
          <button type="button" className="a-login__enlace" onClick={() => cambiarModo("entrar")}>
            Volver a iniciar sesión
          </button>
        </form>
      )}

      {modo === "enviado" && (
        <div className="a-form" role="status">
          <p className="a-login__motivo">
            Si ese es el correo del panel, te llegará un mensaje en unos minutos. El enlace dura 15 minutos y sirve una
            sola vez. Revisa también la carpeta de spam.
          </p>
          <button type="button" className="a-btn a-btn--ghost a-btn--ancho" onClick={() => cambiarModo("entrar")}>
            Volver a iniciar sesión
          </button>
        </div>
      )}

      <a href="/" className="a-login__volver">
        Volver al sitio
      </a>
    </main>
  );
}
