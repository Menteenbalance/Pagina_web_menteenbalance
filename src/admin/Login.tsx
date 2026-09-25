import { useState, type FormEvent } from "react";
import { api } from "./api";

export default function Login({
  motivo,
  onEntrar,
}: {
  motivo?: string;
  onEntrar: (email: string) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <main className="a-login">
      <img src="/logo.png" alt="" width={44} height={44} className="a-login__logo" />
      <h1 className="a-login__titulo">Panel de administración</h1>
      <p className="a-login__sub">
        <span translate="no">Mente en Balance</span>
      </p>
      {motivo && <p className="a-login__motivo">{motivo}</p>}

      <form className="a-form" onSubmit={entrar}>
        <div className="a-campo">
          <label className="a-campo__label" htmlFor="login-email">
            Correo
          </label>
          <input
            id="login-email"
            className="a-input"
            type="email"
            name="email"
            autoComplete="username"
            spellCheck={false}
            required
          />
        </div>
        <div className="a-campo">
          <label className="a-campo__label" htmlFor="login-pass">
            Contraseña
          </label>
          <input
            id="login-pass"
            className="a-input"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="a-campo__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="a-btn a-btn--primario a-btn--ancho" disabled={enviando} aria-busy={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <a href="/" className="a-login__volver">
        Volver al sitio
      </a>
    </main>
  );
}
