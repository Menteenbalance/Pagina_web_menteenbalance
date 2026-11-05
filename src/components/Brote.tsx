// Brote que crece una sola vez al aparecer (mensajes vacíos y 404).
// Decorativo: los lectores de pantalla lo omiten.

export default function Brote({ className = "" }: { className?: string }) {
  return (
    <svg className={`brote ${className}`} viewBox="0 0 64 72" aria-hidden="true" focusable="false">
      <path className="brote__tierra" d="M14 69 Q32 63 50 69" />
      <path className="brote__tallo" d="M32 68 C32 56 30 46 33 34 C35 26 33 20 32 14" pathLength="1" />
      <g className="brote__hoja brote__hoja--1">
        <path d="M32.6 40 C26 38 17 40 12 33 C19 28 28 31 32.6 40 Z" fill="#83c6bf" />
      </g>
      <g className="brote__hoja brote__hoja--2">
        <path d="M33 28 C39 25 48 27 53 20 C46 15 37 19 33 28 Z" fill="#c8d97f" />
      </g>
      <g className="brote__hoja brote__hoja--3">
        <path d="M32 15 C29 10 30 5 33 2 C36 6 35 11 32 15 Z" fill="#6fb5ad" />
      </g>
    </svg>
  );
}
