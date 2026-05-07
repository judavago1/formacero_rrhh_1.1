import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./nomina.css";
import html2pdf from "html2pdf.js";

// 🔐 IMPORTANTE
import { fetchWithAuth } from "../../utils/api";

function Nomina() {

  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [dias, setDias] = useState("");
  const [desprendible, setDesprendible] = useState("");

  const desprendibleRef = useRef();

  // 🔥 TRAER EMPLEADOS DEL BACKEND
  useEffect(() => {
    const getEmpleados = async () => {
      try {
        const res = await fetchWithAuth("/empleados");

        if (!res.ok) throw new Error("Error al cargar empleados");

        const data = await res.json();
        setEmpleados(data);

      } catch (error) {
        console.error(error);
      }
    };

    getEmpleados();
  }, []);

  // 🔥 CUANDO SELECCIONA EMPLEADO
  const handleEmpleadoChange = (id) => {
    const emp = empleados.find(e => e.id === parseInt(id));
    setEmpleadoSeleccionado(emp);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    const query = value.trim();
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const encoded = encodeURIComponent(query);
      const res = await fetchWithAuth(`/empleados/search?q=${encoded}`);
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error buscando empleados:", error);
      setResults([]);
      setShowDropdown(false);
    }
  };

  function generarDesprendible() {

    if (!empleadoSeleccionado || !dias) {
      alert("Completa todos los campos");
      return;
    }

    const salario = empleadoSeleccionado.salario;
    const salarioDia = salario / 30;
    const total = salarioDia * dias;

    const texto = `
Empresa: Formacero S.A.S

Empleado: ${empleadoSeleccionado.nombre}

Cargo: ${empleadoSeleccionado.cargo}

Salario Base: $${salario.toLocaleString()}

Días trabajados: ${dias}

Total a pagar: $${total.toLocaleString()}

Fecha de generación: ${new Date().toLocaleDateString()}
`;

    setDesprendible(texto);
  }

  function descargarPDF() {
    if (!desprendible) {
      alert("Primero genera el desprendible");
      return;
    }

    const element = desprendibleRef.current;

    html2pdf()
      .set({
        margin: 10,
        filename: "desprendible_nomina.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(element)
      .save();
  }

  return (
    <div className="contenedor-nomina-principal">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados por nombre, correo o cédula..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map(emp => (
                <div
                  key={emp.id}
                  className="search-item"
                  onMouseDown={() => navigate(`/empleado/${emp.id}`)}
                >
                  <img
                    src={emp.foto_url || `https://i.pravatar.cc/40?u=${emp.id}`}
                    alt={emp.nombre}
                  />
                  <div className="search-item-info">
                    <strong>{emp.nombre}</strong>
                    <p>{emp.correo || emp.documento || emp.cargo || "Empleado"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link to="/dashboard" className="back-btn">
          ← Volver al Panel
        </Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Generar Desprendible de Pago</h1>
        <p>Gestión de nómina y generación de desprendibles</p>
      </section>

      {/* FORMULARIO */}
      <section className="seccion-formulario-nomina">

        <div className="contenedor-nomina">

          <label>Seleccionar empleado:</label>
          <select onChange={(e) => handleEmpleadoChange(e.target.value)}>
            <option value="">-- Seleccione --</option>
            {empleados.length > 0 ? (
              empleados.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} - {emp.cargo}
                </option>
              ))
            ) : (
              <option disabled>No hay empleados</option>
            )}
          </select>

          <label>Salario Base:</label>
          <input
            type="text"
            value={
              empleadoSeleccionado
                ? `$${empleadoSeleccionado.salario.toLocaleString()}`
                : ""
            }
            disabled
          />

          <label>Días trabajados:</label>
          <input
            type="number"
            placeholder="Ej: 30"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
          />

          <button onClick={generarDesprendible}>
            Generar
          </button>

          <button onClick={descargarPDF}>
            Descargar PDF
          </button>

          <div
            id="desprendible"
            className="desprendible"
            ref={desprendibleRef}
          >
            <pre>{desprendible}</pre>
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

export default Nomina;