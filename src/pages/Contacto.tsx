import { useRef, useState, type FormEvent } from "react";
import { ChatCircleText } from "@phosphor-icons/react/dist/csr/ChatCircleText";
import { contacto, enlaceWhatsApp } from "../data";

const INTERESES = [
  "Psicoterapia individual",
  "Vinyasa Yoga y Meditación",
  "Encuentros, talleres y experiencias",
  "Bienestar para organizaciones",
  "Otro",
];
const MODALIDADES = ["Presencial", "Online", "Aún no lo sé"];
/** Largo máximo del mensaje (WhatsApp lo recibe completo en el enlace) */
const MAX_MENSAJE = 700;

type Campo = "nombre" | "mensaje";

/** Texto con que se abre la conversación en WhatsApp. */
export function armarMensaje(d: { nombre: string; interes: string; modalidad: string; mensaje: string }): string {
  const lineas = [
    `Hola Mari, soy ${d.nombre}. Te escribo desde la página de Mente en Balance.`,
    "",
    `Me interesa: ${d.interes}`,
    ...(d.modalidad ? [`Modalidad: ${d.modalidad}`] : []),
    "",
    d.mensaje,
  ];
  return lineas.join("\n");
}

// Página "Contacto": el formulario arma el mensaje y abre WhatsApp con él
// listo para enviar (wa.me). No pasa por ningún servidor ni se guarda.
export default function Contacto() {
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [enlace, setEnlace] = useState<string | null>(null);
  const [largo, setLargo] = useState(0);
  // Lo último que se escribió, para volver al formulario sin perderlo
  const [previo, setPrevio] = useState({ nombre: "", interes: INTERESES[0], modalidad: "", mensaje: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const listoRef = useRef<HTMLDivElement>(null);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nombre = String(datos.get("nombre") ?? "").trim();
    const mensaje = String(datos.get("mensaje") ?? "").trim();
    const nuevos: Partial<Record<Campo, string>> = {};
    if (nombre.length < 2) nuevos.nombre = "Escribe tu nombre para que Mari sepa quién le escribe.";
    if (mensaje.length < 5) nuevos.mensaje = "Cuéntale brevemente qué buscas.";
    setErrores(nuevos);
    if (nuevos.nombre || nuevos.mensaje) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${nuevos.nombre ? "nombre" : "mensaje"}"]`)
        ?.focus();
      return;
    }

    const valores = {
      nombre,
      interes: String(datos.get("interes") ?? INTERESES[0]),
      modalidad: String(datos.get("modalidad") ?? ""),
      mensaje,
    };
    setPrevio(valores);
    const url = enlaceWhatsApp(armarMensaje(valores));
    setEnlace(url);
    // Se abre en el gesto de la persona (no lo bloquea el navegador). Si
    // igual no se abre, queda el botón de la pantalla siguiente.
    window.open(url, "_blank", "noopener,noreferrer");
    requestAnimationFrame(() => listoRef.current?.focus());
  }

  return (
    <div className="page">
      <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
        Contacto
      </p>
      <h1 className="page-title" style={{ maxWidth: "15ch" }}>
        Conecta con tu cuerpo
      </h1>

      <div className="contacto-grid">
        {/* Columna izquierda: formulario o confirmación */}
        <div aria-live="polite">
          {enlace ? (
            <div className="sent" ref={listoRef} tabIndex={-1}>
              <h2 className="sent__title">Tu mensaje está listo en WhatsApp</h2>
              <p className="sent__text">
                Se abrió WhatsApp con tu mensaje escrito. Solo falta que toques <strong>Enviar</strong> ahí.
                Mari responde dentro de 48 horas hábiles.
              </p>
              <div className="sent__acciones">
                <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn btn--teal btn--icono">
                  <ChatCircleText size={18} weight="regular" aria-hidden="true" />
                  Abrir WhatsApp de nuevo
                </a>
                <button type="button" className="text-link sent__volver" onClick={() => setEnlace(null)}>
                  Cambiar el mensaje
                </button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={enviar} ref={formRef} noValidate>
              <p className="form__intro">
                Completa estos datos y se abrirá WhatsApp con tu mensaje listo para enviar a Mari. Lo que escribas no
                se guarda en este sitio.
              </p>
              <label className="field">
                <span className="field__label">Tu nombre</span>
                <input
                  className="input"
                  type="text"
                  name="nombre"
                  autoComplete="name"
                  required
                  maxLength={80}
                  defaultValue={previo.nombre}
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
                <span className="field__label">Me interesa</span>
                <select className="select" name="interes" defaultValue={previo.interes}>
                  {INTERESES.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </select>
              </label>
              <fieldset className="field field--opciones">
                <legend className="field__label">Modalidad (opcional)</legend>
                <div className="opciones">
                  {MODALIDADES.map((m) => (
                    <label key={m} className="opcion">
                      <input type="radio" name="modalidad" value={m} defaultChecked={previo.modalidad === m} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span className="field__label">Mensaje</span>
                <textarea
                  className="textarea"
                  name="mensaje"
                  rows={4}
                  required
                  maxLength={MAX_MENSAJE}
                  defaultValue={previo.mensaje}
                  autoComplete="off"
                  placeholder="Cuéntale brevemente qué buscas o qué día te acomoda…"
                  onChange={(e) => setLargo(e.target.value.length)}
                  aria-invalid={Boolean(errores.mensaje)}
                  aria-describedby={`ayuda-mensaje${errores.mensaje ? " error-mensaje" : ""}`}
                />
                <span className="field__hint" id="ayuda-mensaje">
                  {largo}/{MAX_MENSAJE}
                </span>
                {errores.mensaje && (
                  <span className="field__error" id="error-mensaje">
                    {errores.mensaje}
                  </span>
                )}
              </label>

              <button type="submit" className="btn btn--teal btn--icono form__submit">
                <ChatCircleText size={18} weight="regular" aria-hidden="true" />
                Continuar en WhatsApp
              </button>
              <p className="form__nota">
                ¿Prefieres escribir tú? <a href={enlaceWhatsApp()} target="_blank" rel="noopener noreferrer">Abre el chat directo</a>{" "}
                ({contacto.whatsapp.replace(/^WhatsApp\s*/, "")}).
              </p>
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
            <h2 className="info-card__title">Escríbeme</h2>
            <a
              className="info-card__link"
              href={contacto.instagram.url}
              target="_blank"
              rel="noreferrer"
            >
              {contacto.instagram.label}
            </a>
            <a
              className="info-card__link"
              href={enlaceWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${contacto.whatsapp} (se abre en una pestaña nueva)`}
            >
              {contacto.whatsapp}
            </a>
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
              Información de clases, precios especiales en talleres y
              experiencias, y espacios para encontrarnos. Únete a la comunidad
              de WhatsApp.
            </p>
            <a
              href={contacto.comunidadWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--dark newsletter__btn"
              aria-label="Unirme a la comunidad de WhatsApp (se abre en una pestaña nueva)"
            >
              Unirme a la comunidad
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
