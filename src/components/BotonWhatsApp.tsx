import { useEffect, useRef, useState } from "react";
import { enlaceWhatsApp } from "../data";

/**
 * Botón flotante de WhatsApp (solo en celulares, < 768 px; ver index.css).
 *
 * Para no tapar contenido ni otros botones, se esconde:
 * - al inicio de la página (deja libre el primer pantallazo y sus botones),
 * - cuando el pie de página está a la vista (ahí ya están los contactos),
 * - cuando quedaría encima de otro botón (p. ej. "Unirme a la comunidad"),
 * - mientras se escribe en un formulario (el teclado ocupa la pantalla),
 * - con el menú móvil abierto (lo indica Header en <html data-menu-abierto>).
 * No aparece en /admin porque solo se monta en el sitio público.
 */
const DESDE_SCROLL = 280;
/**
 * Botones y enlaces que el flotante nunca debe tapar. Las tarjetas que ocupan
 * casi todo el ancho (más del 70 %) no cuentan: siempre quedan tocables.
 */
const OTROS_BOTONES = "main a, main button, main [role='button'], main input, main textarea";
const ANCHO_TARJETA = 0.7;
/** Margen de cortesía alrededor del flotante (px) */
const HOLGURA = 12;

export default function BotonWhatsApp() {
  const [bajoElInicio, setBajoElInicio] = useState(false);
  const [pieVisible, setPieVisible] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [tapaBoton, setTapaBoton] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let pendiente = 0;
    const revisar = () => {
      pendiente = 0;
      setBajoElInicio(window.scrollY > DESDE_SCROLL);
      const propio = ref.current?.getBoundingClientRect();
      if (!propio || propio.width === 0) return;
      const choca = [...document.querySelectorAll<HTMLElement>(OTROS_BOTONES)].some((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.width < window.innerWidth * ANCHO_TARJETA &&
          r.right > propio.left - HOLGURA &&
          r.left < propio.right + HOLGURA &&
          r.bottom > propio.top - HOLGURA &&
          r.top < propio.bottom + HOLGURA
        );
      });
      setTapaBoton(choca);
    };
    const programar = () => {
      if (!pendiente) pendiente = requestAnimationFrame(revisar);
    };
    revisar();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    return () => {
      cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
    };
  }, []);

  useEffect(() => {
    const pie = document.querySelector(".footer");
    if (!pie || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => setPieVisible(e.isIntersecting));
    obs.observe(pie);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const esCampo = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input, textarea, select, [contenteditable]");
    const alEnfocar = (e: FocusEvent) => setEscribiendo(esCampo(e.target));
    // Al salir de un campo, espera a ver si el foco pasó a otro campo
    const alSalir = () =>
      requestAnimationFrame(() => setEscribiendo(esCampo(document.activeElement)));
    document.addEventListener("focusin", alEnfocar);
    document.addEventListener("focusout", alSalir);
    return () => {
      document.removeEventListener("focusin", alEnfocar);
      document.removeEventListener("focusout", alSalir);
    };
  }, []);

  const visible = bajoElInicio && !pieVisible && !escribiendo && !tapaBoton;

  return (
    <a
      ref={ref}
      href={enlaceWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      className={visible ? "wa-flotante is-visible" : "wa-flotante"}
      aria-label="Escríbeme por WhatsApp (se abre en una pestaña nueva)"
    >
      <svg
        className="wa-flotante__icono"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20.5 11.6a8.4 8.4 0 0 1-12.2 7.5L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.6z" />
        <circle cx="8.4" cy="11.6" r="1.05" />
        <circle cx="12" cy="11.6" r="1.05" />
        <circle cx="15.6" cy="11.6" r="1.05" />
      </svg>
      <span className="wa-flotante__texto">WhatsApp</span>
    </a>
  );
}
