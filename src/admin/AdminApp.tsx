// ─────────────────────────────────────────────────────────────
//  PANEL DE ADMINISTRACIÓN (/admin)
//  Se carga por separado del sitio público: quien visita la web
//  no descarga nada de este código.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { Contenido } from "../types";
import { api, ErrorApi, type Seccion } from "./api";
import { marcarCambio } from "../lib/frescura";
import { Avisos, type Aviso } from "./ui";
import Login from "./Login";
import EditorServicios from "./EditorServicios";
import EditorAgenda from "./EditorAgenda";
import EditorDiario from "./EditorDiario";
import EditorInstagram from "./EditorInstagram";
import EditorFotos from "./EditorFotos";
import EditorComunidad from "./EditorComunidad";
import EditorTextos from "./EditorTextos";
import Historial, { type SeccionHistorial } from "./Historial";
import "./admin.css";

type Fase = "cargando" | "login" | "dentro";

export type Guardar = <K extends Seccion>(seccion: K, datos: Contenido[K]) => Promise<boolean>;

const pestañas = [
  { ruta: "servicios", texto: "Servicios" },
  { ruta: "agenda", texto: "Agenda" },
  { ruta: "diario", texto: "Diario" },
  { ruta: "textos", texto: "Textos" },
  { ruta: "instagram", texto: "Instagram" },
  { ruta: "fotos", texto: "Fotos" },
  { ruta: "comunidad", texto: "Comunidad" },
];

/** Secciones guardadas que se pueden deshacer desde cada pestaña. */
const historialPorPestaña: Record<string, SeccionHistorial[]> = {
  servicios: [
    { seccion: "servicios", nombre: "Servicios" },
    { seccion: "aranceles", nombre: "Aranceles" },
  ],
  agenda: [
    { seccion: "agenda", nombre: "Actividades" },
    { seccion: "recurrentes", nombre: "Clases que se repiten" },
  ],
  diario: [{ seccion: "posts", nombre: "Diario" }],
  instagram: [{ seccion: "ajustes", nombre: "Instagram" }],
  fotos: [{ seccion: "fotos", nombre: "Fotos" }],
  textos: [
    { seccion: "textos", nombre: "Textos" },
    { seccion: "formacion", nombre: "Mi formación" },
  ],
  comunidad: [{ seccion: "comunidad", nombre: "Mensajes de la comunidad" }],
};

