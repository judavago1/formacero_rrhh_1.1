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
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseData, setResponseData] = useState({ comentario: '', archivo: null });

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

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "reportes") {
      setActiveSection("reportes");
    }
  }, [searchParams]);

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
        alert("Respuesta enviada correctamente");
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

              <div>
                <h2>{empleado.nombre}</h2>
                <p>{empleado.cargo}</p>
              </div>
            </div>

            <div className="info-grid">

              <p><strong>Cédula:</strong> {empleado.documento}</p>
              <p><strong>Correo:</strong> {empleado.correo}</p>
              <p><strong>Departamento:</strong> {empleado.departamento || "Sin asignar"}</p>
              <p><strong>Salario:</strong> ${empleado.salario}</p>

              <p><strong>Ingreso:</strong> {formatFecha(empleado.fecha_ingreso)}</p>
              <p><strong>Nacimiento:</strong> {formatFecha(empleado.fecha_nacimiento)}</p>

              <p>
                <strong>Estado:</strong>{" "}
                <span className={empleado.estado === "activo" ? "active" : "inactive"}>
                  {empleado.estado}
                </span>
              </p>

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

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Formacero
      </footer>

    </div>
  );
}

export default EmpleadoDetalle;