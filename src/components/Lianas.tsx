// ─────────────────────────────────────────────────────────────
//  LIANAS DE LA PORTADA
//  Enredaderas que bajan por los costados del Inicio, desde arriba
//  hasta antes del bloque de Servicios. Hojas en los turquesa y lima de
//  la marca, alguna flor ciruela y zarcillos; se mecen muy suave.
//  Son decorativas: no las leen los lectores de pantalla, no reciben
//  clics y solo aparecen cuando hay espacio libre a los lados.
// ─────────────────────────────────────────────────────────────

const ANCHO = 200;
const ALTO = 2400;

/** Números pseudoaleatorios repetibles (siempre el mismo dibujo). */
function azar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Hebra {
  tallo: string;
  hojas: { x: number; y: number; giro: number; escala: number; color: string }[];
  flores: { x: number; y: number; escala: number }[];
  zarcillos: string[];
  duracion: number;
  retraso: number;
  origenX: number;
}

const COLORES_HOJA = ["#83c6bf", "#6fb5ad", "#a9d6cf", "#dfe08c", "#c8d97f"];

function hebra(r: () => number, x0: number, largo: number, amplitud: number, onda: number): Hebra {
  const fase = r() * Math.PI * 2;
  const xEn = (y: number) => x0 + amplitud * Math.sin((y / onda) * Math.PI * 2 + fase) * (0.35 + 0.65 * Math.min(1, y / 300));
  // Tallo: curva suave por puntos cada 30 unidades
  const puntos: [number, number][] = [];
  for (let y = -20; y <= largo; y += 30) puntos.push([xEn(y), y]);
  let d = `M${puntos[0][0].toFixed(1)} ${puntos[0][1]}`;
  for (let i = 1; i < puntos.length - 1; i++) {
    const [x, y] = puntos[i];
    const [xs, ys] = puntos[i + 1];
    d += ` Q${x.toFixed(1)} ${y} ${((x + xs) / 2).toFixed(1)} ${(y + ys) / 2}`;
  }

  const hojas: Hebra["hojas"] = [];
  const flores: Hebra["flores"] = [];
  const zarcillos: string[] = [];
  let lado = r() > 0.5 ? 1 : -1;
  for (let y = 40 + r() * 30; y < largo - 10; y += 64 + r() * 42) {
    const x = xEn(y);
    // Dirección del tallo en ese punto, para orientar la hoja
    const pendiente = (xEn(y + 2) - xEn(y - 2)) / 4;
    const base = (Math.atan2(1, pendiente) * 180) / Math.PI; // ángulo del tallo hacia abajo
    const escala = (0.65 + r() * 0.55) * (1 - (y / largo) * 0.35);
    hojas.push({ x, y, giro: base + lado * (48 + r() * 22), escala, color: COLORES_HOJA[Math.floor(r() * COLORES_HOJA.length)] });
    if (r() < 0.22) {
      // Zarcillo: pequeña espiral que sale del tallo
      const s = lado * (10 + r() * 6);
      zarcillos.push(
        `M${x.toFixed(1)} ${y.toFixed(1)} q${s.toFixed(1)} ${(4 + r() * 6).toFixed(1)} ${(s * 1.4).toFixed(1)} ${(-6 - r() * 4).toFixed(1)} q${(s * 0.3).toFixed(1)} -8 ${(-s * 0.35).toFixed(1)} -7 q-${(Math.abs(s) * 0.1).toFixed(1)} 4 ${(s * 0.12).toFixed(1)} 5`
      );
    }
    if (r() < 0.12) flores.push({ x: x - lado * 6, y: y + 10, escala: 0.7 + r() * 0.5 });
    lado = -lado;
  }
  return { tallo: d, hojas, flores, zarcillos, duracion: 9 + r() * 6, retraso: -r() * 8, origenX: x0 };
}

function dibujo(semilla: number): Hebra[] {
  const r = azar(semilla);
  return [
    hebra(r, 46 + r() * 10, 2300, 16 + r() * 6, 300 + r() * 80),
    hebra(r, 108 + r() * 14, 1650, 20 + r() * 6, 260 + r() * 60),
    hebra(r, 158 + r() * 10, 1080, 12 + r() * 6, 220 + r() * 60),
  ];
}

const IZQUIERDA = dibujo(7);
const DERECHA = dibujo(23);

/** Hoja almendrada con nervio central (apunta hacia +x antes de girar). */
const HOJA = "M0 0 C6 -8 20 -10 30 0 C20 10 6 8 0 0 Z";

function Costado({ hebras, lado }: { hebras: Hebra[]; lado: "izquierda" | "derecha" }) {
  return (
    <svg
      className={`lianas__svg lianas__svg--${lado}`}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      {hebras.map((h, i) => (
        <g
          key={i}
          className="lianas__hebra"
          style={{
            transformOrigin: `${h.origenX}px 0px`,
            animationDuration: `${h.duracion.toFixed(1)}s`,
            animationDelay: `${h.retraso.toFixed(1)}s`,
          }}
        >
          <path d={h.tallo} className="lianas__tallo" />
          {h.zarcillos.map((z, j) => (
            <path key={j} d={z} className="lianas__zarcillo" />
          ))}
          {h.hojas.map((o, j) => (
            <g key={j} transform={`translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) rotate(${o.giro.toFixed(1)}) scale(${o.escala.toFixed(2)})`}>
              <path d={HOJA} fill={o.color} />
              <path d="M2 0 L26 0" className="lianas__nervio" />
            </g>
          ))}
          {h.flores.map((f, j) => (
            <g key={j} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${f.escala.toFixed(2)})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-5" rx="3.4" ry="5.2" fill="#c696b0" transform={`rotate(${a})`} />
              ))}
              <circle r="2.6" fill="#f8ce9a" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function Lianas() {
  return (
    <div className="lianas" aria-hidden="true">
      <Costado hebras={IZQUIERDA} lado="izquierda" />
      <Costado hebras={DERECHA} lado="derecha" />
    </div>
  );
}
