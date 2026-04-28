import React, { useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./registrar-empleados.css";

function RegistrarEmpleados() {

  const [empleados, setEmpleados] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    cedula: "",
    correo: "",
    cargo: "",
    salario: "",
    fechaIngreso: "",
    fechaNacimiento: "",
    departamento: "",
    foto: null
  });

  const [preview, setPreview] = useState(null);
  const [documentos, setDocumentos] = useState([]);

  function handleChange(e){
    setForm({
      ...form,
      [e.target.id]: e.target.value
    });
  }

  function handleFoto(e){
    const file = e.target.files[0];

    if(file){
      setForm({...form, foto:file});

      const reader = new FileReader();

      reader.onload = () => {
        setPreview(reader.result);
      };

      reader.readAsDataURL(file);
    }
  }

  function handleDocs(e){
    setDocumentos([...e.target.files]);
  }

  async function handleSubmit(e){
    e.preventDefault();

    try {

      const nuevoEmpleado = {
        nombre: form.nombre,
        cedula: form.cedula,
        correo: form.correo,
        cargo: form.cargo,
        salario: form.salario,
        fechaIngreso: form.fechaIngreso,
        fechaNacimiento: form.fechaNacimiento,
        departamento: form.departamento
      };

      // 🔐 TOKEN AGREGADO
      const token = localStorage.getItem("token");

      const res = await fetchWithAuth("/empleados", {
        method: "POST",
        body: JSON.stringify(nuevoEmpleado)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar empleado");
      }

      console.log(data);

      const nuevoLocal = {
        ...form,
        preview,
        documentos
      };

      setEmpleados([...empleados, nuevoLocal]);

      setForm({
        nombre:"",
        cedula:"",
        correo:"",
        cargo:"",
        salario:"",
        fechaIngreso:"",
        fechaNacimiento:"",
        departamento: "",
        foto:null
      });

      setPreview(null);
      setDocumentos([]);

      alert(`
✅ Empleado registrado correctamente

🔐 Credenciales de acceso:
Correo: ${data.credenciales?.correo || "N/A"}
Contraseña: ${data.credenciales?.password || "N/A"}
`);

    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al registrar empleado");
    }
  }

  return (

    <div className="registrar-empleados-principal">

      <header className="header">
        <div className="logo">Formacero</div>
        <div className="search-bar">
          <input type="text" placeholder="Buscar empleados..." />
        </div>
        <Link to="/dashboard" className="back-btn">
          ← Volver al Panel
        </Link>
      </header>

      <section className="hero">
        <h1>Registro de Empleados</h1>
        <p>Formulario para registrar y gestionar empleados</p>
      </section>

      <section className="seccion-registrar-empleados">

        <div className="container">

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" id="nombre" value={form.nombre} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Cédula</label>
                <input type="text" id="cedula" value={form.cedula} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Correo</label>
                <input type="email" id="correo" value={form.correo} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Cargo (opcional)</label>
                <input type="text" id="cargo" value={form.cargo} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Salario</label>
                <input type="number" id="salario" value={form.salario} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input type="date" id="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" id="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Departamento</label>
                <input type="text" id="departamento" value={form.departamento} onChange={handleChange} required/>
              </div>

            </div>

            <div className="form-group">
              <label>Foto del Empleado</label>
              <input type="file" accept="image/*" onChange={handleFoto} />

              {preview && (
                <img src={preview} className="preview-img" alt="preview" />
              )}
            </div>

            <div className="form-group">
              <label>Documentos</label>
              <input type="file" multiple onChange={handleDocs} />

              <ul>
                {documentos.map((doc, i) => (
                  <li key={i} className="file-item">{doc.name}</li>
                ))}
              </ul>
            </div>

            <button type="submit" className="btn">
              Registrar Empleado
            </button>

          </form>

          <hr/>

          <h2>Lista de Empleados Registrados</h2>

          <div>
            {empleados.map((emp,i)=>(
              <div key={i} className="employee-card">

                {emp.preview && (
                  <img src={emp.preview} alt="empleado"/>
                )}

                <div className="employee-info">
                  <h3>{emp.nombre}</h3>
                  <p>Cédula: {emp.cedula}</p>
                  <p>Correo: {emp.correo}</p>
                  <p>Cargo: {emp.cargo}</p>
                  <p>Salario: ${emp.salario}</p>
                  <p>Ingreso: {emp.fechaIngreso}</p>
                  <p>Nacimiento: {emp.fechaNacimiento}</p>
                  <p>Departamento: {emp.departamento}</p>
                </div>

              </div>
            ))}
          </div>

        </div>

      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Formacero.
      </footer>

    </div>
  );
}

export default RegistrarEmpleados;