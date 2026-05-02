import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./reportes.css";

function Reportes() {

  const [reportes, setReportes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({ empleado_id: '', descripcion: '', fecha: '' });
  const [activeTab, setActiveTab] = useState("formulario");
  const [editingReport, setEditingReport] = useState(null);
  const [editDecision, setEditDecision] = useState("");
  const [editEstado, setEditEstado] = useState("pendiente");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // 🔐 OBTENER REPORTES DESDE BACKEND
  useEffect(() => {
    cargarEmpleados();
    fetchReportes();

    const tabParam = searchParams.get("tab");
    if (tabParam === "reportes") {
      setActiveTab("reportes");
    }
  }, [searchParams]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  async function fetchReportes() {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/reportes");
      const data = await res.json();
      console.log("Reportes obtenidos:", data);
      if (!res.ok) {
        setReportes([]);
        return;
      }
      const reportesData = Array.isArray(data) ? data : [];
      
      // Cargar empleados para mapear nombres
      const resEmp = await fetchWithAuth("/empleados");
      const empleadosData = await resEmp.json();
      const empleadosMap = {};
      if (Array.isArray(empleadosData)) {
        empleadosData.forEach(emp => empleadosMap[emp.id] = emp.nombre);
      }
      
      // Mapear nombres
      const reportesConNombre = reportesData.map(rep => ({
        ...rep,
        empleado: empleadosMap[rep.empleado_id] || "Empleado desconocido"
      }));
      
      setReportes(reportesConNombre);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  }

  async function cargarEmpleados(){
    try {
      const res = await fetchWithAuth("/empleados");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setEmpleados(data); else setEmpleados([]);
    } catch (error) {
      console.error(error);
      setEmpleados([]);
    }
  }

  async function cambiarEstado(id) {
    try {
      const reporteActual = reportes.find(rep => rep.id === id);
      if (!reporteActual) return;

      const nuevoEstado = reporteActual.estado === "resuelto" ? "pendiente" : "resuelto";
      const res = await fetchWithAuth(`/reportes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado, decision: reporteActual.decision || "" })
      });

      if (!res.ok) {
        throw new Error("Error al actualizar estado");
      }

      fetchReportes();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateReporte(e) {
    e.preventDefault();
    try {
      let successText = "Reporte generado exitosamente.";

      if (formData.empleado_id === "todos") {
        if (!empleados.length) {
          throw new Error("No hay empleados disponibles para enviar el reporte.");
        }

        const createPromises = empleados.map(emp => {
          const payload = {
            empleado_id: Number(emp.id),
            descripcion: formData.descripcion,
            fecha: formData.fecha
          };
          return fetchWithAuth("/reportes", {
            method: "POST",
            body: JSON.stringify(payload)
          });
        });

        const responses = await Promise.all(createPromises);
        const allOk = responses.every(res => res.ok);
        if (!allOk) {
          throw new Error("No se pudo enviar el reporte a todos los empleados.");
        }

        successText = "Reporte generado exitosamente para todos los empleados.";
      } else {
        const payload = {
          empleado_id: Number(formData.empleado_id),
          descripcion: formData.descripcion,
          fecha: formData.fecha
        };

        const res = await fetchWithAuth("/reportes", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error("Error creando reporte");
        }
      }

      setFormData({ empleado_id: '', descripcion: '', fecha: '' });
      await fetchReportes();
      setActiveTab("reportes");
      setSuccessMessage(successText);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creando reporte:", error);
    }
  }

  function startEdit(reporte) {
    setEditingReport(reporte);
    setEditDecision(reporte.decision || "");
    setEditEstado(reporte.estado || "pendiente");
  }

  async function saveEdit() {
    if (!editingReport) return;
    try {
      const res = await fetchWithAuth(`/reportes/${editingReport.id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: editEstado, decision: editDecision })
      });
      if (res.ok) {
        setEditingReport(null);
        fetchReportes();
      }
    } catch (error) {
      console.error("Error guardando reporte:", error);
    }
  }

  async function deleteReporte(id) {
    const reporte = reportes.find(r => r.id === id);
    if (reporte) {
      setDeleteCandidate(reporte);
      setShowConfirmModal(true);
    }
  }

  const confirmDeleteReporte = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await fetchWithAuth(`/reportes/${deleteCandidate.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchReportes();
        setShowConfirmModal(false);
        setSuccessMessage("El reporte ha sido eliminado correctamente.");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    }
  };

  const cancelDeleteReporte = () => {
    setShowConfirmModal(false);
    setDeleteCandidate(null);
  };

  return (
    <div className="reportes-principal">

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
        <h1>Reportes de Conducta y Accidentes</h1>
        <p>Visualiza y gestiona los reportes registrados por la organización</p>
      </section>

      {/* BOTONES DE NAVEGACIÓN */}
      <section className="tab-buttons">
        <button
          type="button"
          className={`tab-btn ${activeTab === "formulario" ? "active" : ""}`}
          onClick={() => setActiveTab("formulario")}
        >
          Formulario
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "reportes" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("reportes");
            fetchReportes();
          }}
        >
          Reportes Generados
        </button>
      </section>

      {/* CONTENIDO CONDICIONAL */}
      {activeTab === "formulario" && (
        <section className="crear-reporte">
          <h2>Crear Nuevo Reporte</h2>
          <form onSubmit={handleCreateReporte}>
            <select
              value={formData.empleado_id}
              onChange={(e) => setFormData({...formData, empleado_id: e.target.value})}
              required
            >
              <option value="">Seleccionar Empleado</option>
              <option value="todos">Enviar reporte a todos</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
            <textarea
              placeholder="Descripción del reporte"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              required
            />
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              required
            />
            <button type="submit">Crear Reporte</button>
          </form>
        </section>
      )}

      {activeTab === "reportes" && (
        <div className="contenedor-reportes">
          {loading ? (
            <p className="loading-message">Cargando reportes...</p>
          ) : reportes.length === 0 ? (
            <p className="empty-message">No hay reportes generados aún.</p>
          ) : (
            <div className="grid-reportes">
              {reportes.map((rep)=> (
                <div key={rep.id} className="tarjeta">
                  <h3>{rep.empleado}</h3>
                  <div className="fecha">{rep.fecha}</div>
                  <div className="descripcion">{rep.descripcion}</div>
                  <div className="decision"><strong>Decisión:</strong> {rep.decision || "Sin decisión"}</div>
                  
                  {rep.respuesta_empleado ? (
                    <div className="respuesta-empleado">
                      <div className="respuesta-fecha">
                        Respondido el {rep.fecha_respuesta}
                      </div>
                      <div className="respuesta-contenido">
                        {rep.respuesta_empleado}
                      </div>
                      {rep.archivo_excusa && (
                        <a 
                          href={`/api/uploads/${rep.archivo_excusa}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="archivo-excusa"
                        >
                          Ver archivo adjunto
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="sin-respuesta">
                      El empleado aún no ha respondido
                    </div>
                  )}
                  
                  <div className="acciones-reporte">
                    <button
                      className={rep.estado === "resuelto" ? "btn-resuelto" : "btn-pendiente"}
                      onClick={()=>cambiarEstado(rep.id)}
                    >
                      {rep.estado === "resuelto" ? "Resuelto" : "Marcar Resuelto"}
                    </button>
                    <button className="btn-editar" onClick={() => startEdit(rep)}>
                      Editar
                    </button>
                    <button className="btn-eliminar" onClick={() => deleteReporte(rep.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingReport && (
        <div className="edit-modal">
          <div className="edit-content">
            <h3>Editar Reporte</h3>
            <p><strong>Empleado:</strong> {editingReport.empleado}</p>
            <p><strong>Fecha:</strong> {editingReport.fecha}</p>
            <textarea
              value={editDecision}
              onChange={(e) => setEditDecision(e.target.value)}
              placeholder="Decisión del reporte"
            />
            <select
              value={editEstado}
              onChange={(e) => setEditEstado(e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="resuelto">Resuelto</option>
            </select>
            <div className="edit-actions">
              <button onClick={saveEdit} type="button">Guardar</button>
              <button type="button" className="btn-cancel" onClick={() => setEditingReport(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && deleteCandidate && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este reporte de <strong>{deleteCandidate.empleado}</strong>?</p>
            
            <div className="confirm-actions">
              <button 
                className="confirm-btn cancel" 
                onClick={cancelDeleteReporte}
              >
                Cancelar
              </button>
              <button 
                className="confirm-btn confirm" 
                onClick={confirmDeleteReporte}
              >
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
            <h2>¡Operación Exitosa!</h2>
            <p>{successMessage || "La acción se completó correctamente."}</p>
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
      <footer className="footer">
        © {new Date().getFullYear()} Formacero. Todos los derechos reservados.
      </footer>

    </div>
  );
}

export default Reportes;