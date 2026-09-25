import { lazy, Suspense, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Inicio from "./pages/Inicio";
import Sobre from "./pages/Sobre";
import Servicios from "./pages/Servicios";
import Agenda from "./pages/Agenda";
import Diario from "./pages/Diario";
import Contacto from "./pages/Contacto";
import NoEncontrada from "./pages/NoEncontrada";
import DiarioPost from "./pages/DiarioPost";
import { ContenidoProvider } from "./lib/contenido";

// El panel de administración se descarga solo al entrar a /admin
const AdminApp = lazy(() => import("./admin/AdminApp"));

const MARCA = "Mente en Balance";

// Título de la pestaña del navegador según la página.
const titulos: Record<string, string> = {
  "/": `${MARCA} | Psicología & Yoga en Santiago`,
  "/sobre": `Sobre nosotras | ${MARCA}`,
  "/servicios": `Servicios y aranceles | ${MARCA}`,
  "/agenda": `Agenda de clases y talleres | ${MARCA}`,
  "/diario": `Diario | ${MARCA}`,
  "/contacto": `Contacto | ${MARCA}`,
};

/**
 * Al cambiar de página:
 * - actualiza el título de la pestaña,
 * - si hay un #ancla, baja hasta esa sección; si no, vuelve arriba,
 * - mueve el foco al contenido principal (lectores de pantalla y teclado
 *   “escuchan” el cambio de página, como en un sitio tradicional).
 */
function CambioDePagina({ mainRef }: { mainRef: React.RefObject<HTMLElement> }) {
  const { pathname, hash } = useLocation();
  const primeraCarga = useRef(true);

  useEffect(() => {
    document.title =
      titulos[pathname] ??
      (pathname.startsWith("/diario/") ? `Diario | ${MARCA}` : `Página no encontrada | ${MARCA}`);

    if (hash) {
      // Espera a que la página pinte antes de buscar el ancla
      requestAnimationFrame(() => {
        const destino = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (destino) {
          destino.scrollIntoView();
          destino.focus({ preventScroll: true });
        }
      });
    } else {
      window.scrollTo(0, 0);
      if (!primeraCarga.current) mainRef.current?.focus({ preventScroll: true });
    }
    primeraCarga.current = false;
  }, [pathname, hash, mainRef]);

  return null;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<p className="a-cargando" style={{ padding: 24 }}>Cargando panel…</p>}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <ContenidoProvider>
            <SitioPublico />
          </ContenidoProvider>
        }
      />
    </Routes>
  );
}

function SitioPublico() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <CambioDePagina mainRef={mainRef} />
      <Header />
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/diario/:slug" element={<DiarioPost />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
