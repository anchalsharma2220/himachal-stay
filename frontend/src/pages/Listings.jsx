import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import api from '../api';
import { useFetch } from '../hooks';
import { DISTRICTS, FACILITIES, ROOM_TYPES, fmt, imgSrc, onImgError } from '../constants';
import PGCard from '../components/PGCard';
import { Spinner, ErrorBox, Empty, Pagination } from '../components/ui';

const blank = { search: '', propertyType: '', gender: '', roomType: '', minRent: '', maxRent: '', facilities: [], available: false };

export default function Listings() {
  const [sp, setSp] = useSearchParams();
  const district = sp.get('district') || '';
  const sort = sp.get('sort') || 'popular';
  const [f, setF] = useState(blank);
  const [showFilters, setShowFilters] = useState(false);

  // keep the sidebar form in sync with the URL
  useEffect(() => {
    setF({
      search: sp.get('search') || '', propertyType: sp.get('propertyType') || '', gender: sp.get('gender') || '', roomType: sp.get('roomType') || '',
      minRent: sp.get('minRent') || '', maxRent: sp.get('maxRent') || '',
      facilities: (sp.get('facilities') || '').split(',').filter(Boolean), available: sp.get('available') === 'true',
    });
  }, [sp]);

  const { data, loading, error, reload } = useFetch(
    () => api.get('/pgs', { params: { ...Object.fromEntries(sp), limit: 9 } }).then((r) => r.data), [sp.toString()]);
  const featured = useFetch(() => api.get('/pgs/featured', { params: { limit: 5 } }).then((r) => r.data.data), []);

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === false || v == null || (Array.isArray(v) && !v.length) ? next.delete(k) : next.set(k, Array.isArray(v) ? v.join(',') : v)));
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };
  const apply = (e) => { e?.preventDefault(); update({ ...f }); setShowFilters(false); };
  const toggleFac = (x) => setF({ ...f, facilities: f.facilities.includes(x) ? f.facilities.filter((y) => y !== x) : [...f.facilities, x] });

  return (
    <div className="container listing-page">
      <div className="chips scroll">
        <button className={`chip ${!district ? 'on' : ''}`} onClick={() => update({ district: '' })}>All Districts</button>
        {DISTRICTS.map((d) => <button key={d} className={`chip ${district === d ? 'on' : ''}`} onClick={() => update({ district: d })}>{d}</button>)}
      </div>
      <button className="btn btn-outline filter-toggle" onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filters</button>

      <div className="listing-grid">
        <aside className={`filters ${showFilters ? 'open' : ''}`}>
          <form onSubmit={apply}>
            <h3><Filter size={16} /> Filters</h3>
            <label className="field"><span>Search</span><input placeholder="Name, area, landmark" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} /></label>
            <label className="field"><span>Property Type</span>
              <select value={f.propertyType} onChange={(e) => setF({ ...f, propertyType: e.target.value })}><option value="">All</option><option value="PG">PG</option><option value="Room">Room</option></select></label>
            <label className="field"><span>Suitable For</span>
              <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option value="">Anyone</option><option>Boys</option><option>Girls</option><option>Unisex</option></select></label>
            <label className="field"><span>Room Type</span>
              <select value={f.roomType} onChange={(e) => setF({ ...f, roomType: e.target.value })}><option value="">Any</option>{ROOM_TYPES.map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className="field"><span>District</span>
              <select value={district} onChange={(e) => update({ district: e.target.value })}><option value="">All districts</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
            <div className="field"><span>Price Range (₹)</span>
              <div className="two"><input type="number" min="0" placeholder="Min" value={f.minRent} onChange={(e) => setF({ ...f, minRent: e.target.value })} />
                <input type="number" min="0" placeholder="Max" value={f.maxRent} onChange={(e) => setF({ ...f, maxRent: e.target.value })} /></div></div>
            <div className="field"><span>Facilities</span>
              <div className="checks">{FACILITIES.map((x) => <label key={x}><input type="checkbox" checked={f.facilities.includes(x)} onChange={() => toggleFac(x)} /> {x}</label>)}</div></div>
            <label className="check"><input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} /> Only show available</label>
            <button className="btn btn-primary btn-block">Apply Filters</button>
            <button type="button" className="btn btn-outline btn-block" onClick={() => { setF(blank); setSp(district ? { district } : {}); }}><X size={14} /> Clear all</button>
          </form>
          <div className="side-cta"><b>Looking for a PG or Room in your district?</b><p>Explore verified listings with photos, amenities and owner details.</p><Link to="/register?role=owner" className="btn btn-primary btn-block">Post Your Listing</Link></div>
        </aside>

        <section>
          <div className="list-head">
            <h2>Available PGs & Rooms{district ? ` in ${district}` : ''}</h2>
            <div className="list-tools"><span className="muted">{data ? `${data.total} properties found` : ''}</span>
              <select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
                <option value="popular">Most popular</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option><option value="newest">Newest</option></select></div>
          </div>
          {loading ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : data.data.length === 0 ? (
            <Empty title="No properties match your filters" text="Try a different district, price range or clear the filters." />
          ) : (
            <><div className="grid g3">{data.data.map((p) => <PGCard key={p._id} pg={p} />)}</div>
              <Pagination page={data.page} pages={data.pages} onChange={(p) => { update({ page: p > 1 ? p : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></>
          )}
        </section>

        <aside className="featured-side">
          <h3>Featured PGs</h3>
          {(featured.data || []).map((p) => (
            <Link key={p._id} to={`/pgs/${p._id}`} className="mini"><img src={imgSrc(p.images?.[0])} alt="" onError={onImgError} /><div><b>{p.name}</b><small>{p.location}, {p.district}</small><span>{fmt(p.minRent)}/month</span></div></Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
