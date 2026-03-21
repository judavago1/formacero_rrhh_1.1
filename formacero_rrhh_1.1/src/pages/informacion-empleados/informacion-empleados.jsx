import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./informacion-empleados.css";

function InformacionEmpleados() {

  const [search, setSearch] = useState("");
  const [openRow, setOpenRow] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 OBTENER EMPLEADOS DESDE BACKEND
  const getEmployees = async () => {
    try {
      const res = await fetch("http://localhost:3001/empleados");
      const data = await res.json();

      console.log("DATA BACKEND:", data);

      const formatted = data.map(emp => ({
        id: emp.id,
        nombre: emp.nombre,
        cargo: emp.cargo,
        departamento: emp.departamento,
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
    getEmployees();
  }, []);

  // 🔍 FILTRO (🔥 ESTO SOLUCIONA EL CRASH)
  const filteredEmployees = employees.filter(emp =>
    emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    emp.cargo.toLowerCase().includes(search.toLowerCase()) ||
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
      await fetch(`http://localhost:3001/empleados/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: newName || employee.nombre,
          cargo: newPosition || employee.cargo,
          departamento: newDepartment || employee.departamento
        })
      });

      getEmployees();
    } catch (error) {
      console.error("Error editando:", error);
    }
  }

  // ❌ ELIMINAR EMPLEADO
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este empleado?");
    if (!confirmDelete) return;

    let motivo = prompt("Ingresa el motivo de la eliminación:");

    if (!motivo || motivo.trim() === "") {
      alert("El motivo es obligatorio ❌");
      return;
    }

    try {
      await fetch(`http://localhost:3001/empleados/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo }),
      });

      alert("Empleado eliminado correctamente ✅");

      // 🔥 FIX AQUÍ
      setEmployees((prev) => prev.filter(emp => emp.id !== id));

    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar ❌");
    }
  };

  // 🟡 LOADING (evita pantalla blanca)
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
                  // 🔴 MENSAJE CUANDO NO HAY EMPLEADOS
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      No hay empleados registrados
                    </td>
                  </tr>
                ) : (
                  // 🟢 LISTA NORMAL
                  filteredEmployees.map((emp, index) => (
                    <React.Fragment key={emp.id}>
                      <tr className="employee-row">
                        <td className="name">{emp.nombre}</td>
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
                          <button onClick={() => handleDelete(emp.id)} className="delete-btn">
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