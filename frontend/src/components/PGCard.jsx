import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fmt, imgSrc, onImgError } from '../constants';
import FacilityIcon from './FacilityIcon';

export const typeLabel = (pg) => (pg.propertyType === 'PG' ? `PG (${pg.gender})` : `Room (${pg.rooms?.[0]?.type || 'Single'})`);

export default function PGCard({ pg }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const isFav = user?.favorites?.includes(pg._id);

  const toggleFav = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: `/pgs/${pg._id}` } });
    if (user.role !== 'student') return toast('Only students can save favourites', 'error');
    try {
      const { data } = await api.post(`/favorites/${pg._id}`);
      setUser({ ...user, favorites: data.favorites });
      toast(data.message);
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  return (
    <article className="pg-card">
      <div className="pg-img">
        <img src={imgSrc(pg.images?.[0])} alt={pg.name} loading="lazy" onError={onImgError} />
        <span className={`tag ${pg.propertyType === 'PG' ? (pg.gender === 'Girls' ? 'pink' : 'blue') : 'green'}`}>{typeLabel(pg)}</span>
        <button className={`fav ${isFav ? 'on' : ''}`} onClick={toggleFav} aria-label="Save to favourites"><Heart size={16} fill={isFav ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="pg-body">
        <h3>{pg.name}</h3>
        <p className="loc"><MapPin size={13} /> {pg.location}, {pg.district}</p>
        <div className="price-row">
          <span className="price">{fmt(pg.minRent)}<small>/month</small></span>
          {pg.rating > 0 && <span className="rate"><Star size={13} fill="#f59e0b" stroke="#f59e0b" /> {pg.rating} <small>({pg.reviewsCount})</small></span>}
        </div>
        <div className="facs">{(pg.facilities || []).slice(0, 4).map((f) => <span key={f}><FacilityIcon name={f} /> {f.replace(' Included', '')}</span>)}</div>
        <p className="nearby">
          <span className={pg.totalAvailable > 0 ? 'avail' : 'full'}>{pg.totalAvailable > 0 ? `${pg.totalAvailable} vacancies` : 'Fully booked'}</span>
          {pg.nearby && <> · {pg.nearby}</>}
        </p>
        <Link to={`/pgs/${pg._id}`} className="btn btn-primary btn-block">View Details</Link>
      </div>
    </article>
  );
}
