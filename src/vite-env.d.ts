/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dirección pública del sitio; la calcula vite.config.ts al compilar */
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
