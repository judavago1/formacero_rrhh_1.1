import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "../../layout.css";
import "./empleado-detalle.css";

function EmpleadoDetalle() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);

  // ✅ TOKEN
  const token = localStorage.getItem("token");

  useEffect(() => {

    // 🔥 PROTECCIÓN
    if (!token) {
      navigate("/login");
      return;
    }

    const getEmpleado = async () => {
      try {
        const res = await fetchWithAuth(`/empleados/${id}`);

        if (!res.ok) throw new Error("Empleado no encontrado");

        const data = await res.json();
        setEmpleado(data);

      } catch (error) {
        console.error(error);
      }
    };

    getEmpleado();

  }, [id, token, navigate]);

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-CO");
  };

  if (!empleado) {
    return <p style={{ padding: "20px" }}>Cargando empleado...</p>;
  }

  return (
    <div>

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <Link to="/dashboard" className="back-btn">← Volver</Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Perfil del Empleado</h1>
        <p>Información completa del colaborador</p>
      </section>

      {/* CONTENIDO */}
      <section className="detalle-container">

        <div className="perfil-card">

          <div className="perfil-header">
            <div className="avatar">
              {empleado.nombre.charAt(0)}
            </div>

            <div>
              <h2>{empleado.nombre}</h2>
              <p>{empleado.cargo}</p>
            </div>
          </div>

          <div className="info-grid">

            <p><strong>Cédula:</strong> {empleado.documento}</p>
            <p><strong>Correo:</strong> {empleado.correo}</p>
            <p><strong>Departamento:</strong> {empleado.departamento || "Sin asignar"}</p>
            <p><strong>Salario:</strong> ${empleado.salario}</p>

            <p><strong>Ingreso:</strong> {formatFecha(empleado.fecha_ingreso)}</p>
            <p><strong>Nacimiento:</strong> {formatFecha(empleado.fecha_nacimiento)}</p>

            <p>
              <strong>Estado:</strong>{" "}
              <span className={empleado.estado === "activo" ? "active" : "inactive"}>
                {empleado.estado}
              </span>
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Formacero
      </footer>

    </div>
  );
}

export default EmpleadoDetalle;