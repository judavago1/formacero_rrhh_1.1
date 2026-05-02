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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

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
    if (!token) {
      navigate("/login");
      return;
    }

    getExempleados();
  }, [token, navigate]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  function toggleReason(index) {
    setOpenRow(openRow === index ? null : index);
  }

  // 🔥 ELIMINAR DEFINITIVO
  const handleDeleteEx = (id, nombre) => {
    setDeleteCandidate({ id, nombre });
    setShowConfirmModal(true);
  };

  const confirmDeleteEx = async () => {
    if (!deleteCandidate) return;

    try {
      const res = await fetchWithAuth(`/empleados/exempleados/${deleteCandidate.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      setExempleados(prev => prev.filter(emp => emp.id !== deleteCandidate.id));
      setShowConfirmModal(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error eliminando exempleado:", error);
      alert("Error al eliminar ❌");
    }
  };

  const cancelDeleteEx = () => {
    setShowConfirmModal(false);
    setDeleteCandidate(null);
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
                        onClick={() => handleDeleteEx(emp.id, emp.nombre)}
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

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && deleteCandidate && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <h2>Confirmar Eliminación Definitiva</h2>
            <p>¿Estás seguro de que deseas eliminar definitivamente a <strong>{deleteCandidate.nombre}</strong>? Esta acción no se puede deshacer.</p>
            
            <div className="confirm-actions">
              <button 
                className="confirm-btn cancel" 
                onClick={cancelDeleteEx}
              >
                Cancelar
              </button>
              <button 
                className="confirm-btn confirm" 
                onClick={confirmDeleteEx}
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h2>¡Eliminación Exitosa!</h2>
            <p>El exempleado ha sido eliminado definitivamente.</p>
            <div className="success-actions">
              <button 
                className="success-btn" 
                onClick={() => setShowSuccessModal(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

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