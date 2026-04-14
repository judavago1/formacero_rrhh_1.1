import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import empleadosRoutes from "./routes/empleados.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";

const app = express();

const allowedOrigins = [
  /github\.dev$/,
  /githubpreview\.dev$/,
  /localhost(:\d+)?$/,
  /127\.0\.0\.1(:\d+)?$/
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const allowed = allowedOrigins.some((pattern) => pattern.test(origin));
    if (allowed) {
      callback(null, origin);
    } else {
      callback(new Error("No permitido por CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// 🔹 MIDDLEWARES
app.use(express.json());

// 🔹 LOG (DEBUG)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// 🔹 RUTA BASE
app.get("/", (req, res) => {
  res.send("✅ API Formacero funcionando con Supabase");
});

// 🔹 HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date()
  });
});

// 🔹 RUTAS PRINCIPALES
app.use("/api/empleados", empleadosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reportes", reportesRoutes);

// 🔴 404
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada"
  });
});

// 🔴 ERRORES
app.use((err, req, res, next) => {
  console.error("🔥 ERROR GLOBAL:", err.message);

  if (err.message?.includes("CORS")) {
    return res.status(403).json({
      message: "Acceso bloqueado por CORS"
    });
  }

  res.status(500).json({
    message: "Error interno del servidor"
  });
});

// 🚀 SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});