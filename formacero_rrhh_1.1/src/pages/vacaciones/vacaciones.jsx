import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./vacaciones.css";

function Vacaciones() {

  const [empleados,setEmpleados] = useState([]);
  const [search,setSearch] = useState("");
  const [empleadoSeleccionado,setEmpleadoSeleccionado] = useState(null);
  const [diasSolicitados,setDiasSolicitados] = useState("");

  const empleadosFiltrados = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (emp.cargo || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.correo || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.documento || "").toLowerCase().includes(search.toLowerCase())
  );
  const [resultado,setResultado] = useState("");

  // 🔐 TRAER EMPLEADOS DESDE BACKEND
  useEffect(() => {
    async function cargarEmpleados(){
      try {

        const token = localStorage.getItem("token");

        const res = await fetchWithAuth("/empleados");

        const data = await res.json();

        if(!res.ok){
          throw new Error(data.message || "Error al cargar empleados");
        }

        setEmpleados(data);

      } catch (error) {
        console.error(error);
      }
    }

    cargarEmpleados();
  }, []);

  function seleccionarEmpleado(nombre){
    const emp = empleados.find(e => e.nombre === nombre);
    setEmpleadoSeleccionado(emp);
    setResultado("");
  }

  async function calcularVacaciones(){

    if(!empleadoSeleccionado){
      setResultado("Seleccione un empleado primero");
      return;
    }

    const fechaIngreso = new Date(empleadoSeleccionado.ingreso);
    const hoy = new Date();

    const años = hoy.getFullYear() - fechaIngreso.getFullYear();

    const diasTotales = años * 15;

    const disponibles = diasTotales - (empleadoSeleccionado.usados || 0);

    // 🔐 ENVÍO AL BACKEND
    try {

      const token = localStorage.getItem("token");

      const res = await fetchWithAuth("/vacaciones", {
        method: "POST",
        body: JSON.stringify({
          empleado: empleadoSeleccionado.nombre,
          diasSolicitados
        })
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.message || "Error al solicitar vacaciones");
      }

      if(diasSolicitados <= disponibles){
        setResultado("✅ Solicitud enviada correctamente");
      } else {
        setResultado("❌ No tiene suficientes días disponibles");
      }

    } catch (error) {
      console.error(error);
      setResultado("❌ Error al conectar con el servidor");
    }

  }

  return (

    <div className="vacaciones-principal">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados, cargos o documentos..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>
        <Link to="/dashboard" className="back-btn">← Volver al Panel</Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Gestión de Vacaciones</h1>
        <p>Seleccione un empleado y gestione sus días de vacaciones</p>
      </section>

      {/* SECCIÓN VACACIONES */}
      <section className="seccion-vacaciones">

        <div className="contenedor-vacaciones">

          <label>Empleado:</label>

          <select onChange={(e)=>seleccionarEmpleado(e.target.value)}>

            <option value="">-- Seleccione --</option>

            {empleadosFiltrados.length > 0 ? (
              empleadosFiltrados.map((emp,i)=>(
                <option key={i} value={emp.nombre}>
                  {emp.nombre}
                </option>
              ))
            ) : (
              <option disabled>No hay empleados</option>
            )}

          </select>

          {empleadoSeleccionado && (

            <div className="info-box">

              <p>
                <strong>Fecha ingreso:</strong> {empleadoSeleccionado.ingreso}
              </p>

              <p>
                <strong>Días usados:</strong> {empleadoSeleccionado.usados || 0}
              </p>

            </div>

          )}

          <label>Días a solicitar:</label>

          <input
            type="number"
            placeholder="Ej: 5"
            value={diasSolicitados}
            onChange={(e)=>setDiasSolicitados(e.target.value)}
          />

          <button onClick={calcularVacaciones}>
            Solicitar Vacaciones
          </button>

          <div className="resultado">
            {resultado}
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

export default Vacaciones;