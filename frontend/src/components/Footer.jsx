import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container foot-inner">
        <b>PG & Room Rental Management System</b>
        <nav><Link to="/">Home</Link><Link to="/about">About Us</Link><Link to="/contact">Contact</Link><Link to="/pgs">Browse PGs</Link></nav>
        <span>© {new Date().getFullYear()} PG & Room Rental Management System. Himachal Pradesh.</span>
      </div>
    </footer>
  );
}
