import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./informacion-empleados.css";

function InformacionEmpleados() {

const [search,setSearch] = useState("");
const [openRow,setOpenRow] = useState(null);

const [employees,setEmployees] = useState([
{
nombre:"Juan Vargas",
cargo:"Gerente General",
departamento:"Dirección",
estado:"Activo",
documentos:[
"📄 Contrato Laboral.pdf",
"📄 Hoja de Vida.pdf",
"📄 Evaluación 2025.pdf"
]
}
]);

function toggleDocuments(index){

if(openRow === index){
setOpenRow(null);
}else{
setOpenRow(index);
}

}

function editEmployee(index){

const employee = employees[index];

const newName = prompt("Editar nombre:",employee.nombre);
const newPosition = prompt("Editar cargo:",employee.cargo);
const newDepartment = prompt("Editar departamento:",employee.departamento);

const updated = [...employees];

if(newName) updated[index].nombre = newName;
if(newPosition) updated[index].cargo = newPosition;
if(newDepartment) updated[index].departamento = newDepartment;

setEmployees(updated);

}

function deleteEmployee(index){

if(!window.confirm("¿Seguro que deseas eliminar este empleado?")){
return;
}

const updated = employees.filter((_,i)=> i !== index);
setEmployees(updated);

}

const filteredEmployees = employees.filter(emp =>
`${emp.nombre} ${emp.cargo} ${emp.departamento}`
.toLowerCase()
.includes(search.toLowerCase())
);

return(

<div>

<header className="header">

<div className="logo">Formacero</div>

<Link to="/dashboard" className="back-btn">
← Volver al Panel
</Link>

</header>


<section className="hero">

<h1>Información de Empleados</h1>
<p>Gestión y consulta del personal activo</p>

</section>


<section className="filter-section">

<input
type="text"
placeholder="Buscar por nombre, cargo o departamento..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

</section>


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

{filteredEmployees.map((emp,index)=>(
<React.Fragment key={index}>

<tr className="employee-row">

<td className="name">{emp.nombre}</td>
<td className="position">{emp.cargo}</td>
<td className="department">{emp.departamento}</td>

<td>
<span className="status active">
{emp.estado}
</span>
</td>

<td>

<button
className="doc-btn"
onClick={()=>toggleDocuments(index)}
>

{openRow === index ? "Ocultar documentos" : "Ver documentos"}

</button>

</td>

<td>

<button
className="edit-btn"
onClick={()=>editEmployee(index)}
>
Editar
</button>

<button
className="delete-btn"
onClick={()=>deleteEmployee(index)}
>
Eliminar
</button>

</td>

</tr>


<tr className={`documents-row ${openRow === index ? "open" : ""}`}>

<td colSpan="6">

<div className="documents">

{emp.documentos.map((doc,i)=>(
<p key={i}>{doc}</p>
))}

</div>

</td>

</tr>

</React.Fragment>
))}

</tbody>

</table>

</section>

</div>

);

}

export default InformacionEmpleados;