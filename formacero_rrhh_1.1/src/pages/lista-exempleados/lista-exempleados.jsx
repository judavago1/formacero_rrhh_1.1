import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./lista-exempleados.css";

function ListaExempleados(){

const [openRow,setOpenRow] = useState(null);

const exempleados = [

{
nombre:"Pedro Martínez",
cargo:"Empleado RRHH",
departamento:"Recursos Humanos",
ingreso:"10/02/2020",
retiro:"15/01/2024",
motivo:"Renuncia voluntaria por crecimiento profesional en otra compañía."
},

{
nombre:"Ana Rodríguez",
cargo:"Administrativa Finanzas",
departamento:"Finanzas",
ingreso:"05/06/2018",
retiro:"30/11/2023",
motivo:"Terminación de contrato por reestructuración interna."
},

{
nombre:"Luis Fernández",
cargo:"Empleado Finanzas",
departamento:"Finanzas",
ingreso:"12/03/2019",
retiro:"20/12/2024",
motivo:"Finalización de contrato a término fijo."
}

];

function toggleReason(index){

if(openRow === index){
setOpenRow(null);
}else{
setOpenRow(index);
}

}

return(

<div>

<header className="header">

<div className="logo">Formacero</div>

<Link to="/dashboard" className="back-btn">
← Volver al Panel
</Link>

</header>


<section className="hero">

<h1>Lista de Exempleados</h1>

<p>
Historial de colaboradores que ya no pertenecen a la organización
</p>

</section>


<section className="table-section">

<table>

<thead>

<tr>

<th>Nombre</th>
<th>Cargo</th>
<th>Departamento</th>
<th>Fecha Ingreso</th>
<th>Fecha Retiro</th>
<th>Motivo</th>

</tr>

</thead>


<tbody>

{exempleados.map((emp,index)=>(
<React.Fragment key={index}>

<tr className="ex-row">

<td>{emp.nombre}</td>
<td>{emp.cargo}</td>
<td>{emp.departamento}</td>
<td>{emp.ingreso}</td>
<td>{emp.retiro}</td>

<td>

<button
className="reason-btn"
onClick={()=>toggleReason(index)}
>

{openRow === index ? "Ocultar motivo" : "Ver motivo"}

</button>

</td>

</tr>


<tr className={`reason-row ${openRow === index ? "open" : ""}`}>

<td colSpan="6">

<div className="reason-box">
{emp.motivo}
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

export default ListaExempleados;