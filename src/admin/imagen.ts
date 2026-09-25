// Reduce una foto antes de subirla: máx. 1600 px de ancho, formato WebP.
// Una foto de celular (5-10 MB) queda en ~200-400 KB, carga rápido en
// la web y respeta el límite de subida de Vercel.

const MAX_ANCHO = 1600;

export async function comprimirImagen(archivo: File): Promise<Blob> {
  if (!archivo.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen.");
  }
  const bitmap = await createImageBitmap(archivo).catch(() => {
    throw new Error("No pudimos leer esa imagen. Prueba con JPG o PNG.");
  });
  const escala = Math.min(1, MAX_ANCHO / bitmap.width);
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((ok) =>
    canvas.toBlob(ok, "image/webp", 0.82)
  );
  // Safari antiguo no genera WebP: usa JPEG
  if (blob && blob.type === "image/webp") return blob;
  return new Promise<Blob>((ok, falla) =>
    canvas.toBlob((b) => (b ? ok(b) : falla(new Error("No se pudo procesar la imagen."))), "image/jpeg", 0.85)
  );
}
