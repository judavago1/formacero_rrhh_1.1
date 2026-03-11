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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registrar-empleados" element={<RegistrarEmpleados />} />
        <Route path="/nomina" element={<Nomina />} />
        <Route path="/vacaciones" element={<Vacaciones />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/organizacion" element={<Organizacion />} />
        <Route path="/informacion-empleados" element={<InformacionEmpleados />} />
        <Route path="/lista-exempleados" element={<ListaExempleados />} />
        <Route path="/certificado-laboral" element={<CertificadoLaboral />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;