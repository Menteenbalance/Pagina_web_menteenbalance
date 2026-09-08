import { principios } from "../data";
import { img } from "../images";

// Página "Sobre nosotras": historia del proyecto y principios.
export default function Sobre() {
  return (
    <div className="page">
      <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
        Sobre nosotras
      </p>
      <h1 className="page-title" style={{ maxWidth: "18ch" }}>
        Autoconocimiento, compasión y atención plena
      </h1>

      <div className="about-grid">
        <div>
          <div className="prose">
            <p>
              Mente en Balance es el proyecto de María Ignacia Canessa,
              psicóloga clínica y profesora de yoga. Un espacio para generar
              comunidad y crear bienestar desde el autoconocimiento, la
              compasión y la atención plena.
            </p>
            <p>
              Su enfoque integra las Terapias de Tercera Generación —como la
              Terapia de Aceptación y Compromiso (ACT) y el mindfulness— con la
              práctica de Vinyasa Yoga y meditación, para acompañar la ansiedad,
              las emociones y la autocrítica con herramientas prácticas para el
              día a día.
            </p>
          </div>

          <div className="principios">
            {principios.map((p) => (
              <div className="principio" key={p.titulo}>
                <h3 className="principio__title">{p.titulo}</h3>
                <p className="principio__desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-media">
          <img
            className="about-media__img"
            src={img.claseGuiada.src}
            alt={img.claseGuiada.alt}
          />
          <div className="about-media__accent" />
        </div>
      </div>
    </div>
  );
}
