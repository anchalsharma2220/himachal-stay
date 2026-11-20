import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, ShieldCheck, Lock, PhoneCall, Mountain, Building2, Users, CalendarCheck } from 'lucide-react';
import api from '../api';
import { useFetch } from '../hooks';
import { DISTRICTS, HERO_IMG, fmt } from '../constants';
import PGCard from '../components/PGCard';
import { Spinner, ErrorBox, StatCard } from '../components/ui';

const PRICES = [['', 'Price Range'], ['0-4000', 'Under ₹4,000'], ['4000-6000', '₹4,000 – ₹6,000'], ['6000-8000', '₹6,000 – ₹8,000'], ['8000-', '₹8,000 & above']];

export default function Home() {
  const nav = useNavigate();
  const [f, setF] = useState({ district: '', propertyType: '', price: '' });
  const feat = useFetch(() => api.get('/pgs/featured', { params: { limit: 6 } }).then((r) => r.data.data), []);
  const stats = useFetch(() => api.get('/pgs/public-stats').then((r) => r.data), []);

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (f.district) p.set('district', f.district);
    if (f.propertyType) p.set('propertyType', f.propertyType);
    if (f.price) { const [a, b] = f.price.split('-'); if (a) p.set('minRent', a); if (b) p.set('maxRent', b); }
    nav(`/pgs?${p.toString()}`);
  };

  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,37,88,.85), rgba(10,37,88,.35)), url(${HERO_IMG})` }}>
        <div className="container">
          <h1>Find Your Perfect PG or Room</h1>
          <p>Comfortable Stay · Safe Environment · Across Himachal Pradesh</p>
          <form className="search-box" onSubmit={search}>
            <label><MapPin size={16} /><select value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>
              <option value="">Select District</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label><select value={f.propertyType} onChange={(e) => setF({ ...f, propertyType: e.target.value })}>
              <option value="">PG / Room Type</option><option value="PG">PG</option><option value="Room">Room</option></select></label>
            <label><select value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })}>
              {PRICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <button className="btn btn-primary"><Search size={16} /> Search</button>
          </form>
        </div>
      </section>

      <div className="container chips">
        <Link to="/pgs" className="chip on"><Mountain size={14} /> All Districts</Link>
        {DISTRICTS.map((d) => <Link key={d} to={`/pgs?district=${encodeURIComponent(d)}`} className="chip">{d}</Link>)}
      </div>

      <section className="container section">
        <div className="sec-head"><h2>Featured PGs & Rooms</h2><Link to="/pgs">View all →</Link></div>
        {feat.loading ? <Spinner /> : feat.error ? <ErrorBox message={feat.error} onRetry={feat.reload} /> : <div className="grid">{feat.data.map((p) => <PGCard key={p._id} pg={p} />)}</div>}
      </section>

      <section className="container section">
        {stats.data && (
          <div className="stats-row">
            <StatCard icon={Building2} label="Verified Listings" value={stats.data.pgs} />
            <StatCard icon={Users} label="Registered Students" value={stats.data.students} tone="green" />
            <StatCard icon={ShieldCheck} label="PG Owners" value={stats.data.owners} tone="orange" />
            <StatCard icon={CalendarCheck} label="Booking Requests" value={stats.data.bookings} tone="purple" />
          </div>
        )}
      </section>

      <section className="container section">
        <div className="sec-head"><h2>Browse by District</h2></div>
        <div className="district-grid">
          {(stats.data?.districts || DISTRICTS.map((name) => ({ name, count: 0, minRent: 0 }))).map((d) => (
            <Link key={d.name} to={`/pgs?district=${encodeURIComponent(d.name)}`} className="district-tile">
              <MapPin size={18} /><b>{d.name}</b>
              <small>{d.count} {d.count === 1 ? 'property' : 'properties'}{d.minRent ? ` · from ${fmt(d.minRent)}` : ''}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="why">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="why-grid">
            <div><ShieldCheck /><b>Verified Listings</b><p>Every listing is reviewed and approved by an admin.</p></div>
            <div><Lock /><b>Secure Booking</b><p>Send booking requests and track their status online.</p></div>
            <div><PhoneCall /><b>Direct Owner Contact</b><p>Talk to PG owners directly. No middlemen.</p></div>
            <div><Mountain /><b>All 12 Districts</b><p>PGs and rooms from Una to Lahaul & Spiti.</p></div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="cta">
          <div><h2>Own a PG or a room in Himachal?</h2><p>List it for free, manage rooms and respond to booking requests from your dashboard.</p></div>
          <Link to="/register?role=owner" className="btn btn-light">Post Your Listing</Link>
        </div>
      </section>
    </>
  );
}
