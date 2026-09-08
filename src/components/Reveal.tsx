import { cloneElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement, Ref } from "react";

// Props que el elemento hijo debe aceptar para poder animarlo.
type Animatable = {
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
};

interface RevealProps {
  /** Un único elemento (div, section, Link, etc.) al que se le anima la entrada. */
  children: ReactElement<Animatable>;
  /**
   * Retraso en milisegundos antes de animar. Sirve para escalonar (stagger)
   * varios elementos y crear una cascada suave.
   */
  delay?: number;
}

/**
 * Revela su contenido con una aparición suave (se desvanece y sube apenas)
 * cuando entra en el viewport al hacer scroll.
 *
 * No añade un <div> extra: aplica las clases y el ref directamente sobre el
 * hijo, para no alterar layouts como grillas o flex.
 */
export default function Reveal({ children, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeta a quienes prefieren menos movimiento: se muestra sin animar.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // se anima una sola vez
        }
      },
      // Se dispara cuando el elemento entra ~15% y un poco antes del borde inferior.
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return cloneElement(children, {
    ref,
    className: ["reveal", visible ? "is-visible" : "", children.props.className]
      .filter(Boolean)
      .join(" "),
    style: { ...children.props.style, animationDelay: `${delay}ms` },
  });
}
