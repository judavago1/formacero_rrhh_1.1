import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./registrar-empleados.css";

function RegistrarEmpleados() {

  const [empleados, setEmpleados] = useState([]);
  const [successAlertMessage, setSuccessAlertMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    cedula: "",
    correo: "",
    cargo: "",
    telefono: "",
    direccion: "",
    salario: "",
    fechaIngreso: "",
    fechaNacimiento: "",
    departamento: "",
    foto: null,
    contactoEmergencia: {
      nombre: "",
      relacion: "",
      telefonoPrincipal: "",
      telefonoAlternativo: "",
      direccion: "",
      ciudad: ""
    }
  });

  const [preview, setPreview] = useState(null);
  const [documentos, setDocumentos] = useState([]);

  function handleChange(e){
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length === 1) {
      setForm({ ...form, [name]: value });
    } else {
      setForm({
        ...form,
        [keys[0]]: {
          ...form[keys[0]],
          [keys[1]]: value
        }
      });
    }
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
        telefono: form.telefono,
        direccion: form.direccion,
        salario: form.salario,
        fechaIngreso: form.fechaIngreso,
        fechaNacimiento: form.fechaNacimiento,
        departamento: form.departamento,
        contactoEmergencia: form.contactoEmergencia
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
        telefono: "",
        direccion: "",
        salario:"",
        fechaIngreso:"",
        fechaNacimiento:"",
        departamento: "",
        foto:null,
        contactoEmergencia: {
          nombre: "",
          relacion: "",
          telefonoPrincipal: "",
          telefonoAlternativo: "",
          direccion: "",
          ciudad: ""
        }
      });

      setPreview(null);
      setDocumentos([]);
      setSuccessAlertMessage("Empleado registrado exitosamente.");
      setShowSuccessAlert(true);

    } catch (error) {
      console.error("Error:", error);
      alert(`❌ Error al registrar empleado: ${error.message || "Revise los datos e intente de nuevo."}`);
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

          {showSuccessAlert && (
            <div className="alert-overlay">
              <div className="alert-modal">
                <h2>Empleado registrado exitosamente</h2>
                <p>{successAlertMessage}</p>
                <button className="alert-btn" onClick={() => setShowSuccessAlert(false)}>
                  Aceptar
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <h3>Información Nuevo Empleado</h3>

            <div className="form-grid">

              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Cédula</label>
                <input type="text" name="cedula" value={form.cedula} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Correo</label>
                <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Cargo (opcional)</label>
                <input type="text" name="cargo" value={form.cargo} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Salario</label>
                <input type="number" name="salario" value={form.salario} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Departamento</label>
                <input type="text" name="departamento" value={form.departamento} onChange={handleChange} required/>
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required />
              </div>

            </div>

            <hr />

            <h3>Contacto de Emergencia</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre Completo del Contacto</label>
                <input type="text" name="contactoEmergencia.nombre" value={form.contactoEmergencia.nombre} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Relación con el Empleado</label>
                <select name="contactoEmergencia.relacion" value={form.contactoEmergencia.relacion} onChange={handleChange} required>
                  <option value="">Seleccionar</option>
                  <option value="padre">Padre</option>
                  <option value="madre">Madre</option>
                  <option value="pareja">Pareja</option>
                  <option value="amigo">Amigo</option>
                  <option value="hermano">Hermano</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Número de Teléfono Principal</label>
                <input type="tel" name="contactoEmergencia.telefonoPrincipal" value={form.contactoEmergencia.telefonoPrincipal} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Número de Teléfono Alternativo (opcional)</label>
                <input type="tel" name="contactoEmergencia.telefonoAlternativo" value={form.contactoEmergencia.telefonoAlternativo} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Dirección de Residencia (opcional)</label>
                <input type="text" name="contactoEmergencia.direccion" value={form.contactoEmergencia.direccion} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Ciudad o Ubicación (opcional)</label>
                <input type="text" name="contactoEmergencia.ciudad" value={form.contactoEmergencia.ciudad} onChange={handleChange} />
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
                  <p>Teléfono: {emp.telefono}</p>
                  <p>Dirección: {emp.direccion}</p>
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