import Placeholder from "../components/Placeholder";
import { principios } from "../data";

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
              Texto placeholder de la historia del proyecto. Describe el origen
              de Mente en Balance, la unión entre psicología y yoga y la manera
              de acompañar a cada persona.
            </p>
            <p>
              Segundo párrafo placeholder sobre la mirada clínica, el trabajo
              corporal y la comunidad que se forma alrededor de la práctica.
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
          <Placeholder
            label="retrato · fundadora"
            className="placeholder about-media__img"
          />
          <div className="about-media__accent" />
        </div>
      </div>
    </div>
  );
}
