import { Link } from 'react-router-dom';
import { Users, Building2, ShieldCheck, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="container section about">
      <h1>About Us</h1>
      <p className="lead">The PG & Room Rental Management System is a web platform that helps students and working professionals find paying guest accommodation and rental rooms across all 12 districts of Himachal Pradesh.</p>
      <div className="why-grid light">
        <div><Target /><b>Our Objective</b><p>One centralized place to search PGs, compare rent and facilities, check availability and send booking requests.</p></div>
        <div><Users /><b>For Students</b><p>Search by district, rent and room type, save favourites, request bookings and track their status.</p></div>
        <div><Building2 /><b>For PG Owners</b><p>List properties, manage room types, rent and capacity, and approve or reject booking requests.</p></div>
        <div><ShieldCheck /><b>Administration</b><p>Admins verify listings, manage accounts and bookings and monitor platform activity.</p></div>
      </div>
      <h2>Technology</h2>
      <p>Built with the MERN stack - MongoDB, Express.js, React and Node.js - with JWT authentication, bcrypt password hashing and role-based access control for Students/Tenants, PG Owners and Administrators.</p>
      <Link to="/pgs" className="btn btn-primary">Browse PGs</Link>
    </div>
  );
}
