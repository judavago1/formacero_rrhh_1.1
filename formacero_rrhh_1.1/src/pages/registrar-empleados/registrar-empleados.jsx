import React, { useState } from "react";
import "./registrar-empleados.css";

function RegistrarEmpleados() {

const [empleados,setEmpleados] = useState([]);

const [form,setForm] = useState({
nombre:"",
cedula:"",
correo:"",
cargo:"",
salario:"",
fechaIngreso:"",
foto:null
});

const [preview,setPreview] = useState(null);
const [documentos,setDocumentos] = useState([]);

function handleChange(e){
setForm({
...form,
[e.target.id]:e.target.value
});
}

function handleFoto(e){

const file = e.target.files[0];

if(file){
setForm({...form,foto:file});

const reader = new FileReader();

reader.onload = () =>{
setPreview(reader.result);
};

reader.readAsDataURL(file);
}
}

function handleDocs(e){
setDocumentos([...e.target.files]);
}

function handleSubmit(e){

e.preventDefault();

const nuevoEmpleado = {
...form,
preview,
documentos
};

setEmpleados([...empleados,nuevoEmpleado]);

setForm({
nombre:"",
cedula:"",
correo:"",
cargo:"",
salario:"",
fechaIngreso:"",
foto:null
});

setPreview(null);
setDocumentos([]);

}

return (

<div className="container">

<h1>Registro de Empleado</h1>

<form onSubmit={handleSubmit}>

<div className="form-grid">

<div className="form-group">
<label>Nombre Completo</label>
<input type="text" id="nombre" value={form.nombre} onChange={handleChange} required/>
</div>

<div className="form-group">
<label>Cédula</label>
<input type="text" id="cedula" value={form.cedula} onChange={handleChange} required/>
</div>

<div className="form-group">
<label>Correo</label>
<input type="email" id="correo" value={form.correo} onChange={handleChange} required/>
</div>

<div className="form-group">
<label>Cargo</label>
<input type="text" id="cargo" value={form.cargo} onChange={handleChange} required/>
</div>

<div className="form-group">
<label>Salario</label>
<input type="number" id="salario" value={form.salario} onChange={handleChange} required/>
</div>

<div className="form-group">
<label>Fecha de Ingreso</label>
<input type="date" id="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} required/>
</div>

</div>


<div className="form-group">

<label>Foto del Empleado</label>

<input type="file" accept="image/*" onChange={handleFoto}/>

{preview && (
<img src={preview} className="preview-img" alt="preview"/>
)}

</div>


<div className="form-group">

<label>Documentos (PDF, Word, etc)</label>

<input type="file" multiple onChange={handleDocs}/>

<ul>
{documentos.map((doc,i)=>(
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

</div>

</div>

))}

</div>

</div>

);

}

export default RegistrarEmpleados;