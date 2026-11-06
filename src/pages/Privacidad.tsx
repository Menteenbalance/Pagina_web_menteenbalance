// ─────────────────────────────────────────────────────────────
//  PRIVACIDAD Y AVISO LEGAL  (/privacidad)
//  Texto sobrio y breve: qué datos pasan por el sitio (casi ninguno),
//  cómo ejercer los derechos y los avisos de uso del contenido.
//  Al cambiar algo aquí, actualizar ACTUALIZADA.
// ─────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { contacto } from "../data";

const ACTUALIZADA = { iso: "2026-11-05", texto: "5 de noviembre de 2026" };

function Correo() {
  return <a href={`mailto:${contacto.email}`}>{contacto.email}</a>;
}

export default function Privacidad() {
  return (
    <article className="page articulo legal">
      <header className="articulo__head">
        <p className="post__cat">Información legal</p>
        <h1 className="page-title articulo__titulo">Privacidad y aviso legal</h1>
        <p className="articulo__bajada">
          Este sitio guarda lo mínimo posible. Aquí te cuento qué datos pasan por él, para qué y cómo puedes pedir que
          se corrijan o eliminen.
        </p>
        <p className="articulo__meta">
          Última actualización: <time dateTime={ACTUALIZADA.iso}>{ACTUALIZADA.texto}</time>
        </p>
        <nav className="legal__indice" aria-label="En esta página">
          <a href="#privacidad">Privacidad</a>
          <span aria-hidden="true">·</span>
          <a href="#aviso-legal">Aviso legal</a>
        </nav>
      </header>

      <div className="articulo__cuerpo">
        <h2 id="privacidad" tabIndex={-1}>
          Política de privacidad
        </h2>

        <h3>Quién es responsable</h3>
        <p>
          María Ignacia Canessa, psicóloga clínica, a cargo de Mente en Balance ({contacto.direccion.join(", ")}).
          Para cualquier consulta sobre tus datos puedes escribir a <Correo />.
        </p>

        <h3>Qué datos se tratan</h3>
        <ul>
          <li>
            <strong>Formulario de contacto.</strong> Lo que escribes no se envía ni se guarda en este sitio: tu
            navegador arma el mensaje y abre WhatsApp. Solo si tú lo envías, se recibe tu nombre, tu número y tu
            mensaje, que se usa únicamente para responderte y coordinar una atención.
          </li>
          <li>
            <strong>Estadísticas de visitas.</strong> Usamos Vercel Web Analytics para saber cuántas personas visitan
            cada página, desde qué tipo de dispositivo y de qué país. Es anónimo, no usa cookies y no permite
            identificarte.
          </li>
          <li>
            <strong>Comunidad de WhatsApp.</strong> Sumarte es voluntario. Al hacerlo, quienes administran la
            comunidad pueden ver tu número. Puedes salir cuando quieras.
          </li>
          <li>
            <strong>Reseñas.</strong> Las reseñas que ves en el inicio son públicas y provienen de mi perfil en
            Encuadrado, tal como las publicaron sus autores.
          </li>
        </ul>
        <p>
          Este sitio no pide información de salud. Te sugiero no incluir detalles sensibles en el primer mensaje: lo
          que conversemos en una atención se resguarda bajo secreto profesional y la normativa de derechos de los
          pacientes (Ley 20.584).
        </p>

        <h3>Cookies y almacenamiento en tu navegador</h3>
        <p>
          El sitio no usa cookies de publicidad ni de seguimiento, por eso no verás un aviso de cookies. Tu navegador
          guarda la lista de fotos actuales del sitio para que cargue más rápido; no contiene datos personales y se
          borra al limpiar los datos de navegación.
        </p>

        <h3>Servicios externos</h3>
        <p>
          El sitio está alojado en Vercel (Estados Unidos), que registra datos técnicos de cada visita, como la
          dirección IP, por seguridad y por un tiempo limitado. Las tipografías se sirven desde el mismo sitio. Los
          enlaces a WhatsApp, Instagram y Encuadrado te llevan a servicios con sus propias políticas de privacidad.
        </p>

        <h3>Tus derechos</h3>
        <p>
          Puedes pedir acceso a tus datos, su rectificación, su eliminación, oponerte a su tratamiento o solicitar su
          portabilidad, conforme a la Ley 19.628 y a la Ley 21.719 desde su entrada en vigencia. Escribe a <Correo />{" "}
          o por WhatsApp y te responderé dentro de los plazos legales. 
        </p>

        <h2 id="aviso-legal" tabIndex={-1}>
          Aviso legal
        </h2>
        <ul>
          <li>
            <strong>Contenido informativo.</strong> Los textos del sitio y del Diario buscan acompañar y acercar
            herramientas de bienestar. No reemplazan una evaluación ni un tratamiento psicológico o médico.
          </li>
          <li>
            <strong>Propiedad intelectual.</strong> Los textos, fotografías, logo e ilustraciones pertenecen a Mente
            en Balance. Puedes compartirlos citando la fuente con un enlace; para otros usos, escríbeme.
          </li>
          <li>
            <strong>Enlaces externos.</strong> Mente en Balance no es responsable del contenido de los sitios de
            terceros a los que se enlaza.
          </li>
        </ul>

       
        <p className="legal__volver">
          <Link to="/contacto" className="text-link">
            ¿Dudas? Escríbeme
          </Link>
        </p>
      </div>
    </article>
  );
}