export default function AdminApp() {
  const [fase, setFase] = useState<Fase>("cargando");
  const [email, setEmail] = useState("");
  const [contenido, setContenido] = useState<Contenido | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [motivoLogin, setMotivoLogin] = useState("");
  // Al restaurar una versión, los editores se vuelven a montar con el contenido nuevo
  const [restauraciones, setRestauraciones] = useState(0);
  const { pathname } = useLocation();
  const pestañaActual = pathname.split("/")[2] ?? "";

  // En el celular, la pestaña activa queda siempre a la vista
  useEffect(() => {
    document.querySelector(".a-tab.is-active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pestañaActual, fase]);

  useEffect(() => {
    document.title = "Panel | Mente en Balance";
    // El panel no debe aparecer en buscadores
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const cargar = useCallback(async () => {
    try {
      setContenido(await api.contenido());
      setFase("dentro");
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) setFase("login");
      else setAviso({ tipo: "error", texto: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    api
      .sesion()
      .then((s) => {
        setEmail(s.email);
        return cargar();
      })
      .catch(() => setFase("login"));
  }, [cargar]);

  const guardar: Guardar = async (seccion, datos) => {
    try {
      const res = await api.guardar(seccion, datos);
      marcarCambio();
      setContenido((c) => (c ? { ...c, [seccion]: res.datos } : c));
      setAviso({
        tipo: "ok",
        texto:
          seccion === "comunidad"
            ? "Mensaje guardado."
            : "Cambios guardados. Se verán en el sitio en menos de un minuto.",
      });
      return true;
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        setMotivoLogin("Tu sesión expiró. Entra de nuevo; tus cambios siguen en pantalla.");
        setFase("login");
      }
      setAviso({ tipo: "error", texto: (err as Error).message });
      return false;
    }
  };

  async function restaurar(seccion: Seccion, fecha: string): Promise<boolean> {
    try {
      const res = await api.restaurar(seccion, fecha);
      marcarCambio();
      setContenido((c) => (c ? { ...c, [seccion]: res.datos } : c));
      setRestauraciones((n) => n + 1);
      setAviso({ tipo: "ok", texto: "Versión restaurada. Si fue un error, puedes deshacerlo desde el mismo historial." });
      return true;
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        setMotivoLogin("Tu sesión expiró. Entra de nuevo.");
        setFase("login");
      }
      setAviso({ tipo: "error", texto: (err as Error).message });
      return false;
    }
  }

  async function salir() {
    await api.salir().catch(() => {});
    setContenido(null);
    setEmail("");
    setMotivoLogin("");
    setFase("login");
  }

  const cerrarAviso = useCallback(() => setAviso(null), []);

  if (fase === "cargando") {
    return (
      <div className="admin admin--centro" aria-busy="true">
        <p className="a-cargando">Cargando panel…</p>
      </div>
    );
  }

  if (fase === "login" || !contenido) {
    return (
      <div className="admin admin--centro">
        <Login
          motivo={motivoLogin}
          onEntrar={async (e) => {
            setEmail(e);
            setFase("cargando");
            await cargar();
          }}
        />
        <Avisos aviso={aviso} onCerrar={cerrarAviso} />
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="a-top">
        <div className="a-top__inner">
          <Link to="/admin" className="a-marca">
            <img src="/logo.svg" alt="" width={28} height={28} />
            <span>
              <span className="a-marca__nombre" translate="no">Mente en Balance</span>
              <span className="a-marca__sub">Panel de administración</span>
            </span>
          </Link>
          <div className="a-top__acciones">
            <span className="a-top__email">{email}</span>
            <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn--ghost">
              Ver sitio
            </a>
            <button type="button" className="a-btn a-btn--ghost" onClick={salir}>
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav className="a-tabs" aria-label="Secciones del panel">
          {pestañas.map((p) => (
            <NavLink
              key={p.ruta}
              to={`/admin/${p.ruta}`}
              className={({ isActive }) => (isActive ? "a-tab is-active" : "a-tab")}
            >
              {p.texto}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="a-main" id="contenido" tabIndex={-1}>
        {historialPorPestaña[pestañaActual] && (
          <div className="a-hist-barra">
            <Historial
              key={pestañaActual}
              secciones={historialPorPestaña[pestañaActual]}
              contenido={contenido}
              onRestaurar={restaurar}
            />
          </div>
        )}
        <Routes key={restauraciones}>
          <Route index element={<Navigate to="servicios" replace />} />
          <Route
            path="servicios"
            element={
              <EditorServicios
                servicios={contenido.servicios}
                aranceles={contenido.aranceles}
                guardar={guardar}
              />
            }
          />
          <Route path="agenda" element={<EditorAgenda agenda={contenido.agenda} recurrentes={contenido.recurrentes ?? []} guardar={guardar} />} />
          <Route path="diario/*" element={<EditorDiario posts={contenido.posts} guardar={guardar} />} />
          <Route
            path="instagram"
            element={<EditorInstagram ajustes={contenido.ajustes} guardar={guardar} />}
          />
          <Route path="fotos" element={<EditorFotos fotos={contenido.fotos ?? {}} guardar={guardar} />} />
          <Route
            path="textos"
            element={<EditorTextos textos={contenido.textos ?? {}} formacion={contenido.formacion ?? []} guardar={guardar} />}
          />
          <Route path="comunidad/*" element={<EditorComunidad mensajes={contenido.comunidad ?? []} guardar={guardar} />} />
          <Route path="*" element={<Navigate to="servicios" replace />} />
        </Routes>
      </main>

      <Avisos aviso={aviso} onCerrar={cerrarAviso} />
    </div>
  );
}
