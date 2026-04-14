import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./reportes.css";

function Reportes() {

  const [reportes,setReportes] = useState([]);

  // 🔐 OBTENER REPORTES DESDE BACKEND
  useEffect(() => {
    async function cargarReportes(){
      try {

        const token = localStorage.getItem("token");

        const res = await fetchWithAuth("/reportes");

        const data = await res.json();

        if(!res.ok){
          throw new Error(data.message || "Error al cargar reportes");
        }

        setReportes(data);

      } catch (error) {
        console.error(error);
      }
    }

    cargarReportes();
  }, []);

  // 🔄 CAMBIAR ESTADO (OPCIONAL BACKEND)
  async function cambiarEstado(id){

    try {

      const token = localStorage.getItem("token");

      const res = await fetchWithAuth(`/reportes/${id}`, {
        method: "PUT"
      });

      if(!res.ok){
        throw new Error("Error al actualizar estado");
      }

      // actualización local (no rompemos tu lógica)
      setReportes(
        reportes.map(rep =>
          rep.id === id
            ? {...rep, estado: rep.estado === "resuelto" ? "pendiente" : "resuelto"}
            : rep
        )
      );

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="reportes-principal">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados, cargos o documentos..."
          />
        </div>
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