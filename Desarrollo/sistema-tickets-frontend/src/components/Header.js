// Componente Header
const Header = ({ nombreUsuario }) => {
    return (
      <header className="header">
        <img src={logo} alt="Header" className="header-image" />
        <nav className="header-nav">
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/tickets">Tickets</Link></li>
            <li><Link to="/reportes">Reportes</Link></li>
            <li><Link to="/configuracion">Configuración</Link></li>
            <li><Link to="/ayuda">Ayuda</Link></li>
          </ul>
        </nav>
        <div className="header-usuario">
          {nombreUsuario}
        </div>
      </header>
    );
  };