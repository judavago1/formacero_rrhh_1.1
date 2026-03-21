import express from "express";
import cors from "cors";
import { db } from "./db.js";

import empleadosRoutes from "./routes/empleados.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/empleados", empleadosRoutes);
app.use("/auth", authRoutes);
app.use("/reportes", reportesRoutes);

app.listen(3001, () => {
  console.log("🚀 Backend corriendo en puerto 3001");
});