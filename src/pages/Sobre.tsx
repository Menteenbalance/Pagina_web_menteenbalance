import { Link } from "react-router-dom";
import { contacto, formacion, valores } from "../data";
import { img } from "../images";
import Reveal from "../components/Reveal";

// Pasos de la mirada de Mente en Balance (de la pieza "Mirada")
const pasos = [
  { verbo: "Pausar", texto: "¿Y si parar también fuera avanzar?" },
  { verbo: "Observar", texto: "Una pausa para observar." },
  { verbo: "Comprender", texto: "Observar para comprender." },
  { verbo: "Elegir", texto: "Comprender para elegir aquello que realmente importa para ti." },
];

const acompanar = [
  "Escuchar antes de juzgar.",
  "Comprender antes de exigirnos cambiar.",
  "Encontrar herramientas sin perder de vista a la persona.",
  "Recordar que pedir ayuda también es una forma de cuidarnos.",
];

// Página "Detrás de Mente en Balance": el espacio, la persona y sus valores.
export default function Sobre() {
  return (
    <>
      {/* 1. El espacio */}
      <section className="page db-intro">
        <p className="eyebrow eyebrow--plum" style={{ marginBottom: 24 }}>
          Detrás de Mente en Balance
        </p>
        <h1 className="page-title db-intro__titulo">Un espacio para volver a ti</h1>
        <div className="prose db-intro__texto">
          <p>
            Mente en Balance nace desde la idea de que no siempre necesitamos
            hacer más. A veces necesitamos parar, salir del piloto automático,
            escucharnos y comprender qué es lo que nos está pasando: desde dónde
            nos miramos, nos hablamos y nos relacionamos con el mundo.
          </p>
          <p>
            Es un espacio creado por María Ignacia Canessa, psicóloga clínica y
            profesora de yoga, que integra psicología, yoga y mindfulness para
            acompañarte a conectar con tu mente, tu cuerpo y tus emociones desde
            un lugar de presencia, curiosidad y compasión.
          </p>
          <p>
            Aquí no buscamos cambiar quién eres. Buscamos que puedas conocerte,
            comprenderte y construir una forma de vivir que se sienta más tuya,
            entendiendo que estamos en constante cambio.
          </p>
        </div>
      </section>

      {/* 2. Qué significa estar en balance */}
      <section className="db-balance">
        <div className="db-balance__inner">
          <Reveal>
            <div className="db-balance__head">
              <h2 className="section-title">¿Qué significa estar en balance?</h2>
              <p className="db-balance__lead">
                No significa estar bien todo el tiempo. La vida se mueve.
                Nosotros también.
              </p>
              <p className="db-balance__texto">
                Estar en balance puede significar aprender a reconocer lo que
                necesitas, relacionarte de otra manera con lo que sientes y
                encontrar herramientas que te permitan volver a ti cuando el
                piloto automático toma el control.
              </p>
            </div>
          </Reveal>
          <ol className="db-pasos">
            {pasos.map((p, i) => (
              <Reveal key={p.verbo} delay={i * 110}>
                <li className="db-paso">
                  <span className="db-paso__verbo">{p.verbo}</span>
                  <span className="db-paso__texto">{p.texto}</span>
                </li>
              </Reveal>
            ))}
          </ol>
          <p className="db-balance__cierre">
            Más presencia, menos piloto automático.
          </p>
        </div>
      </section>

      {/* 3. La persona */}
      <section className="section db-persona" aria-labelledby="db-persona-titulo">
        <div className="db-persona__media">
          <img
            className="db-persona__foto"
            src={img.mariaIgnacia.src}
            alt={img.mariaIgnacia.alt}
            width={714}
            height={984}
            loading="lazy"
            decoding="async"
          />
          <div className="db-persona__accent" aria-hidden="true" />
        </div>
        <div className="db-persona__texto">
          <h2 className="section-title" id="db-persona-titulo">
            La persona detrás de Mente en Balance
          </h2>
          <p className="db-persona__nombre">María Ignacia Canessa</p>
          <p className="db-persona__rol">Psicóloga clínica · Profesora de yoga</p>
          <div className="prose" style={{ marginTop: 28 }}>
            <p>
              Soy María Ignacia, psicóloga clínica y profesora de Vinyasa Yoga.
              Creo en la importancia de crear espacios donde podamos detenernos,
              escucharnos y comprender lo que estamos viviendo, sin juicios y
              desde una mirada amable hacia nosotros mismos.
            </p>
            <p>
              Mi forma de acompañar integra distintas herramientas de la
              psicología, especialmente de las Terapias de Tercera Generación
              (una evolución de la terapia cognitivo conductual, como ACT, DBT y
              las terapias basadas en las emociones y en la compasión), junto
              con mindfulness, movimiento y consciencia corporal.
            </p>
            <p>
              Me interesa que la terapia no sea solo un espacio para hablar de lo
              que nos pasa, sino también un lugar para comprender nuestros
              patrones, conectar con nuestras necesidades y desarrollar
              herramientas que podamos llevar a la vida cotidiana.
            </p>
            <p>
              Acompaño procesos desde una mirada cercana, integrativa y basada en
              evidencia, adaptando el proceso a la historia, necesidades y
              objetivos de cada persona.
            </p>
          </div>
        </div>
      </section>

      {/* 3b. Acompañar y formación */}
      <section className="section db-detalle">
        <div className="db-acompanar">
          <h2 className="db-h3">Para mí, acompañar también significa…</h2>
          <ul className="db-acompanar__lista">
            {acompanar.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="db-formacion">
          <h2 className="db-h3">Mi formación</h2>
          <ol className="db-formacion__lista">
            {formacion.map((f) => (
              <li key={f.titulo} className="db-formacion__item">
                <span className="db-formacion__anio">{f.anio}</span>
                <span className="db-formacion__cuerpo">
                  <span className="db-formacion__titulo">{f.titulo}</span>
                  <span className="db-formacion__lugar">{f.lugar}</span>
                  {f.detalle && <span className="db-formacion__detalle">{f.detalle}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Por qué yoga */}
      <section className="section db-yoga" aria-labelledby="db-yoga-titulo">
        <div className="db-yoga__texto">
          <h2 className="section-title" id="db-yoga-titulo">¿Por qué yoga?</h2>
          <div className="prose" style={{ marginTop: 26 }}>
            <p>
              El yoga llegó a mi vida en un momento desafiante, cuando necesitaba
              encontrar un espacio para hacer una pausa y volver a mí. Al
              principio fue una forma de moverme y respirar, pero con el tiempo
              descubrí que también podía ser una manera de escucharme, habitar
              mi cuerpo y estar más presente.
            </p>
            <p>
              A través de su práctica aprendí a conocerme desde otro lugar,
              observarme con mayor curiosidad y hablarme de una manera más
              amable, incluso en aquellos momentos en que las cosas no estaban
              bien.
            </p>
            <p>
              Esa experiencia transformó mi manera de entender el bienestar y,
              con el tiempo, también mi forma de acompañar a otros. Por eso, en
              Mente en Balance, el yoga no está separado de la psicología: es
              otro camino para cultivar autoconocimiento, presencia y conexión
              con nosotros mismos.
            </p>
          </div>
        </div>
        <img
          className="db-yoga__foto"
          src={img.claseGuiada.src}
          alt={img.claseGuiada.alt}
          width={960}
          height={1280}
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* 5. Por qué crear comunidad */}
      <section className="db-comunidad" aria-labelledby="db-comunidad-titulo">
        <div className="db-comunidad__inner">
          <h2 className="db-comunidad__titulo" id="db-comunidad-titulo">
            ¿Por qué crear comunidad?
          </h2>
          <div className="db-comunidad__texto">
            <p>
              Con el tiempo fui comprendiendo que el bienestar no es un camino
              que tenemos que recorrer solos. Somos en relación, y muchas veces es
              justamente en el encuentro con otros donde podemos sentirnos
              vistos, comprendidos y acompañados.
            </p>
            <p>
              Por eso, Mente en Balance también busca crear espacios de
              comunidad: instancias para pausar, compartir experiencias,
              aprender, crear y conectar con otros desde un lugar seguro y sin
              juicios.
            </p>
            <p>
              Creo en el valor de encontrarnos, de poder hablar de lo que nos
              pasa y también de escuchar lo que otros viven. En esos encuentros
              podemos descubrir que no somos los únicos que estamos atravesando
              ciertas experiencias, y que dejarnos acompañar también es una forma
              de cuidarnos.
            </p>
            <p>
              Para mí, crear comunidad es generar espacios de autocuidado y
              contención, donde podamos sostenernos, conocernos y crecer en
              relación con otros.
            </p>
          </div>
          <p className="db-comunidad__frase">
            Porque cuidarnos no siempre significa hacerlo solos. A veces,
            cuidarnos también es encontrarnos.
          </p>
          <a
            href={contacto.comunidadWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn db-comunidad__cta"
            aria-label="Unirme a la comunidad de WhatsApp (se abre en una pestaña nueva)"
          >
            Unirme a la comunidad
          </a>
        </div>
      </section>

      {/* 6. Valores del espacio */}
      <section className="section db-valores" aria-labelledby="db-valores-titulo">
        <h2 className="section-title" id="db-valores-titulo">Valores del espacio</h2>
        <ul className="db-valores__grid">
          {valores.map((v, i) => (
            <Reveal key={v.titulo} delay={(i % 3) * 90}>
              <li className="db-valor">
                <span className="db-valor__titulo">{v.titulo}</span>
                <span className="db-valor__desc">{v.desc}</span>
              </li>
            </Reveal>
          ))}
        </ul>
        <div className="db-cierre">
          <p className="db-cierre__texto">
            Porque no se trata de cambiar quién eres. Se trata de poder
            escucharte, comprenderte y construir una forma de vivir que se sienta
            más tuya.
          </p>
          <Link to="/servicios" className="btn btn--plum">
            Ver servicios
          </Link>
        </div>
      </section>
    </>
  );
}
