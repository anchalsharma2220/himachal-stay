import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, MapPin, Star, Phone, Mail, User } from 'lucide-react';
import api, { errMsg } from '../api';
import { useFetch } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fmt, imgSrc, onImgError, toISODate } from '../constants';
import FacilityIcon from '../components/FacilityIcon';
import { Spinner, ErrorBox, Modal, Field } from '../components/ui';
import { typeLabel } from '../components/PGCard';

export default function PGDetails() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { data: pg, loading, error, reload } = useFetch(() => api.get(`/pgs/${id}`).then((r) => r.data.data), [id]);
  const [img, setImg] = useState(0);
  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({ moveInDate: '', durationMonths: 6, message: '' });
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <div className="container section"><ErrorBox message={error} onRetry={reload} /><Link to="/pgs" className="btn btn-outline">Back to listings</Link></div>;

  const isFav = user?.favorites?.includes(pg._id);
  const openBooking = (r) => {
    if (!user) { toast('Please log in as a student to book', 'error'); return nav('/login', { state: { from: `/pgs/${id}` } }); }
    if (user.role !== 'student') return toast('Only student/tenant accounts can request bookings', 'error');
    setForm({ moveInDate: '', durationMonths: 6, message: '' }); setRoom(r);
  };
  const toggleFav = async () => {
    if (!user) return nav('/login', { state: { from: `/pgs/${id}` } });
    if (user.role !== 'student') return toast('Only students can save favourites', 'error');
    try { const { data } = await api.post(`/favorites/${pg._id}`); setUser({ ...user, favorites: data.favorites }); toast(data.message); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post('/bookings', { pgId: pg._id, roomId: room._id, ...form });
      toast(data.message); setRoom(null); nav('/student/bookings');
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="container section details">
      <Link to="/pgs" className="back">← Back to listings</Link>
      <div className="d-grid">
        <div>
          <div className="gallery">
            <img className="main" src={imgSrc(pg.images?.[img])} alt={pg.name} onError={onImgError} />
            {pg.images?.length > 1 && <div className="thumbs">{pg.images.map((u, i) => <img key={u} src={imgSrc(u)} alt="" className={i === img ? 'on' : ''} onClick={() => setImg(i)} onError={onImgError} />)}</div>}
          </div>
          <div className="d-card">
            <div className="d-title"><div><span className="tag blue static">{typeLabel(pg)}</span>{pg.status !== 'approved' && <span className="badge st-pending">{pg.status}</span>}
              <h1>{pg.name}</h1><p className="loc"><MapPin size={14} /> {pg.address}</p></div>
              <button className={`btn btn-outline ${isFav ? 'fav-on' : ''}`} onClick={toggleFav}><Heart size={16} fill={isFav ? 'currentColor' : 'none'} /> {isFav ? 'Saved' : 'Save'}</button></div>
            <div className="meta-row">{pg.rating > 0 && <span><Star size={15} fill="#f59e0b" stroke="#f59e0b" /> {pg.rating} ({pg.reviewsCount} reviews)</span>}
              <span>From <b>{fmt(pg.minRent)}</b>/month</span>{pg.nearby && <span>{pg.nearby}</span>}</div>
            <h3>About this property</h3><p>{pg.description}</p>
            <h3>Amenities</h3>
            <div className="amen">{pg.facilities.map((f) => <span key={f}><FacilityIcon name={f} size={16} /> {f}</span>)}</div>
            {pg.rules?.length > 0 && <><h3>House rules</h3><ul className="rules">{pg.rules.map((r) => <li key={r}>{r}</li>)}</ul></>}
            <h3>Rooms, capacity & pricing</h3>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Room type</th><th>Capacity</th><th>Rent / month</th><th>Availability</th><th /></tr></thead>
              <tbody>{pg.rooms.map((r) => (
                <tr key={r._id}><td><b>{r.type}</b></td><td>{r.capacity} {r.capacity > 1 ? 'persons' : 'person'}</td><td>{fmt(r.rent)}</td>
                  <td>{r.available > 0 ? <span className="badge st-approved">{r.available} of {r.totalUnits} available</span> : <span className="badge st-rejected">Not available</span>}</td>
                  <td><button className="btn btn-sm btn-primary" disabled={r.available < 1} onClick={() => openBooking(r)}>Book Now</button></td></tr>))}</tbody>
            </table></div>
          </div>
        </div>
        <aside className="owner-card">
          <h3>Contact Owner</h3>
          <p className="o-name"><User size={16} /> {pg.owner?.name}</p>
          {(pg.contactPhone || pg.owner?.phone) && <a className="btn btn-outline btn-block" href={`tel:${pg.contactPhone || pg.owner.phone}`}><Phone size={15} /> {pg.contactPhone || pg.owner.phone}</a>}
          {pg.owner?.email && <a className="btn btn-outline btn-block" href={`mailto:${pg.owner.email}`}><Mail size={15} /> Email owner</a>}
          <p className="muted small">District: {pg.district} · Area: {pg.location}</p>
        </aside>
      </div>

      {room && (
        <Modal title={`Request booking - ${room.type} room`} onClose={() => setRoom(null)}>
          <form onSubmit={submit} className="form">
            <p className="muted">{pg.name} · {fmt(room.rent)}/month</p>
            <Field label="Move-in date"><input type="date" required min={toISODate()} value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} /></Field>
            <Field label="Stay duration"><select value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}>
              {[1, 3, 6, 9, 12, 24].map((m) => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}</select></Field>
            <Field label="Message to owner (optional)"><textarea rows="3" maxLength="500" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell the owner about yourself" /></Field>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Submitting...' : 'Submit Booking Request'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
