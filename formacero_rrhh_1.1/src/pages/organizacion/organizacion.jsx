import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./organizacion.css";

// 🔐 IMPORTANTE
import { fetchWithAuth } from "../../utils/api";

function Organizacion() {

  const [empleados, setEmpleados] = useState([]);

  // 🔥 TRAER DATOS CON TOKEN
  useEffect(() => {
    const getOrganizacion = async () => {
      try {
        const res = await fetchWithAuth("/empleados");

        if (!res.ok) throw new Error("Error al cargar organización");

        const data = await res.json();
        setEmpleados(data);

      } catch (error) {
        console.error(error);
      }
    };

    getOrganizacion();
  }, []);

  return (
    <div>

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados, cargos o documentos..."
          />
        </div>

        <Link to="/dashboard" className="back-btn">
          ← Volver al Panel
        </Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Estructura Organizacional</h1>
        <p>Organigrama general de la compañía</p>
      </section>

      {/* ORGANIGRAMA DINÁMICO */}
      <section className="organization">

        {empleados.map(emp => (
          <div key={emp.id} className={`card ${getClase(emp.cargo)}`}>

            <img
              src={`https://i.pravatar.cc/150?u=${emp.id}`}
              alt=""
            />

            <h3>{emp.nombre}</h3>
            <p>{emp.cargo || "Sin cargo"}</p>

            <span>
              {emp.departamento || emp.departamentos?.nombre || "Sin departamento"}
            </span>

          </div>
        ))}

      </section>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Formacero
      </footer>

    </div>
  );
}

/* 🔥 FUNCIÓN PARA CLASES DINÁMICAS */
function getClase(cargo) {
  if (!cargo) return "empleado";

  const c = cargo.toLowerCase();

  if (c.includes("gerente")) return "gerente";
  if (c.includes("admin")) return "admin";

  return "empleado";
}

export default Organizacion;