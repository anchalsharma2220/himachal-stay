import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const toast = useToast();
  const close = () => setOpen(false);
  const doLogout = () => { logout(); close(); toast('Logged out successfully'); nav('/'); };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-ico"><Home size={20} /></span>
          <span><b>PG & Room Rental</b><small>Management System</small></span>
        </Link>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/about" onClick={close}>About Us</NavLink>
          <NavLink to="/pgs" onClick={close}>PG List</NavLink>
          <NavLink to="/contact" onClick={close}>Contact</NavLink>
          <div className="nav-actions mobile-only">
            {user ? <><Link to={`/${user.role}`} className="btn btn-outline" onClick={close}>Dashboard</Link><button className="btn btn-primary" onClick={doLogout}>Logout</button></>
              : <><Link to="/login" className="btn btn-outline" onClick={close}>Login</Link><Link to="/register" className="btn btn-primary" onClick={close}>Register</Link></>}
          </div>
        </nav>
        <div className="nav-actions desktop-only">
          <button className="icon-btn" aria-label="Search PGs" onClick={() => nav('/pgs')}><Search size={18} /></button>
          {user ? (
            <>
              <Link to={`/${user.role}`} className="btn btn-outline">{user.name.split(' ')[0]}'s Dashboard</Link>
              <button className="btn btn-primary" onClick={doLogout}>Logout</button>
            </>
          ) : (
            <><Link to="/login" className="btn btn-outline">Login</Link><Link to="/register" className="btn btn-primary">Register</Link></>
          )}
        </div>
        <button className="icon-btn burger" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
