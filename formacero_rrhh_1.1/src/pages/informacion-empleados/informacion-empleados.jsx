import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./informacion-empleados.css";

function InformacionEmpleados() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [openRow, setOpenRow] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ✅ TOKEN
  const token = localStorage.getItem("token");

  // 🔹 OBTENER EMPLEADOS DESDE BACKEND
  const getEmployees = async () => {
    try {
      const res = await fetchWithAuth("/empleados");

      const data = await res.json();

      console.log("DATA BACKEND:", data);

      const formatted = data.map(emp => ({
        id: emp.id,
        nombre: emp.nombre,
        cargo: emp.cargo || "",
        departamento: emp.departamento || emp.departamentos?.nombre || "",
        estado: emp.estado || "activo",
        documentos: [
          "📄 Contrato Laboral.pdf",
          "📄 Hoja de Vida.pdf",
          "📄 Evaluación 2025.pdf"
        ]
      }));

      setEmployees(formatted);
    } catch (error) {
      console.error("Error cargando empleados:", error);
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

    getEmployees();

  }, [token, navigate]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/lista-exempleados");
      }, 3000); // Cerrar automáticamente después de 3 segundos y navegar
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigate]);

  // 🔍 FILTRO
  const filteredEmployees = employees.filter(emp =>
    emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (emp.cargo || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.departamento || "").toLowerCase().includes(search.toLowerCase())
  );

  // 🔽 Mostrar/ocultar documentos
  function toggleDocuments(index) {
    setOpenRow(openRow === index ? null : index);
  }

  // ✏️ EDITAR EMPLEADO
  async function editEmployee(index) {
    const employee = employees[index];

    const newName = prompt("Editar nombre:", employee.nombre);
    const newPosition = prompt("Editar cargo:", employee.cargo);
    const newDepartment = prompt("Editar departamento:", employee.departamento);

    try {
      await fetchWithAuth(`/empleados/${employee.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: newName || employee.nombre,
          departamento: newDepartment || employee.departamento
        })
      });

      getEmployees();
    } catch (error) {
      console.error("Error editando:", error);
    }
  }

  // ❌ ELIMINAR EMPLEADO
  const handleDelete = (id, nombre) => {
    setDeleteCandidate({ id, nombre });
    setDeleteReason("");
    setDeleteError("");
  };

  const cancelDelete = () => {
    setDeleteCandidate(null);
    setDeleteReason("");
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    if (!deleteReason.trim()) {
      setDeleteError("El motivo es obligatorio para eliminar");
      return;
    }

    try {
      const res = await fetchWithAuth(`/empleados/${deleteCandidate.id}`, {
        method: "DELETE",
        body: JSON.stringify({ motivo: deleteReason.trim() })
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.warn("Delete response no es JSON:", parseError, text);
      }

      console.log('Delete response:', res.status, data);

      if (!res.ok) {
        throw new Error(data.message || text || "Error al eliminar empleado");
      }

      await getEmployees();
      cancelDelete();
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error eliminando:", error);
      setDeleteError(error.message || "Error al eliminar ❌");
    }
  };

  // 🟡 LOADING
  if (loading) {
    return <p style={{ padding: "20px" }}>Cargando empleados...</p>;
  }

  return (
    <div>

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados..."
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
        <h1>Información de Empleados</h1>
        <p>Gestión y consulta del personal activo</p>
      </section>

      {deleteCandidate && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar a <strong>{deleteCandidate.nombre}</strong>? Esta acción requiere un motivo y no se puede deshacer.</p>
            
            <label htmlFor="delete-reason">Motivo de eliminación</label>
            <textarea
              id="delete-reason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Escribe el motivo aquí..."
              rows={4}
            />

            {deleteError && <p className="confirm-error">{deleteError}</p>}

            <div className="confirm-actions">
              <button type="button" className="confirm-btn cancel" onClick={cancelDelete}>
                Cancelar
              </button>
              <button type="button" className="confirm-btn confirm" onClick={confirmDelete}>
                Eliminar
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
            <p>El empleado ha sido eliminado correctamente y movido a la lista de exempleados.</p>
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

      {/* TABLA */}
      <section className="table-section">
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Documentos</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <React.Fragment key={emp.id}>
                  <tr className="employee-row">
                    <td className="name">
                      <Link to={`/empleado/${emp.id}`} className="employee-link">
                        {emp.nombre}
                      </Link>
                    </td>
                    <td className="position">{emp.cargo}</td>

                    <td className="department">
                      {emp.departamento ? emp.departamento : "Sin asignar"}
                    </td>

                    <td>
                      <span className={`status ${emp.estado === "activo" ? "active" : "inactive"}`}>
                        {emp.estado}
                      </span>
                    </td>

                    <td>
                      <button
                        className="doc-btn"
                        onClick={() => toggleDocuments(index)}
                      >
                        {openRow === index ? "Ocultar documentos" : "Ver documentos"}
                      </button>
                    </td>

                    <td className="actions">
                      <button className="edit-btn" onClick={() => editEmployee(index)}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(emp.id, emp.nombre)} className="delete-btn">
                        Eliminar
                      </button>
                    </td>
                  </tr>

                  <tr className={`documents-row ${openRow === index ? "open" : ""}`}>
                    <td colSpan="6">
                      <div className="documents">
                        {emp.documentos.map((doc, i) => (
                          <p key={i}>{doc}</p>
                        ))}
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
      <footer className="footer">
        © {new Date().getFullYear()} Formacero
      </footer>

    </div>
  );
}

export default InformacionEmpleados;