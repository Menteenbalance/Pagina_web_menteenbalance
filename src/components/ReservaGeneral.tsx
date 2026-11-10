import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { useReserva } from "../lib/contenido";

/**
 * Bloque bajo "Próximas clases y talleres" (Inicio y Agenda): lleva a la
 * plataforma de reservas, donde están todos los servicios. El enlace y el
 * nombre de la plataforma se cambian en el panel (pestaña Enlaces).
 */
export default function ReservaGeneral() {
  const { url, plataforma } = useReserva();
  return (
    <aside className="reserva-general" aria-label={`Reservar en ${plataforma}`}>
      <p className="reserva-general__texto">
        <strong>Psicoterapia, yoga, meditación y talleres:</strong> revisa todos los horarios disponibles y reserva
        directamente en {plataforma}.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--teal btn--sm btn--icono reserva-general__btn"
        aria-label={`Reservar en ${plataforma} (se abre en una pestaña nueva)`}
      >
        Reservar en {plataforma}
        <ArrowUpRight size={16} weight="regular" aria-hidden="true" />
      </a>
    </aside>
  );
}
