# Mente en Balance — Página web

Sitio de **Mente en Balance** (Psicología & Yoga) construido con **React + TypeScript + Vite**.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (probado con Node 20).

## Cómo trabajar

```bash
npm install      # instala las dependencias (solo la primera vez)
npm run dev      # levanta el sitio en modo desarrollo (http://localhost:5173)
npm run build    # genera la versión de producción en la carpeta dist/
npm run preview  # previsualiza la versión de producción
```

Con `npm run dev` el navegador se actualiza solo cada vez que guardas un cambio.

## Estructura del proyecto

```
src/
  main.tsx              Punto de entrada de la app
  App.tsx               Rutas de las páginas + layout (header/footer)
  data.ts               ← CONTENIDO editable (textos, servicios, agenda, etc.)
  types.ts              Tipos de TypeScript del contenido
  index.css             Estilos y variables de marca (colores, fuentes)
  components/
    Header.tsx          Barra superior con navegación
    Footer.tsx          Pie de página
    Placeholder.tsx     Marcador para imágenes aún no cargadas
  pages/
    Inicio.tsx          Página de inicio
    Sobre.tsx           Sobre nosotras
    Servicios.tsx       Servicios
    Agenda.tsx          Agenda (con filtros)
    Diario.tsx          Diario / artículos
    Contacto.tsx        Contacto (formulario + newsletter)
public/
  logo.png              Logo del sitio
```

## Dónde hacer cambios frecuentes

- **Textos, servicios, clases y artículos** → `src/data.ts`
- **Colores y fuentes** → variables al inicio de `src/index.css` (`:root`)
- **Estructura de una página** → el archivo correspondiente en `src/pages/`

## Notas

- Las imágenes son marcadores (`Placeholder`). Cuando tengas las fotos,
  reemplázalos por etiquetas `<img>` en el componente correspondiente.
- El prototipo original (`Mente en Balance.dc.html`, `support.js`, `_ds/`) se
  conserva solo como referencia; el sitio real vive en `src/`.
```
