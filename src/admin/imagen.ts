// Prepara una foto antes de subirla (Diario y pestaña Fotos):
// - lado mayor de máx. 2000 px y ancho de máx. 1600 px,
// - formato WebP (JPEG si el navegador no genera WebP),
// - nunca más de ~3,5 MB, para respetar el límite de subida de Vercel (4,5 MB).
// Una foto de celular (5-12 MB) queda en ~200 KB - 1 MB.

const MAX_ANCHO = 1600;
const MAX_LADO = 2000;
/** Margen bajo el límite del servidor (4 MB) */
const MAX_BYTES = 3.5 * 1024 * 1024;

const ES_HEIC = /\.(heic|heif)$/i;
const EXTENSIONES = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i;

/** Abre la imagen. Primero con createImageBitmap; si falla, con <img>, que en
 *  Safari también abre fotos HEIC del iPhone. */
async function abrir(archivo: File): Promise<{ fuente: CanvasImageSource; ancho: number; alto: number; cerrar: () => void }> {
  try {
    const b = await createImageBitmap(archivo);
    return { fuente: b, ancho: b.width, alto: b.height, cerrar: () => b.close() };
  } catch {
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      if (!img.naturalWidth) throw new Error("vacía");
      return { fuente: img, ancho: img.naturalWidth, alto: img.naturalHeight, cerrar: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      if (ES_HEIC.test(archivo.name) || /hei[cf]/i.test(archivo.type)) {
        throw new Error(
          "Este navegador no abre fotos HEIC del iPhone. Súbela desde el mismo iPhone (se convierte sola), o en el iPhone activa Ajustes > Cámara > Formatos > Más compatible."
        );
      }
      throw new Error("No pudimos abrir esa imagen. Prueba con una foto JPG o PNG.");
    }
  }
}

function aBlob(canvas: HTMLCanvasElement, tipo: string, calidad: number): Promise<Blob | null> {
  return new Promise((ok) => canvas.toBlob(ok, tipo, calidad));
}

export async function comprimirImagen(archivo: File): Promise<Blob> {
  // Algunos celulares y Windows entregan el archivo sin tipo: se mira la extensión
  if (!archivo.type.startsWith("image/") && !EXTENSIONES.test(archivo.name)) {
    throw new Error("El archivo no es una imagen. Usa una foto JPG, PNG o WebP.");
  }
  const { fuente, ancho, alto, cerrar } = await abrir(archivo);
  try {
    let escala = Math.min(1, MAX_ANCHO / ancho, MAX_LADO / Math.max(ancho, alto));
    const canvas = document.createElement("canvas");
    // Hasta 4 intentos: si queda muy pesada, baja la calidad y luego el tamaño
    for (const calidad of [0.82, 0.72, 0.62, 0.55]) {
      canvas.width = Math.max(1, Math.round(ancho * escala));
      canvas.height = Math.max(1, Math.round(alto * escala));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo procesar la imagen.");
      ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);

      let blob = await aBlob(canvas, "image/webp", calidad);
      // Safari antiguo no genera WebP: usa JPEG
      if (!blob || blob.type !== "image/webp") blob = await aBlob(canvas, "image/jpeg", calidad + 0.03);
      if (!blob) throw new Error("No se pudo procesar la imagen.");
      if (blob.size <= MAX_BYTES) return blob;
      escala *= 0.8;
    }
    throw new Error("La foto es demasiado pesada incluso después de optimizarla. Prueba con otra.");
  } finally {
    cerrar();
  }
}
