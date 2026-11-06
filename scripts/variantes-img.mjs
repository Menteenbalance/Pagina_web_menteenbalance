// ─────────────────────────────────────────────────────────────
//  VARIANTES PEQUEÑAS DE LAS FOTOS ORIGINALES
//  Para cada public/img/<nombre>.webp crea <nombre>-480.webp y
//  <nombre>-800.webp (si la foto es más ancha) y escribe sus anchos en
//  src/lib/anchosImg.ts. Así el navegador del celular descarga la versión
//  justa (srcset) en vez de la foto completa.
//
//  Uso:  npm run variantes   (después de agregar o cambiar una foto en public/img)
// ─────────────────────────────────────────────────────────────

import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const DIR = "public/img";
const ANCHOS = [480, 800];
const VARIANTE = new RegExp(`-(${ANCHOS.join("|")})\\.webp$`);

const originales = (await readdir(DIR)).filter((f) => f.endsWith(".webp") && !VARIANTE.test(f)).sort();
const tabla = {};

for (const archivo of originales) {
  const nombre = archivo.replace(/\.webp$/, "");
  const { width = 0 } = await sharp(join(DIR, archivo)).metadata();
  tabla[nombre] = { ancho: width, variantes: [] };
  for (const w of ANCHOS) {
    if (w >= width) continue;
    await sharp(join(DIR, archivo)).resize({ width: w }).webp({ quality: 74 }).toFile(join(DIR, `${nombre}-${w}.webp`));
    tabla[nombre].variantes.push(w);
  }
  console.log(`${archivo.padEnd(26)} ${width}px → ${tabla[nombre].variantes.join(", ") || "sin variantes"}`);
}

const ts = `// Generado por scripts/variantes-img.mjs (npm run variantes). No editar a mano.
// Ancho de cada foto original de public/img y sus versiones pequeñas.

export const ANCHOS_IMG: Record<string, { ancho: number; variantes: number[] }> = ${JSON.stringify(tabla, null, 2)};
`;
await writeFile("src/lib/anchosImg.ts", ts);
console.log("\nEscrito src/lib/anchosImg.ts");
