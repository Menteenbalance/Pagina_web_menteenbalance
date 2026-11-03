// Recordatorios de calendario para los mensajes programados de la comunidad.
// Las horas se guardan como hora de Santiago ("2026-11-10T08:00"); aquí se
// pasan a UTC para que el aviso suene a la hora correcta en cualquier celular.

/** "2026-11-10T08:00" (hora de Santiago) → Date en UTC. */
export function santiagoAUtc(local: string): Date {
  const [f, h] = local.split("T");
  const [a, m, d] = f.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  const comoUtc = Date.UTC(a, m - 1, d, hh, mm);
  // Diferencia entre lo que marca el reloj de Santiago y UTC en ese momento
  const desfase = (t: number) => {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Santiago",
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
        .formatToParts(new Date(t))
        .map((x) => [x.type, x.value])
    );
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - t;
  };
  let t = comoUtc - desfase(comoUtc);
  t = comoUtc - desfase(t); // segunda pasada por si cae en un cambio de hora
  return new Date(t);
}

const aIcs = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapar = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

interface Recordatorio {
  id: string;
  titulo: string;
  /** Hora de Santiago, "AAAA-MM-DDTHH:mm" */
  cuando: string;
  /** Texto de apoyo (inicio del mensaje) */
  detalle: string;
  /** Dirección del mensaje en el panel */
  enlace: string;
}

/** Archivo .ics (iPhone, Outlook, Google) con alarma a la hora exacta. */
export function archivoIcs(r: Recordatorio): Blob {
  const inicio = santiagoAUtc(r.cuando);
  const fin = new Date(inicio.getTime() + 15 * 60 * 1000);
  const ahora = new Date();
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mente en Balance//Panel//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:comunidad-${r.id}@menteenbalance`,
    `DTSTAMP:${aIcs(ahora)}`,
    `DTSTART:${aIcs(inicio)}`,
    `DTEND:${aIcs(fin)}`,
    `SUMMARY:${escapar(`Enviar a la comunidad: ${r.titulo}`)}`,
    `DESCRIPTION:${escapar(`Abre el mensaje y tócalo para enviarlo:\n${r.enlace}\n\n${r.detalle}`)}`,
    `URL:${r.enlace}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapar(`Enviar a la comunidad: ${r.titulo}`)}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Blob([lineas.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
}

/** Enlace para crear el evento directo en Google Calendar. */
export function enlaceGoogleCalendar(r: Recordatorio): string {
  const inicio = santiagoAUtc(r.cuando);
  const fin = new Date(inicio.getTime() + 15 * 60 * 1000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `Enviar a la comunidad: ${r.titulo}`,
    dates: `${aIcs(inicio)}/${aIcs(fin)}`,
    details: `Abre el mensaje y tócalo para enviarlo:\n${r.enlace}\n\n${r.detalle}`,
    ctz: "America/Santiago",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
