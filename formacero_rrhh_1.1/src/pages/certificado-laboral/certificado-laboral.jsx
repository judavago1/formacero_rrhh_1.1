import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./certificado-laboral.css";

function CertificadoLaboral() {

  const navigate = useNavigate();

  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Obtener usuario logueado
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) throw new Error("No hay sesión");
      setUser(storedUser);
    } catch {
      setError("No hay usuario logueado");
    }
  }, []);

  // 🔥 VALIDAR TOKEN
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // 🔹 Auto-seleccionar empleado
  useEffect(() => {
    if (user?.rol === "empleado") {
      setSelected(user.id);
    }
  }, [user]);

  // 🔹 Cargar empleados
  useEffect(() => {

    if (!user) return;

    const fetchData = async () => {
      try {

        let res;

        if (user.rol === "admin") {
          res = await fetchWithAuth("/empleados");
        } else {
          res = await fetchWithAuth(`/empleados/${user.id}`);
        }

        if (!res.ok) {
          throw new Error("Error al cargar empleados");
        }

        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : [data]);

      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los empleados");
      }
    };

    fetchData();

  }, [user, token]);

  // 🔹 Generar certificado
  const generateCertificate = async () => {

    if (!selected) {
      alert("Selecciona un empleado");
      return;
    }

    try {

      setLoading(true);
      setError("");
      setVisible(false);

      const res = await fetchWithAuth(`/empleados/certificado/${selected}`);

      if (!res.ok) {
        throw new Error("Error al generar certificado");
      }

      const employee = await res.json();

      const fechaIngreso = new Date(employee.fecha_ingreso).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      const salario = new Intl.NumberFormat("es-CO").format(employee.salario);

      const today = new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      const certificateText = `
La empresa FORMACERO S.A.S, identificada con NIT 900.000.000-0, certifica que el(la) señor(a) ${employee.nombre}, se encuentra vinculado(a) laboralmente con nuestra organización desempeñando el cargo de ${employee.cargo || "No disponible"} desde el ${fechaIngreso} hasta la fecha.

Actualmente devenga un salario mensual de $${salario}.

La presente certificación se expide a solicitud del interesado(a) el día ${today}, en la ciudad de Bogotá D.C., para los fines que estime convenientes.
`;

      setText(certificateText);
      setVisible(true);

    } catch (err) {
      console.error(err);
      setError("No se pudo generar el certificado");
    } finally {
      setLoading(false);
    }

  };

  // 🔹 Estados de error
  if (error) {
    return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  }

  if (!user) {
    return <p style={{ padding: "20px" }}>Cargando usuario...</p>;
  }

  return (

    <div className="certificado-laboral-principal">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <div className="search-bar">
          <input placeholder="Buscar empleados..." />
        </div>
        <Link to="/dashboard" className="back-btn">← Volver al Panel</Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Generar Certificado Laboral</h1>
        <p>Seleccione un empleado</p>
      </section>

      {/* CONTENIDO */}
      <section className="seccion-certificado">

        <div className="container">

          <div className="generator-box">

            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setVisible(false);
              }}
              disabled={user.rol === "empleado"}
            >
              <option value="">Seleccionar empleado</option>

              {employees.length > 0 ? (
                employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))
              ) : (
                <option disabled>No hay empleados</option>
              )}

            </select>

            <button onClick={generateCertificate} disabled={loading}>
              {loading ? "Generando..." : "Generar"}
            </button>

            <button onClick={() => window.print()} disabled={!visible}>
              Imprimir
            </button>

          </div>

          {/* CERTIFICADO PROFESIONAL */}
          <div
            className="certificate"
            style={{ display: visible ? "block" : "none" }}
          >

            <div className="cert-header">
              <h2>FORMACERO S.A.S</h2>
              <p>NIT: 900.000.000-0</p>
              <p>Bogotá D.C. - Colombia</p>
            </div>

            <h2 className="cert-title">CERTIFICACIÓN LABORAL</h2>

            <p className="cert-city-date">
              Bogotá D.C., {new Date().toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </p>

            <p style={{ whiteSpace: "pre-line", textAlign: "justify" }}>
              {text}
            </p>

            <div className="firma">

              <p>Atentamente,</p>

              <div className="linea-firma"></div>

              <strong>Departamento de Recursos Humanos</strong>
              <p>Formacero S.A.S</p>

              <div className="sello">
                <p>Sello de la empresa</p>
              </div>

            </div>

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

export default CertificadoLaboral;