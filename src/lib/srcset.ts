// srcset de las fotos originales de public/img (variantes de 480 y 800 px
// generadas con `npm run variantes`). Las fotos subidas desde el panel ya
// llegan livianas (máx. 1600 px) y se usan tal cual.

import { ANCHOS_IMG } from "./anchosImg";

export function srcsetDe(src: string | undefined): string | undefined {
  const nombre = src?.match(/^\/img\/([\w-]+)\.webp$/)?.[1];
  const datos = nombre ? ANCHOS_IMG[nombre] : undefined;
  if (!datos || datos.variantes.length === 0) return undefined;
  return [...datos.variantes.map((w) => `/img/${nombre}-${w}.webp ${w}w`), `${src} ${datos.ancho}w`].join(", ");
}
