import React from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {

return (

<div>

{/* HEADER */}
<header className="header">

<div className="logo">Formacero</div>

<div className="search-bar">
<input
type="text"
placeholder="Buscar empleados, cargos o documentos..."
/>
</div>

<div className="user-profile">
<img src="https://i.pravatar.cc/40" alt="Usuario"/>
<span>Usuario</span>
</div>

</header>


{/* HERO */}
<section className="hero">
<h1>Panel de Gestión de Recursos Humanos</h1>
</section>


{/* MENÚ */}
<nav className="main-menu">

<Link to="/organizacion">
<button>Organización</button>
</Link>

<Link to="/informacion-empleados">
<button>Empleados</button>
</Link>

<Link to="/lista-exempleados">
<button>Lista Exempleados</button>
</Link>

<button>Reclutamiento</button>

<Link to="/nomina">
<button>Nomina</button>
</Link>

<Link to="/registrar-empleados">
<button>Registro de Empleados</button>
</Link>

<Link to="/certificado-laboral">
<button>Certificado Laboral</button>
</Link>

<Link to="/vacaciones">
<button>Vacaciones</button>
</Link>

<Link to="/reportes">
<button>Reportes</button>
</Link>

</nav>


{/* CONTENIDO */}
<main className="content">

<div className="card">
<h3>Total Empleados</h3>
<p>125</p>
</div>

<div className="card">
<h3>Nuevas Contrataciones</h3>
<p>8</p>
</div>

<div className="card">
<h3>Vacaciones Activas</h3>
<p>12</p>
</div>

<div className="card">
<h3>Cumpleaños del Mes</h3>
<p>5</p>
</div>

<div className="card alert">
<h3>Alertas Pendientes</h3>
<p>3</p>
</div>

</main>


{/* FOOTER */}
<footer className="footer">
© 2026 Formacero RRHH | Política de Privacidad | Soporte
</footer>

</div>

);
}

export default Dashboard;