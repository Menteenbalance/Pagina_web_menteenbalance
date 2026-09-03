import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Inicio from "./pages/Inicio";
import Sobre from "./pages/Sobre";
import Servicios from "./pages/Servicios";
import Agenda from "./pages/Agenda";
import Diario from "./pages/Diario";
import Contacto from "./pages/Contacto";

// Vuelve al inicio de la página cada vez que cambia la ruta,
// tal como hacía el prototipo original.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/contacto" element={<Contacto />} />
          {/* Cualquier ruta desconocida vuelve al inicio */}
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
