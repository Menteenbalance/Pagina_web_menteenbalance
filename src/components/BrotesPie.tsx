// Brotes que asoman sobre el pie de página, en todas las páginas.
// Agrupados hacia los costados para dejar el centro despejado.

const BROTES: { x: number; alto: number; lado: 1 | -1; hojas: string[] }[] = [
  { x: 36, alto: 30, lado: 1, hojas: ["#83c6bf", "#c8d97f"] },
  { x: 58, alto: 20, lado: -1, hojas: ["#a9d6cf"] },
  { x: 84, alto: 26, lado: 1, hojas: ["#6fb5ad", "#dfe08c"] },
  { x: 318, alto: 16, lado: -1, hojas: ["#c8d97f"] },
  { x: 852, alto: 18, lado: 1, hojas: ["#a9d6cf"] },
  { x: 1086, alto: 28, lado: -1, hojas: ["#83c6bf", "#dfe08c"] },
  { x: 1112, alto: 34, lado: 1, hojas: ["#6fb5ad", "#c8d97f"] },
  { x: 1140, alto: 22, lado: -1, hojas: ["#a9d6cf"] },
];

function hojaEn(x: number, y: number, lado: number, escala: number) {
  // Hoja almendrada que sale del tallo hacia un lado y apunta hacia arriba
  const l = lado * escala;
  return `M${x} ${y} C${x + 4 * l} ${y - 2 * escala} ${x + 10 * l} ${y - 4 * escala} ${x + 14 * l} ${y - 10 * escala} C${x + 8 * l} ${y - 10 * escala} ${x + 3 * l} ${y - 6 * escala} ${x} ${y} Z`;
}

export default function BrotesPie() {
  return (
    <div className="brotes-pie" aria-hidden="true">
      <svg viewBox="0 0 1180 40" preserveAspectRatio="xMidYMax meet" focusable="false">
        {BROTES.map((b, i) => {
          const base = 40;
          const punta = base - b.alto;
          const curva = b.lado * 4;
          return (
            <g key={i} className="brotes-pie__brote" style={{ animationDelay: `${(-i * 1.3).toFixed(1)}s`, transformOrigin: `${b.x}px 40px` }}>
              <path
                d={`M${b.x} ${base} C${b.x} ${base - b.alto * 0.4} ${b.x + curva} ${base - b.alto * 0.7} ${b.x + curva * 0.5} ${punta}`}
                className="brotes-pie__tallo"
              />
              {b.hojas.map((c, j) => (
                <path
                  key={j}
                  d={hojaEn(b.x + curva * (0.25 + j * 0.2), base - b.alto * (0.45 + j * 0.3), j % 2 === 0 ? b.lado : -b.lado, 0.75 + b.alto / 60)}
                  fill={c}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
