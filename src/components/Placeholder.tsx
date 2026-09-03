// Marcador de posición para imágenes que aún no existen.
// Reemplázalo por un <img> cuando tengas las fotos definitivas.

interface PlaceholderProps {
  /** Texto que se muestra dentro del marcador */
  label: string;
  /** Clase extra para darle forma/tamaño (ej: "hero__photo") */
  className?: string;
}

export default function Placeholder({ label, className }: PlaceholderProps) {
  return (
    <div className={`placeholder ${className ?? ""}`}>
      <span className="placeholder__label">{label}</span>
    </div>
  );
}
