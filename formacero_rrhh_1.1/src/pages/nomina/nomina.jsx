import React, { useState, useRef } from "react";
import "./nomina.css";
import html2pdf from "html2pdf.js";

function Nomina() {

const [empleado,setEmpleado] = useState("");
const [salario,setSalario] = useState("");
const [dias,setDias] = useState("");
const [desprendible,setDesprendible] = useState("");

const desprendibleRef = useRef();

function generarDesprendible(){

if(!empleado || !salario || !dias){
alert("Completa todos los campos");
return;
}

const salarioDia = salario / 30;
const total = salarioDia * dias;

const texto = `
Empresa: Formacero S.A.S

Empleado: ${empleado}

Salario Base: $${salario}

Días trabajados: ${dias}

Total a pagar: $${total.toLocaleString()}

Fecha de generación: ${new Date().toLocaleDateString()}
`;

setDesprendible(texto);

}

function descargarPDF(){

if(!desprendible){
alert("Primero genera el desprendible");
return;
}

const element = desprendibleRef.current;

html2pdf()
.set({
margin:10,
filename:"desprendible_nomina.pdf",
html2canvas:{ scale:2 },
jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" }
})
.from(element)
.save();

}

return(

<div className="contenedor-nomina">

<h2>Generar Desprendible de Pago</h2>

<label>Seleccionar empleado:</label>

<select
value={empleado}
onChange={(e)=>setEmpleado(e.target.value)}
>

<option value="">-- Seleccione --</option>
<option value="Juan Pérez">Juan Pérez</option>
<option value="María Gómez">María Gómez</option>
<option value="Carlos López">Carlos López</option>

</select>


<label>Salario Base:</label>

<input
type="number"
placeholder="Ej: 2000000"
value={salario}
onChange={(e)=>setSalario(e.target.value)}
/>


<label>Días trabajados:</label>

<input
type="number"
placeholder="Ej: 30"
value={dias}
onChange={(e)=>setDias(e.target.value)}
/>


<button onClick={generarDesprendible}>
Generar
</button>

<button onClick={descargarPDF}>
Descargar PDF
</button>


<div
id="desprendible"
className="desprendible"
ref={desprendibleRef}
>

<pre>{desprendible}</pre>

</div>

</div>

);

}

export default Nomina;