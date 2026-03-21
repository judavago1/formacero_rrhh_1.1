import express from "express";
import {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  countEmpleados,
  getExEmpleados,
  deleteExEmpleado,
  getCumpleaneros 
} from "../controllers/empleados.controller.js";

const router = express.Router();

// 🔹 CRUD
router.get("/", getEmpleados);
router.post("/", createEmpleado);   
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);
router.get("/count", countEmpleados);
router.get("/exempleados", getExEmpleados);
router.delete("/exempleados/:id", deleteExEmpleado);
router.get("/cumpleaneros", getCumpleaneros);

export default router;