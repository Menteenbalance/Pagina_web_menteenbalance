import { InstagramLogo } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { contacto } from "../data";
import { img } from "../images";
import { useContenido } from "../lib/contenido";

// Tres fotos reales de la práctica, en formatos distintos (vertical,
// horizontal y vertical) para que el mosaico respire como un feed.
const mosaico = [
  { ...img.yogaParque, ancho: 780, alto: 1040, clase: "ig__foto--alta" },
  { ...img.retiroGrupo, ancho: 1000, alto: 667, clase: "ig__foto--ancha" },
  { ...img.claseGrupo, ancho: 1000, alto: 1333, clase: "ig__foto--baja" },
];

/**
 * Módulo "Síguenos en Instagram".
 * Una tarjeta de perfil (logo, cuenta, frase y botón) junto a un mosaico
 * de fotos propias del sitio. Sin servicios externos: no depende de la
 * API de Instagram y carga al instante. El texto y la visibilidad se
 * editan desde el panel (/admin → Instagram).
 */
export default function InstagramModulo() {
  const { instagram } = useContenido().ajustes;
  if (!instagram.visible) return null;

  const { label, url } = contacto.instagram;
  const nombreCuenta = label.replace(/^@/, "");

  return (
    <section className="ig" aria-labelledby="ig-titulo">
      <div className="ig__inner">
        <div className="ig__perfil">
          <div className="ig__cuenta">
            <span className="ig__avatar" aria-hidden="true">
              <img src="/logo.png" alt="" width={40} height={46} />
            </span>
            <span className="ig__cuenta-texto">
              <span className="ig__handle" translate="no">
                {nombreCuenta}
              </span>
              <span className="ig__red">
                <InstagramLogo size={15} weight="regular" aria-hidden="true" />
                Instagram
              </span>
            </span>
          </div>

          <h2 className="section-title ig__titulo" id="ig-titulo">
            Síguenos en Instagram
          </h2>
          {instagram.texto && <p className="ig__texto">{instagram.texto}</p>}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--plum ig__cta"
            aria-label={`Seguir ${label} en Instagram (se abre en una pestaña nueva)`}
          >
            <InstagramLogo size={18} weight="regular" aria-hidden="true" />
            Seguir en Instagram
          </a>
        </div>

        {/* Mosaico decorativo: todo lleva al mismo perfil que el botón,
            así que no se repite como enlace para lectores de pantalla. */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ig__mosaico"
          tabIndex={-1}
          aria-hidden="true"
        >
          {mosaico.map((f) => (
            <img
              key={f.src}
              className={`ig__foto ${f.clase}`}
              src={f.src}
              alt=""
              width={f.ancho}
              height={f.alto}
              loading="lazy"
              decoding="async"
            />
          ))}
        </a>
      </div>
    </section>
  );
}
