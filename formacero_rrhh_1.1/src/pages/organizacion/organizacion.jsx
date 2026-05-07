import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./organizacion.css";

// 🔐 IMPORTANTE
import { fetchWithAuth } from "../../utils/api";

function Organizacion() {

  const [empleados, setEmpleados] = useState([]);
  const [search, setSearch] = useState("");

  const filteredEmployees = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (emp.cargo || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.departamento || emp.departamentos?.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {filteredEmployees.length === 0 ? (
          <p style={{ width: "100%", textAlign: "center", color: "#666" }}>
            No se encontraron empleados con ese criterio.
          </p>
        ) : (
          filteredEmployees.map(emp => (
            <Link
              key={emp.id}
              to={`/empleado/${emp.id}`}
              className={`card ${getClase(emp.cargo)}`}
            >
              <img
                src={emp.foto_url || `https://i.pravatar.cc/150?u=${emp.id}`}
                alt={emp.nombre}
              />

              <h3>{emp.nombre}</h3>
              <p>{emp.cargo || "Sin cargo"}</p>

              <span>
                {emp.departamento || emp.departamentos?.nombre || "Sin departamento"}
              </span>
            </Link>
          ))
        )}

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