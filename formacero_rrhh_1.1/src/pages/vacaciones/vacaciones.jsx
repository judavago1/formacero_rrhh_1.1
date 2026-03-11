import React, { useState } from "react";
import "./vacaciones.css";

function Vacaciones() {

const empleados = [
{
nombre:"Juan Pérez",
ingreso:"2022-01-10",
usados:5
},
{
nombre:"María Gómez",
ingreso:"2021-06-15",
usados:10
},
{
nombre:"Carlos López",
ingreso:"2023-03-01",
usados:2
}
];

const [empleadoSeleccionado,setEmpleadoSeleccionado] = useState(null);
const [diasSolicitados,setDiasSolicitados] = useState("");
const [resultado,setResultado] = useState("");

function seleccionarEmpleado(nombre){

const emp = empleados.find(e => e.nombre === nombre);

setEmpleadoSeleccionado(emp);
setResultado("");

}

function calcularVacaciones(){

if(!empleadoSeleccionado){
setResultado("Seleccione un empleado primero");
return;
}

const fechaIngreso = new Date(empleadoSeleccionado.ingreso);
const hoy = new Date();

const años = hoy.getFullYear() - fechaIngreso.getFullYear();

const diasTotales = años * 15;

const disponibles = diasTotales - empleadoSeleccionado.usados;

if(diasSolicitados <= disponibles){

setResultado("Solicitud enviada correctamente");

}else{

setResultado("No tiene suficientes días disponibles");

}

}

return (

<div className="contenedor-vacaciones">

<h2>Gestión de Vacaciones</h2>

<label>Empleado:</label>

<select onChange={(e)=>seleccionarEmpleado(e.target.value)}>

<option value="">-- Seleccione --</option>

{empleados.map((emp,i)=>(
<option key={i} value={emp.nombre}>
{emp.nombre}
</option>
))}

</select>


{empleadoSeleccionado && (

<div className="info-box">

<p><strong>Fecha ingreso:</strong> {empleadoSeleccionado.ingreso}</p>

<p><strong>Días usados:</strong> {empleadoSeleccionado.usados}</p>

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

);

}

export default Vacaciones;