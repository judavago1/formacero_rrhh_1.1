import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  Dashboard,
  RegistrarEmpleados,
  Nomina,
  Vacaciones,
  Reportes,
  Organizacion,
  InformacionEmpleados,
  ListaExempleados,
  CertificadoLaboral,
} from "./pages/pages.jsx";

// 🔹 Import detalle empleado
import EmpleadoDetalle from "./pages/empleado-detalle/empleado-detalle.jsx";

// 🔹 IMPORT LOGIN (NUEVO)
import Login from "./pages/login/login.jsx";

import './layout.css';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔥 LOGIN COMO PANTALLA INICIAL */}
        <Route path="/" element={<Login />} />

        {/* 🔥 DASHBOARD */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* 🔹 RESTO DEL SISTEMA */}
        <Route path="/registrar-empleados" element={<RequireAuth><RegistrarEmpleados /></RequireAuth>} />
        <Route path="/nomina" element={<RequireAuth><Nomina /></RequireAuth>} />
        <Route path="/vacaciones" element={<RequireAuth><Vacaciones /></RequireAuth>} />
        <Route path="/reportes" element={<RequireAuth><Reportes /></RequireAuth>} />
        <Route path="/organizacion" element={<RequireAuth><Organizacion /></RequireAuth>} />
        <Route path="/informacion-empleados" element={<RequireAuth><InformacionEmpleados /></RequireAuth>} />
        <Route path="/lista-exempleados" element={<RequireAuth><ListaExempleados /></RequireAuth>} />
        <Route path="/certificado-laboral" element={<RequireAuth><CertificadoLaboral /></RequireAuth>} />

        {/* 🔹 DETALLE EMPLEADO */}
        <Route path="/empleado/:id" element={<RequireAuth><EmpleadoDetalle /></RequireAuth>} />

        {/* 🔥 CUALQUIER RUTA → LOGIN */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;