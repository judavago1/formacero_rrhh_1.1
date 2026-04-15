import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./lista-exempleados.css";

function ListaExempleados() {

  const navigate = useNavigate();

  const [openRow, setOpenRow] = useState(null);
  const [exempleados, setExempleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ TOKEN
  const token = localStorage.getItem("token");

  // 🔥 OBTENER EXEMPLEADOS DESDE BACKEND
  const getExempleados = async () => {
    try {
      const res = await fetchWithAuth("/empleados/exempleados");

      if (!res.ok) {
        const text = await res.text();
        const parsed = text ? JSON.parse(text) : {};
        throw new Error(parsed.message || "Error en la respuesta del servidor");
      }

      const data = await res.json();

      console.log("EXEMPLEADOS BACKEND:", data);

      const formatted = data.map(emp => ({
        id: emp.id,
        nombre: emp.nombre,
        cargo: emp.cargo || "",
        departamento: emp.departamento || "",
        ingreso: emp.fecha_ingreso || emp.fecha_ingreso,
        retiro: emp.fecha_salida || emp.fecha_retiro,
        motivo: emp.razon_despido || emp.motivo
      }));

      setExempleados(formatted);

    } catch (error) {
      console.error("Error cargando exempleados:", error);
      setError(error.message || "Error cargando exempleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    // 🔥 PROTECCIÓN
    if (!token) {
      navigate("/login");
      return;
    }

    getExempleados();

  }, [token, navigate]);

  function toggleReason(index) {
    setOpenRow(openRow === index ? null : index);
  }

  // 🔥 ELIMINAR DEFINITIVO
  const handleDeleteEx = async (id) => {
    const confirmDelete = window.confirm("¿Eliminar definitivamente este exempleado?");
    if (!confirmDelete) return;

    try {
      const res = await fetchWithAuth(`/empleados/exempleados/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      setExempleados(prev => prev.filter(emp => emp.id !== id));

      alert("Exempleado eliminado definitivamente ✅");

    } catch (error) {
      console.error("Error eliminando exempleado:", error);
      alert("Error al eliminar ❌");
    }
  };

  // 🟡 LOADING
  if (loading) {
    return <p style={{ padding: "20px" }}>Cargando exempleados...</p>;
  }

  return (
    <div>
      {error && (
        <div className="page-error">
          <p>{error}</p>
        </div>
      )}

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados..."
          />
        </div>

        <Link to="/dashboard" className="back-btn">
          ← Volver al Panel
        </Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Lista de Exempleados</h1>
        <p>Historial de colaboradores que ya no pertenecen a la organización</p>
      </section>

      {/* TABLA */}
      <section className="table-section">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Fecha Ingreso</th>
              <th>Fecha Retiro</th>
              <th>Motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {exempleados.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No hay exempleados registrados
                </td>
              </tr>
            ) : (
              exempleados.map((emp, index) => (
                <React.Fragment key={emp.id}>
                  <tr className="ex-row">
                    <td>{emp.nombre}</td>
                    <td>{emp.cargo}</td>
                    <td>{emp.departamento || "Sin asignar"}</td>
                    <td>{emp.ingreso?.split("T")[0]}</td>
                    <td>{emp.retiro?.split("T")[0]}</td>

                    <td>
                      <button
                        className="reason-btn"
                        onClick={() => toggleReason(index)}
                      >
                        {openRow === index ? "Ocultar motivo" : "Ver motivo"}
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteEx(emp.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>

                  <tr className={`reason-row ${openRow === index ? "open" : ""}`}>
                    <td colSpan="7">
                      <div className="reason-box">
                        {emp.motivo || "Sin motivo registrado"}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>

        </table>
      </section>

      {/* FOOTER */}
      {error && (
        <div className="page-error-message">
          <p>{error}</p>
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} Formacero
      </footer>

    </div>
  );
}

export default ListaExempleados;