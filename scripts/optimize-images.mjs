// ─────────────────────────────────────────────────────────────
//  OPTIMIZACIÓN DE IMÁGENES
//  Convierte las fotos de public/img a WebP, redimensionadas a un
//  ancho máximo razonable para la web. Mantiene el aspecto visual
//  pero reduce mucho el peso (carga más rápida).
//
//  Uso:  npm run optimize
//
//  Para agregar una imagen nueva: deja el .jpg/.png en public/img,
//  corre este comando y se generará su .webp. Luego puedes borrar
//  el original y apuntar a la versión .webp en src/images.ts.
// ─────────────────────────────────────────────────────────────

import { readdir } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const DIR = "public/img";
const MAX_WIDTH = 1000; // px; suficiente para pantallas retina en estos tamaños
const QUALITY = 76; // calidad WebP (0-100)
const SOURCE_EXT = [".jpg", ".jpeg", ".png"];

const files = await readdir(DIR);
const sources = files.filter((f) => SOURCE_EXT.includes(extname(f).toLowerCase()));

if (sources.length === 0) {
  console.log("No hay imágenes .jpg/.png que optimizar en", DIR);
  process.exit(0);
}

let totalIn = 0;
let totalOut = 0;

for (const file of sources) {
  const input = join(DIR, file);
  const output = join(DIR, `${basename(file, extname(file))}.webp`);

  const image = sharp(input);
  const meta = await image.metadata();

  const info = await image
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);

  const inKB = (meta.size ?? 0) / 1024;
  const outKB = info.size / 1024;
  totalIn += inKB;
  totalOut += outKB;

  console.log(
    `${file.padEnd(26)} ${inKB.toFixed(0).padStart(5)} KB  →  ` +
      `${basename(output).padEnd(26)} ${outKB.toFixed(0).padStart(5)} KB` +
      `  (${meta.width}px → ${Math.min(meta.width ?? 0, MAX_WIDTH)}px)`
  );
}

console.log(
  `\nTotal: ${totalIn.toFixed(0)} KB → ${totalOut.toFixed(0)} KB ` +
    `(${(100 - (totalOut / totalIn) * 100).toFixed(0)}% menos)`
);
