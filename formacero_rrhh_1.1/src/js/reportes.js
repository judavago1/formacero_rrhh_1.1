const reportes = [
    {
        empleado: "Juan Pérez",
        fecha: "2026-03-01",
        descripcion: "Bajo rendimiento en cumplimiento de metas mensuales.",
        decision: "Se realizó llamado de atención y plan de mejora por 30 días.",
        estado: "pendiente"
    },
    {
        empleado: "María Gómez",
        fecha: "2026-02-15",
        descripcion: "Accidente leve en área de producción (resbalón).",
        decision: "Se activó protocolo de seguridad y capacitación adicional.",
        estado: "resuelto"
    },
    {
        empleado: "Carlos López",
        fecha: "2026-02-10",
        descripcion: "Retrasos recurrentes en horario laboral.",
        decision: "Advertencia escrita en hoja de vida laboral.",
        estado: "pendiente"
    }
];

const contenedor = document.getElementById("tarjetasReportes");

reportes.forEach(reporte => {

    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");

    tarjeta.innerHTML = `
        <h3>${reporte.empleado}</h3>
        <div class="fecha">Fecha del incidente: ${reporte.fecha}</div>
        <div class="descripcion">${reporte.descripcion}</div>
        <div class="decision"><strong>Decisión tomada:</strong> ${reporte.decision}</div>
        <div class="estado">
            ${
                reporte.estado === "resuelto"
                ? '<button class="btn-resuelto">Resuelto</button>'
                : '<button class="btn-pendiente">Pendiente</button>'
            }
        </div>
    `;

    contenedor.appendChild(tarjeta);
});