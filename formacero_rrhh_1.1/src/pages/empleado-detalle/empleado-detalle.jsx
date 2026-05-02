import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "../../layout.css";
import "./empleado-detalle.css";

function EmpleadoDetalle() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [empleado, setEmpleado] = useState(null);
  const [activeSection, setActiveSection] = useState("info");
  const [showContactoEmergencia, setShowContactoEmergencia] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseData, setResponseData] = useState({ comentario: '', archivo: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ nombre: '', telefono: '', direccion: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentEmployeeId = currentUser?.empleado_id ?? currentUser?.id;
  const allowedUserRoles = ["user", "empleado", "usuario"];
  const isUserRole = allowedUserRoles.includes(currentUser?.rol);
  const canViewAssignedReports = isUserRole && String(id) === String(currentEmployeeId);

  // ✅ TOKEN
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const allowedEmployeeId = String(user?.empleado_id || user?.id || "");

  const fetchReportes = async () => {
    if (!canViewAssignedReports) return;
    setLoadingReportes(true);
    try {
      const res = await fetchWithAuth("/reportes");
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setReportes([]);
        return;
      }

      const filtered = data.filter((reporte) => String(reporte.empleado_id) === String(currentEmployeeId));
      setReportes(filtered);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      setReportes([]);
    } finally {
      setLoadingReportes(false);
    }
  };

  useEffect(() => {

    // 🔥 PROTECCIÓN
    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.rol === "empleado" && String(id) !== allowedEmployeeId) {
      navigate(`/empleado/${allowedEmployeeId}`);
      return;
    }

    const getEmpleado = async () => {
      try {
        const res = await fetchWithAuth(`/empleados/${id}`);

        if (!res.ok) throw new Error("Empleado no encontrado");

        const data = await res.json();
        setEmpleado(data);
        setEditData({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          direccion: data.direccion || ''
        });

      } catch (error) {
        console.error(error);
      }
    };

    const fetchReportes = async () => {
      if (!canViewAssignedReports) return;
      setLoadingReportes(true);
      try {
        const res = await fetchWithAuth("/reportes");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          setReportes([]);
          return;
        }

        const filtered = data.filter((reporte) => String(reporte.empleado_id) === String(currentEmployeeId));
        setReportes(filtered);
      } catch (error) {
        console.error("Error cargando reportes:", error);
        setReportes([]);
      } finally {
        setLoadingReportes(false);
      }
    };

    getEmpleado();
    fetchReportes();

  }, [id, token, navigate, canViewAssignedReports, currentEmployeeId]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessMessage("");
      }, 3000); // Cerrar automáticamente después de 3 segundos
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const confirmarGuardar = () => {
    setShowConfirmModal(true);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`/empleados/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: editData.nombre,
          telefono: editData.telefono,
          direccion: editData.direccion
        })
      });

      if (res.ok) {
        setEmpleado({
          ...empleado,
          nombre: editData.nombre,
          telefono: editData.telefono,
          direccion: editData.direccion
        });
        setIsEditing(false);
        setShowConfirmModal(false);
        setSuccessMessage("Información actualizada correctamente.");
        setShowSuccessModal(true);
      } else {
        alert('Error al actualizar la información');
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-CO");
  };

  async function enviarRespuesta(reporteId) {
    try {
      const formData = new FormData();
      formData.append('respuesta_empleado', responseData.comentario);
      if (responseData.archivo) {
        formData.append('archivo_excusa', responseData.archivo);
      }

      const res = await fetchWithAuth(`/reportes/${reporteId}/responder`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setRespondingTo(null);
        setResponseData({ comentario: '', archivo: null });
        fetchReportes();
        setSuccessMessage("Reporte enviado correctamente, pronto recibirás una respuesta.");
        setShowSuccessModal(true);
      } else {
        alert("Error al enviar la respuesta");
      }
    } catch (error) {
      console.error("Error enviando respuesta:", error);
      alert("Error al enviar la respuesta");
    }
  }

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
        <div className="detalle-wrapper">
          {canViewAssignedReports && (
            <div className="detalle-tabs">
              <button
                type="button"
                className={`tab-btn ${activeSection === "info" ? "active" : ""}`}
                onClick={() => setActiveSection("info")}
              >
                Información
              </button>
              <button
                type="button"
                className={`tab-btn ${activeSection === "reportes" ? "active" : ""}`}
                onClick={() => setActiveSection("reportes")}
              >
                Mis Reportes
              </button>
            </div>
          )}

          {activeSection === "info" && (
            <div className="perfil-card">

            <div className="perfil-header">
              <div className="avatar">
                {empleado.nombre.charAt(0)}
              </div>

              <div className="perfil-info-header">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nombre}
                    onChange={(e) => handleEditChange('nombre', e.target.value)}
                    className="edit-input-nombre"
                  />
                ) : (
                  <h2>{empleado.nombre}</h2>
                )}
                <p>{empleado.cargo}</p>
              </div>
            </div>

            <div className="info-grid">

              <p><strong>Cédula:</strong> {empleado.documento}</p>
              <p><strong>Correo:</strong> {empleado.correo}</p>
              <p><strong>Cargo:</strong> {empleado.cargo || "Sin cargo"}</p>
              <p><strong>Departamento:</strong> {empleado.departamento || "Sin asignar"}</p>
              <p><strong>Salario:</strong> ${empleado.salario}</p>

              <p><strong>Ingreso:</strong> {formatFecha(empleado.fecha_ingreso)}</p>
              <p><strong>Nacimiento:</strong> {formatFecha(empleado.fecha_nacimiento)}</p>

              <p>
                <strong>Teléfono:</strong> {" "}
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.telefono}
                    onChange={(e) => handleEditChange('telefono', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  empleado.telefono || '-'
                )}
              </p>

              <p>
                <strong>Dirección:</strong> {" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.direccion}
                    onChange={(e) => handleEditChange('direccion', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  empleado.direccion || '-'
                )}
              </p>

            </div>

            <div className="edit-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn-editar"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Información
                </button>
              ) : (
                <div className="edit-buttons">
                  <button
                    type="button"
                    className="btn-guardar"
                    onClick={confirmarGuardar}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        nombre: empleado.nombre || '',
                        telefono: empleado.telefono || '',
                        direccion: empleado.direccion || ''
                      });
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="contacto-card">
              <div className="contacto-header">
                <div>
                  <h3>Contacto de Emergencia</h3>
                  <p className="subtitulo">Información confidencial y disponible en caso de emergencia</p>
                </div>
                <button
                  type="button"
                  className="toggle-contacto-btn"
                  onClick={() => setShowContactoEmergencia(!showContactoEmergencia)}
                >
                  {showContactoEmergencia ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {showContactoEmergencia && (
                <div className="contacto-details">
                  {empleado.contactos_emergencia && empleado.contactos_emergencia.length > 0 ? (
                    empleado.contactos_emergencia.map((contacto) => (
                      <div key={contacto.id}>
                        <p><strong>Nombre:</strong> {contacto.nombre}</p>
                        <p><strong>Relación:</strong> {contacto.relacion}</p>
                        <p><strong>Teléfono principal:</strong> {contacto.telefono_principal}</p>
                        <p><strong>Teléfono alternativo:</strong> {contacto.telefono_alternativo || "-"}</p>
                        <p><strong>Dirección:</strong> {contacto.direccion || "-"}</p>
                        <p><strong>Ciudad:</strong> {contacto.ciudad || "-"}</p>
                        <p><strong>Autorización:</strong> {contacto.autorizacion ? "Sí" : "No"}</p>
                      </div>
                    ))
                  ) : (
                    <p>No se encontró información de contacto de emergencia.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {activeSection === "reportes" && canViewAssignedReports && (
          <div className="reportes-panel">
            <h2>Reportes asignados</h2>
            {loadingReportes ? (
              <p className="loading-message">Cargando reportes asignados...</p>
            ) : reportes.length === 0 ? (
              <p className="empty-message">No tienes reportes asignados.</p>
            ) : (
              <div className="reportes-list">
                {reportes.map((reporte) => (
                  <div key={reporte.id} className="reporte-card">
                    <div className="reporte-header">
                      <span>{formatFecha(reporte.fecha)}</span>
                      <span className={`status ${reporte.estado === "resuelto" ? "resuelto" : "pendiente"}`}>
                        {reporte.estado}
                      </span>
                    </div>
                    <p className="reporte-descripcion">{reporte.descripcion}</p>
                    <p><strong>Decisión:</strong> {reporte.decision || "Sin decisión"}</p>
                    
                    {reporte.respuesta_empleado && (
                      <div className="respuesta-empleado">
                        <p><strong>Tu respuesta:</strong> {reporte.respuesta_empleado}</p>
                        {reporte.archivo_excusa && (
                          <p><strong>Archivo adjunto:</strong> {reporte.archivo_excusa}</p>
                        )}
                        {reporte.fecha_respuesta && (
                          <p><small>Respondido el: {formatFecha(reporte.fecha_respuesta)}</small></p>
                        )}
                      </div>
                    )}

                    {!reporte.respuesta_empleado && (
                      <div className="respuesta-actions">
                        {respondingTo === reporte.id ? (
                          <div className="respuesta-form">
                            <textarea
                              placeholder="Escribe tu respuesta o explicación..."
                              value={responseData.comentario}
                              onChange={(e) => setResponseData({...responseData, comentario: e.target.value})}
                              required
                            />
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => setResponseData({...responseData, archivo: e.target.files[0]})}
                            />
                            <div className="form-actions">
                              <button onClick={() => enviarRespuesta(reporte.id)} type="button">Enviar Respuesta</button>
                              <button type="button" onClick={() => setRespondingTo(null)}>Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn-responder" 
                            onClick={() => setRespondingTo(reporte.id)}
                          >
                            Responder
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </section>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">✏️</div>
            <h2>Confirmar Cambios</h2>
            <p>¿Estás seguro de que deseas actualizar la información del empleado?</p>
            
            <div className="confirm-changes-preview">
              {editData.nombre !== empleado.nombre && (
                <p><strong>Nombre:</strong> {empleado.nombre} → {editData.nombre}</p>
              )}
              {editData.telefono !== empleado.telefono && (
                <p><strong>Teléfono:</strong> {empleado.telefono || '-'} → {editData.telefono}</p>
              )}
              {editData.direccion !== empleado.direccion && (
                <p><strong>Dirección:</strong> {empleado.direccion || '-'} → {editData.direccion}</p>
              )}
            </div>

            <div className="confirm-actions">
              <button 
                className="confirm-btn cancel" 
                onClick={() => setShowConfirmModal(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                className="confirm-btn confirm" 
                onClick={guardarCambios}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Confirmar'}
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
            <h2>¡Éxito!</h2>
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
        © {new Date().getFullYear()} Formacero
      </footer>

    </div>
  );
}

export default EmpleadoDetalle;