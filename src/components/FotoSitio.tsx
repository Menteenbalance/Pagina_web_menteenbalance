import type { ImgHTMLAttributes } from "react";
import { useFoto } from "../lib/contenido";
import type { ClaveFoto } from "../lib/fotos";

/**
 * Foto de un lugar editable del sitio (pestaña Fotos del panel).
 * Usa la foto que subió Mari o la original, con su descripción y su
 * punto de enfoque.
 */
export default function FotoSitio({
  clave,
  decorativa = false,
  style,
  ...resto
}: {
  clave: ClaveFoto;
  /** true = no la leen los lectores de pantalla (alt vacío) */
  decorativa?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">) {
  const foto = useFoto(clave);
  return (
    <img
      {...resto}
      src={foto.src || undefined}
      alt={decorativa ? "" : foto.alt}
      style={foto.posicion ? { ...style, objectPosition: foto.posicion } : style}
      data-cargando={foto.cargando || undefined}
    />
  );
}
