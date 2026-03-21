import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./certificado-laboral.css";

function CertificadoLaboral() {

  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);

  const employees = {
    juan: {
      nombre: "Juan Vargas",
      cargo: "Gerente General",
      fechaIngreso: "01 de Enero de 2020",
      salario: "$8.000.000"
    },
    laura: {
      nombre: "Laura Gómez",
      cargo: "Gerente RRHH",
      fechaIngreso: "15 de Marzo de 2021",
      salario: "$6.500.000"
    },
    carlos: {
      nombre: "Carlos Pérez",
      cargo: "Gerente Finanzas",
      fechaIngreso: "10 de Junio de 2019",
      salario: "$7.200.000"
    }
  };

  const generateCertificate = () => {

    if (!selected) {
      alert("Selecciona un empleado");
      return;
    }

    const employee = employees[selected];

    const today = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const certificateText = `
La empresa Formacero S.A.S certifica que el(la) señor(a) ${employee.nombre}
se encuentra vinculado(a) laboralmente con nuestra organización desempeñando
el cargo de ${employee.cargo} desde el ${employee.fechaIngreso} hasta la fecha.

Actualmente devenga un salario mensual de ${employee.salario}.

Este certificado se expide a solicitud del interesado(a) el día ${today}.
`;

    setText(certificateText);
    setVisible(true);

  };

  return (

    <div className="certificado-laboral-principal">

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
        <h1>Generar Certificado Laboral</h1>
        <p>Seleccione un empleado y genere su certificado laboral</p>
      </section>


      {/* SECCIÓN GENERADOR */}
      <section className="seccion-certificado">

        <div className="container">

          <div className="generator-box">

            <select
              value={selected}
              onChange={(e)=>setSelected(e.target.value)}
            >
              <option value="">Seleccionar empleado</option>
              <option value="juan">Juan Vargas</option>
              <option value="laura">Laura Gómez</option>
              <option value="carlos">Carlos Pérez</option>
            </select>

            <button onClick={generateCertificate}>
              Generar
            </button>

            <button onClick={()=>window.print()}>
              Imprimir
            </button>

          </div>


          <div
            className="certificate"
            style={{display: visible ? "block" : "none"}}
          >

            <h2>CERTIFICADO LABORAL</h2>

            <p>{text}</p>

            <div className="firma">
              <p>Cordialmente,</p>
              <strong>Departamento de Recursos Humanos</strong>
              <p>Formacero S.A.S</p>
            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Formacero. Todos los derechos reservados.
      </footer>

    </div>

  );

}

export default CertificadoLaboral;