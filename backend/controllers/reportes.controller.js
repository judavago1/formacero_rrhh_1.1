import { db } from "../db.js";

export const createReporte = (req, res) => {
  const { empleado_id, descripcion, fecha } = req.body;

  const sql = `
    INSERT INTO reportes (empleado_id, descripcion, fecha)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [empleado_id, descripcion, fecha || new Date()], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Reporte creado");
  });
};

export const getReportes = (req, res) => {
  console.log("GET /reportes called", req.user);

  let sql = "SELECT * FROM reportes";
  const params = [];

  if (req.user?.rol !== "admin") {
    const empleadoId = req.user?.empleado_id || req.user?.id;
    sql += " WHERE empleado_id = ?";
    params.push(empleadoId);
  }

  db.query(sql, params, (err, data) => {
    console.log("Data from db:", data);
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const updateReporte = (req, res) => {
  const { id } = req.params;
  const { estado, decision, respuesta_empleado } = req.body;
  const reporteId = Number(id);

  if (Number.isNaN(reporteId)) {
    return res.status(400).json({ message: "ID de reporte inválido" });
  }

  const sql = `
    UPDATE reportes
    SET estado = ?, decision = ?, respuesta_empleado = ?
    WHERE id = ?
  `;

  db.query(sql, [estado, decision, respuesta_empleado, reporteId], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Reporte actualizado");
  });
};

export const deleteReporte = (req, res) => {
  const { id } = req.params;
  const reporteId = Number(id);

  if (Number.isNaN(reporteId)) {
    return res.status(400).json({ message: "ID de reporte inválido" });
  }

  const sql = "DELETE FROM reportes WHERE id = ?";

  db.query(sql, [reporteId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }
    res.json("Reporte eliminado");
  });
};

export const responderReporte = (req, res) => {
  const { id } = req.params;
  const respuesta_empleado = req.body.respuesta_empleado || req.body.comentario || "";
  const archivo_excusa = req.file ? req.file.filename : null;
  const reporteId = Number(id);

  console.log("Responder reporte request:", {
    reporteId,
    respuesta_empleado,
    archivo: req.file,
    user: req.user
  });

  if (Number.isNaN(reporteId)) {
    return res.status(400).json({ message: "ID de reporte inválido" });
  }

  // Verificar que el reporte pertenece al empleado autenticado
  const checkSql = "SELECT empleado_id FROM reportes WHERE id = ?";
  db.query(checkSql, [reporteId], (checkErr, checkData) => {
    if (checkErr) {
      console.error("Error verificando reporte:", checkErr);
      return res.status(500).json(checkErr);
    }
    if (!checkData || checkData.length === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    const currentEmpleadoId = String(req.user.empleado_id || req.user.id);
    const reporteEmpleadoId = String(checkData[0].empleado_id);

    console.log("[DEBUG responderReporte] currentEmpleadoId=", currentEmpleadoId, "reporteEmpleadoId=", reporteEmpleadoId, "req.user=", req.user);

    if (reporteEmpleadoId !== currentEmpleadoId) {
      return res.status(403).json({ message: "No tienes permiso para responder este reporte" });
    }

    const sql = `
      UPDATE reportes
      SET respuesta_empleado = ?, archivo_excusa = ?, fecha_respuesta = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(sql, [respuesta_empleado, archivo_excusa, reporteId], (err) => {
      if (err) {
        console.error("Error actualizando respuesta:", err);
        return res.status(500).json(err);
      }
      res.json("Respuesta enviada correctamente");
    });
  });
};