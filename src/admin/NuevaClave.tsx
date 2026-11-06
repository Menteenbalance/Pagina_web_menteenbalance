// Página /admin/nueva-clave#<token>, a la que lleva el correo de recuperación.
// El token va después de "#": no viaja al servidor en la dirección ni queda
// en registros; se envía solo al guardar.

import { useState, type FormEvent } from "react";
import { api } from "./api";

const LARGO_MINIMO = 12;

export default function NuevaClave() {
  const [token] = useState(() => window.location.hash.slice(1));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const [ver, setVer] = useState(false);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const clave = String(datos.get("clave"));
    if (clave.length < LARGO_MINIMO) return setError(`La contraseña debe tener al menos ${LARGO_MINIMO} caracteres.`);
    if (clave !== String(datos.get("repetir"))) return setError("Las dos contraseñas no coinciden.");
    setEnviando(true);
    setError("");
    try {
      await api.nuevaClave(token, clave);
      history.replaceState(null, "", "/admin/nueva-clave"); // borra el token de la barra
      setListo(true);
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  }

  return (
    <main className="a-login">
      <img src="/logo.svg" alt="" width={44} height={44} className="a-login__logo" />
      <h1 className="a-login__titulo">{listo ? "Contraseña cambiada" : "Contraseña nueva"}</h1>
      <p className="a-login__sub">
        <span translate="no">Mente en Balance</span>
      </p>

      {!token && !listo && (
        <div className="a-form">
          <p className="a-login__motivo">Este enlace está incompleto. Pide uno nuevo desde la pantalla de inicio de sesión.</p>
          <a className="a-btn a-btn--primario a-btn--ancho" href="/admin?recuperar=1">
            Pedir un enlace nuevo
          </a>
        </div>
      )}

      {token && !listo && (
        <form className="a-form" onSubmit={guardar}>
          <p className="a-campo__ayuda">Al menos {LARGO_MINIMO} caracteres. Una frase fácil de recordar funciona muy bien.</p>
          <div className="a-campo">
            <label className="a-campo__label" htmlFor="nueva-clave">
              Contraseña nueva
            </label>
            <input id="nueva-clave" className="a-input" type={ver ? "text" : "password"} name="clave" autoComplete="new-password" minLength={LARGO_MINIMO} maxLength={200} required autoFocus />
          </div>
          <div className="a-campo">
            <label className="a-campo__label" htmlFor="repetir-clave">
              Repítela
            </label>
            <input id="repetir-clave" className="a-input" type={ver ? "text" : "password"} name="repetir" autoComplete="new-password" minLength={LARGO_MINIMO} maxLength={200} required />
          </div>
          <label className="a-check">
            <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> Mostrar contraseña
          </label>
          {error && (
            <p className="a-campo__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="a-btn a-btn--primario a-btn--ancho" disabled={enviando} aria-busy={enviando}>
            {enviando ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      )}

      {listo && (
        <div className="a-form" role="status">
          <p className="a-login__motivo">
            Listo. Se cerraron las sesiones abiertas en otros dispositivos. Ya puedes entrar con tu contraseña nueva.
          </p>
          <a className="a-btn a-btn--primario a-btn--ancho" href="/admin">
            Iniciar sesión
          </a>
        </div>
      )}

      <a href="/" className="a-login__volver">
        Volver al sitio
      </a>
    </main>
  );
}
