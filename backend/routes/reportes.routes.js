import express from "express";
import multer from "multer";
import { createReporte, getReportes, updateReporte, deleteReporte, responderReporte } from "../controllers/reportes.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roleAuth.js";

const router = express.Router();

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// GET puede ser accedido por usuarios autenticados
router.get("/", getReportes);

// Responder reporte (empleados pueden responder sus propios reportes)
router.post("/:id/responder", upload.single('archivo_excusa'), responderReporte);

// Crear, actualizar y eliminar requieren admin
router.use(requireAdmin);
router.post("/", createReporte);
router.put("/:id", updateReporte);
router.delete("/:id", deleteReporte);

export default router;