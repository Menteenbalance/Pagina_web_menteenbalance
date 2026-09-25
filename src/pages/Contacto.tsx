import { useRef, useState, type FormEvent } from "react";
import { contacto } from "../data";
import { obtenerVisitanteId } from "../lib/visitante";

const INTERESES = [
  "Terapia individual",
  "Vinyasa Yoga",
  "Meditación",
  "Experiencias y talleres",
];

type Campo = "nombre" | "email" | "interes" | "mensaje";
type Estado = "idle" | "enviando" | "enviado" | "error";

/** "en 7 minutos" / "en 2 horas" a partir de segundos. */
function tiempoRestante(seg: number): string {
  if (seg < 90) return "en un minuto";
  const min = Math.ceil(seg / 60);
  if (min < 90) return `en ${min} minutos`;
  return `en ${Math.ceil(min / 60)} horas`;
}

// Página "Contacto": formulario + datos + suscripción al newsletter.
export default function Contacto() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [mensajeError, setMensajeError] = useState("");
  const [suscrito, setSuscrito] = useState(false);
  const inicio = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const exitoRef = useRef<HTMLDivElement>(null);

  function enfocarPrimerError(campos: Partial<Record<Campo, string>>) {
    const primero = (["nombre", "email", "interes", "mensaje"] as Campo[]).find(
      (c) => campos[c]
    );
    if (primero) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${primero}"]`)
        ?.focus();
    }
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;
    const datos = new FormData(e.currentTarget);

    setEstado("enviando");
    setErrores({});
    setMensajeError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          email: datos.get("email"),
          interes: datos.get("interes"),
          mensaje: datos.get("mensaje"),
          empresa: datos.get("empresa"),
          inicio: inicio.current,
          visitante: obtenerVisitanteId(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setEstado("enviado");
        requestAnimationFrame(() => exitoRef.current?.focus());
        return;
      }
      if (res.status === 422 && data.errores) {
        setErrores(data.errores);
        setEstado("idle");
        enfocarPrimerError(data.errores);
        return;
      }
      if (res.status === 429) {
        setMensajeError(
          `Ya recibimos varios mensajes desde este dispositivo. Puedes volver a escribir ${tiempoRestante(
            Number(data.reintentarEnSeg) || 600
          )} o hablarnos por WhatsApp.`
        );
      } else {
        setMensajeError(
          "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp."
        );
      }
      setEstado("error");
    } catch {
      setMensajeError(
        "Parece que no hay conexión. Revisa tu internet e inténtalo otra vez."
      );
      setEstado("error");
    }
  }

  const enviando = estado === "enviando";

  return (
    <div className="page">
      <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
        Contacto
      </p>
      <h1 className="page-title" style={{ maxWidth: "15ch" }}>
        Conecta con tu cuerpo
      </h1>

      <div className="contacto-grid">
        {/* Columna izquierda: formulario o mensaje de éxito */}
        <div aria-live="polite">
          {estado === "enviado" ? (
            <div className="sent" ref={exitoRef} tabIndex={-1}>
              <h2 className="sent__title">Gracias, te escribiremos pronto</h2>
              <p className="sent__text">
                Respondemos dentro de 48 horas hábiles. Mientras tanto, respira:
                un día a la vez.
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={enviar} ref={formRef} noValidate>
              <label className="field">
                <span className="field__label">Nombre</span>
                <input
                  className="input"
                  type="text"
                  name="nombre"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Ej: Camila Rojas…"
                  aria-invalid={Boolean(errores.nombre)}
                  aria-describedby={errores.nombre ? "error-nombre" : undefined}
                />
                {errores.nombre && (
                  <span className="field__error" id="error-nombre">
                    {errores.nombre}
                  </span>
                )}
              </label>
              <label className="field">
                <span className="field__label">Correo</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  required
                  maxLength={254}
                  placeholder="tucorreo@mail.com…"
                  aria-invalid={Boolean(errores.email)}
                  aria-describedby={errores.email ? "error-email" : undefined}
                />
                {errores.email && (
                  <span className="field__error" id="error-email">
                    {errores.email}
                  </span>
                )}
              </label>
              <label className="field">
                <span className="field__label">Me interesa</span>
                <select
                  className="select"
                  name="interes"
                  required
                  defaultValue={INTERESES[0]}
                  aria-invalid={Boolean(errores.interes)}
                  aria-describedby={errores.interes ? "error-interes" : undefined}
                >
                  {INTERESES.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </select>
                {errores.interes && (
                  <span className="field__error" id="error-interes">
                    {errores.interes}
                  </span>
                )}
              </label>
              <label className="field">
                <span className="field__label">Mensaje</span>
                <textarea
                  className="textarea"
                  name="mensaje"
                  rows={4}
                  required
                  maxLength={3000}
                  autoComplete="off"
                  placeholder="Cuéntanos brevemente qué buscas…"
                  aria-invalid={Boolean(errores.mensaje)}
                  aria-describedby={errores.mensaje ? "error-mensaje" : undefined}
                />
                {errores.mensaje && (
                  <span className="field__error" id="error-mensaje">
                    {errores.mensaje}
                  </span>
                )}
              </label>

              {/* Campo trampa para bots: oculto para las personas */}
              <div className="form__trap" aria-hidden="true">
                <label>
                  Empresa
                  <input type="text" name="empresa" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {estado === "error" && (
                <p className="form__alert" role="alert">
                  {mensajeError}
                </p>
              )}

              <button
                type="submit"
                className="btn btn--plum form__submit"
                disabled={enviando}
                aria-busy={enviando}
              >
                {enviando ? "Enviando…" : "Enviar"}
              </button>
            </form>
          )}
        </div>

        {/* Columna derecha: datos de contacto y newsletter */}
        <div className="contacto-aside">
          <div className="info-card">
            <h2 className="info-card__title">Dónde estamos</h2>
            <p className="info-card__text">
              {contacto.direccion[0]}
              <br />
              {contacto.direccion[1]}
            </p>
            <p className="info-card__text" style={{ marginTop: 14 }}>
              Sesiones online disponibles
            </p>
          </div>

          <div className="info-card info-card--links">
            <h2 className="info-card__title">Escríbenos</h2>
            <a
              className="info-card__link"
              href={contacto.instagram.url}
              target="_blank"
              rel="noreferrer"
            >
              {contacto.instagram.label}
            </a>
            <span className="info-card__link">{contacto.whatsapp}</span>
            <a
              className="info-card__link"
              href={`mailto:${contacto.email}`}
            >
              {contacto.email.split("@")[0]}@<wbr />
              {contacto.email.split("@")[1]}
            </a>
          </div>

          <div className="newsletter">
            <h2 className="newsletter__title">Súmate a la comunidad</h2>
            <p className="newsletter__text">
              Una carta al mes con prácticas, lecturas y fechas de clases.
            </p>
            <div className="newsletter__row">
              <input
                className="newsletter__input"
                type="email"
                placeholder="tucorreo@mail.com"
              />
              <button
                className="btn btn--dark newsletter__btn"
                onClick={() => setSuscrito(true)}
              >
                {suscrito ? "Listo" : "Sumarme"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
