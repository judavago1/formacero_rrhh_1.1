import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../layout.css";
import "./dashboard.css";

function Dashboard() {

  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [cumpleaneros, setCumpleaneros] = useState([]); // 🔥 NUEVO

  // 🔹 OBTENER TOTAL DE EMPLEADOS
  useEffect(() => {
    const getTotal = async () => {
      try {
        const res = await fetch("http://localhost:3001/empleados/count");
        const data = await res.json();

        setTotalEmpleados(data.total);
      } catch (error) {
        console.error("Error obteniendo total de empleados:", error);
      }
    };

    // 🔥 NUEVO: OBTENER CUMPLEAÑOS
    const getCumpleaneros = async () => {
      try {
        const res = await fetch("http://localhost:3001/empleados/cumpleaneros");
        const data = await res.json();

        setCumpleaneros(data);
      } catch (error) {
        console.error("Error obteniendo cumpleaños:", error);
      }
    };

    getTotal();
    getCumpleaneros(); // 🔥 LLAMADO
  }, []);

  return (
    <div className="app-container">

      {/* HEADER */}
      <header className="header">

        <div className="logo">Formacero</div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados, cargos o documentos..."
          />
        </div>

        <div className="user-profile">
          <img src="https://i.pravatar.cc/40" alt="Usuario"/>
          <span>Usuario</span>
        </div>

      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Panel de Gestión de Recursos Humanos</h1>
      </section>

      {/* MENÚ */}
      <nav className="main-menu">

        <Link to="/organizacion" className="menu-btn">Organización</Link>
        <Link to="/informacion-empleados" className="menu-btn">Empleados</Link>
        <Link to="/lista-exempleados" className="menu-btn">Lista Exempleados</Link>
        <Link to="/nomina" className="menu-btn">Nómina</Link>
        <Link to="/registrar-empleados" className="menu-btn">Registro de Empleados</Link>
        <Link to="/certificado-laboral" className="menu-btn">Certificado Laboral</Link>
        <Link to="/vacaciones" className="menu-btn">Vacaciones</Link>
        <Link to="/reportes" className="menu-btn">Reportes</Link>

      </nav>

      {/* CONTENIDO */}
      <main className="dashboard-content">

        <div className="card">
          <h3>Total Empleados</h3>
          <p>{totalEmpleados}</p>
        </div>

        <div className="card">
          <h3>Nuevas Contrataciones</h3>
          <p>8</p>
        </div>

        <div className="card">
          <h3>Vacaciones Activas</h3>
          <p>12</p>
        </div>

        {/* 🔥 TARJETA DINÁMICA */}
        <div className="card">
          <h3>Cumpleaños del Mes</h3>

          <p>{cumpleaneros.length}</p>

          <div style={{ fontSize: "0.85rem", marginTop: "5px" }}>
              {cumpleaneros.length === 0 ? (
              <p>No hay cumpleaños</p>
              ) : (
              cumpleaneros.map((emp) => {
                  const fecha = new Date(emp.fecha_nacimiento);

                  const opciones = { day: "2-digit", month: "long" };
                  const fechaFormateada = fecha.toLocaleDateString("es-CO", opciones);

                  return (
                  <p key={emp.id}>
                      {emp.nombre} - {fechaFormateada}
                  </p>
                  );
              })
              )}
            </div>
        </div>

        <div className="card alert">
          <h3>Alertas Pendientes</h3>
          <p>3</p>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 Formacero RRHH | Política de Privacidad | Soporte
      </footer>

    </div>
  );
}

export default Dashboard;