import React from "react";
import { Link } from "react-router-dom";
import "./organizacion.css";

function Organizacion() {
  return (

    <div>

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <Link to="/dashboard" className="back-btn">← Volver al Panel</Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Estructura Organizacional</h1>
        <p>Organigrama general de la compañía</p>
      </section>

      {/* ORGANIGRAMA */}
      <section className="organization">

        {/* NIVEL 1 */}
        <div className="card gerente">
          <img src="https://i.pravatar.cc/150?img=12" alt="" />
          <h3>Juan Vargas</h3>
          <p>Gerente General</p>
          <span>Dirige toda la organización</span>
        </div>

        {/* NIVEL 2 */}
        <div className="card gerente">
          <img src="https://i.pravatar.cc/150?img=32" alt="" />
          <h3>Laura Gómez</h3>
          <p>Gerente RRHH</p>
          <span>Reporta a Gerente General</span>
        </div>

        <div className="card gerente">
          <img src="https://i.pravatar.cc/150?img=45" alt="" />
          <h3>Carlos Pérez</h3>
          <p>Gerente Finanzas</p>
          <span>Reporta a Gerente General</span>
        </div>

        {/* NIVEL 3 */}
        <div className="card admin">
          <img src="https://i.pravatar.cc/150?img=22" alt="" />
          <h3>María Torres</h3>
          <p>Administrativa RRHH</p>
          <span>A cargo del equipo RRHH</span>
        </div>

        <div className="card admin">
          <img src="https://i.pravatar.cc/150?img=28" alt="" />
          <h3>Sofía Ramírez</h3>
          <p>Administrativa Finanzas</p>
          <span>A cargo del equipo Finanzas</span>
        </div>

        {/* NIVEL 4 */}
        <div className="card empleado">
          <img src="https://i.pravatar.cc/150?img=8" alt="" />
          <h3>Andrés López</h3>
          <p>Empleado RRHH</p>
          <span>Reporta a María Torres</span>
        </div>

        <div className="card empleado">
          <img src="https://i.pravatar.cc/150?img=15" alt="" />
          <h3>Camila Díaz</h3>
          <p>Empleado RRHH</p>
          <span>Reporta a María Torres</span>
        </div>

        <div className="card empleado">
          <img src="https://i.pravatar.cc/150?img=51" alt="" />
          <h3>David Castro</h3>
          <p>Empleado Finanzas</p>
          <span>Reporta a Sofía Ramírez</span>
        </div>

        <div className="card empleado">
          <img src="https://i.pravatar.cc/150?img=60" alt="" />
          <h3>Valentina Ruiz</h3>
          <p>Empleado Finanzas</p>
          <span>Reporta a Sofía Ramírez</span>
        </div>

      </section>

    </div>

  );
}

export default Organizacion;