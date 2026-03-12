import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./reportes.css";

function Reportes() {

  const [reportes,setReportes] = useState([
    {
      id:1,
      empleado:"Juan Pérez",
      fecha:"12 Marzo 2026",
      descripcion:"Llegó tarde al turno de la mañana.",
      decision:"Advertencia verbal",
      estado:"pendiente"
    },
    {
      id:2,
      empleado:"María Gómez",
      fecha:"10 Marzo 2026",
      descripcion:"Accidente leve en zona de producción.",
      decision:"Se activó protocolo de seguridad.",
      estado:"resuelto"
    },
    {
      id:3,
      empleado:"Carlos López",
      fecha:"8 Marzo 2026",
      descripcion:"Discusión con compañero de trabajo.",
      decision:"Citación con RRHH",
      estado:"pendiente"
    }
  ]);

  function cambiarEstado(id){
    setReportes(
      reportes.map(rep =>
        rep.id === id
          ? {...rep, estado: rep.estado === "resuelto" ? "pendiente" : "resuelto"}
          : rep
      )
    );
  }

  return (
    <div className="reportes-principal">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <Link to="/dashboard" className="back-btn">← Volver al Panel</Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Reportes de Conducta y Accidentes</h1>
        <p>Visualiza y gestiona los reportes registrados por la organización</p>
      </section>

      {/* CONTENIDO */}
      <div className="contenedor-reportes">
        <div className="grid-reportes">
          {reportes.map((rep)=> (
            <div key={rep.id} className="tarjeta">
              <h3>{rep.empleado}</h3>
              <div className="fecha">{rep.fecha}</div>
              <div className="descripcion">{rep.descripcion}</div>
              <div className="decision"><strong>Decisión:</strong> {rep.decision}</div>
              <div className="estado">
                <button
                  className={rep.estado === "resuelto" ? "btn-resuelto" : "btn-pendiente"}
                  onClick={()=>cambiarEstado(rep.id)}
                >
                  {rep.estado === "resuelto" ? "Resuelto" : "Pendiente"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Formacero. Todos los derechos reservados.
      </footer>

    </div>
  );
}

export default Reportes;