function generarDesprendible() {

    const empleado = document.getElementById("empleado").value;
    const salario = parseFloat(document.getElementById("salario").value);
    const dias = parseInt(document.getElementById("dias").value);

    if (!empleado || !salario || !dias) {
        alert("Por favor complete todos los campos");
        return;
    }

    const salarioDiario = salario / 30;
    const totalDevengado = salarioDiario * dias;

    const salud = totalDevengado * 0.04;
    const pension = totalDevengado * 0.04;
    const totalDeducciones = salud + pension;

    const netoPagar = totalDevengado - totalDeducciones;

    document.getElementById("desprendible").innerHTML = `
        <h3>Desprendible de Pago</h3>
        <p><strong>Empleado:</strong> ${empleado}</p>
        <p><strong>Días trabajados:</strong> ${dias}</p>
        <hr>
        <p><strong>Total Devengado:</strong> $${totalDevengado.toLocaleString()}</p>
        <p><strong>Salud (4%):</strong> -$${salud.toLocaleString()}</p>
        <p><strong>Pensión (4%):</strong> -$${pension.toLocaleString()}</p>
        <hr>
        <p><strong>Neto a Pagar:</strong> $${netoPagar.toLocaleString()}</p>
    `;
}

function descargarPDF() {

    const elemento = document.getElementById("desprendible");

    if (elemento.innerHTML.trim() === "") {
        alert("Primero genere el desprendible");
        return;
    }

    html2pdf().from(elemento).save("desprendible.pdf");
}