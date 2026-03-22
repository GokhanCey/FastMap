import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        <span className="nav-logo-mark">F</span>
        FastMap
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Benchmarks
        </NavLink>
        <NavLink to="/demo" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Live Demo
        </NavLink>
      </div>
      <NavLink to="/demo" className="nav-cta">Run a Proof →</NavLink>
    </nav>
  );
}
