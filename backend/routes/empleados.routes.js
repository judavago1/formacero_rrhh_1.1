import express from "express";
import multer from "multer";
import { supabase } from "../config/supabase.js";
import {
  searchEmpleado, 
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  countEmpleados,
  getExEmpleados,
  deleteExEmpleado,
  getCumpleaneros,
  getEmpleadoById,
  getCertificadoEmpleado
} from "../controllers/empleados.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const router = express.Router();

// 🔐 Middleware global (evita repetirlo en cada ruta)
router.use(verifyToken);

// 🔍 =============================
// BUSQUEDAS Y CONSULTAS
// =============================
router.get("/search", searchEmpleado);           
router.get("/count", countEmpleados);
router.get("/cumpleaneros", getCumpleaneros);
router.get("/exempleados", getExEmpleados);

// 📄 =============================
// CERTIFICADOS
// =============================
router.get("/certificado/:id", getCertificadoEmpleado);

// 🧾 =============================
// CRUD GENERAL
// =============================
router.get("/", getEmpleados);
router.post("/", upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "documentos", maxCount: 10 }
]), createEmpleado);
router.put("/:id", upload.single("foto"), updateEmpleado);
router.delete("/:id", deleteEmpleado);

// 📎 =============================
// DOCUMENTOS
// =============================
router.post("/:id/documentos", upload.single("documento"), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No se proporcionó archivo" });
    }

    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ message: "El archivo no debe superar 50MB" });
    }

    const ext = file.originalname.split(".").pop() || "bin";
    const filePath = `documentos/${id}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("empleados")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = await supabase.storage
      .from("empleados")
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("documentos_empleado")
      .insert([{
        empleado_id: id,
        nombre_original: file.originalname,
        tipo: file.mimetype,
        url: publicUrlData?.publicUrl || filePath,
      }])
      .select()
      .single();

    if (error && error.code !== "PGRST205") {
      throw error;
    }

    res.json(data || {
      id: Date.now(),
      nombre_original: file.originalname,
      tipo: file.mimetype,
      url: publicUrlData?.publicUrl || filePath,
      fecha_subida: new Date()
    });
  } catch (err) {
    console.error("ERROR UPLOAD DOCUMENTO:", err);
    res.status(500).json(err);
  }
});

// 🗑 =============================
// EX-EMPLEADOS
// =============================
router.delete("/exempleados/:id", deleteExEmpleado);

// 👤 =============================
// DETALLE POR ID (SIEMPRE AL FINAL)
// =============================
router.get("/:id", getEmpleadoById);

export default router;