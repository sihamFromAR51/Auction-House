import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <img src="/logo.svg" alt="AuctionHouse" className="navbar-logo" />
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/category/vintage-coins" className="navbar-link" onClick={() => setMenuOpen(false)}>Coins</Link>
          <Link to="/category/special-serial-taka" className="navbar-link" onClick={() => setMenuOpen(false)}>Taka</Link>
          <Link to="/category/old-cameras" className="navbar-link" onClick={() => setMenuOpen(false)}>Cameras</Link>

          <Link to="/listings/new" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
            + Sell Item
          </Link>

          {user ? (
            <div className="navbar-user">
              <Link to="/dashboard" className="navbar-link" onClick={() => setMenuOpen(false)}>
                {user.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
