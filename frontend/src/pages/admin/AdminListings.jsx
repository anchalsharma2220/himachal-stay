import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Star } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { DISTRICTS, fmt, imgSrc, onImgError } from '../../constants';
import { Spinner, ErrorBox, Empty, StatusBadge } from '../../components/ui';

export default function AdminListings() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/pgs/admin/all', { params: { status, district, search } }).then((r) => r.data.data), [status, district, search]);

  const act = async (fn, ok) => { try { await fn(); toast(ok); await reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  const setSt = (p, body, msg) => act(() => api.patch(`/pgs/${p._id}/status`, body), msg);
  const del = (p) => window.confirm(`Remove "${p.name}" and its bookings?`) && act(() => api.delete(`/pgs/${p._id}`), 'Listing removed');

  return (
    <>
      <h1 className="page-title">PG Listings</h1>
      <div className="card-box">
        <div className="toolbar">
          <div className="tabs flat">{[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([v, l]) => <button key={l} className={status === v ? 'on' : ''} onClick={() => setStatus(v)}>{l}</button>)}</div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)}><option value="">All districts</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          <form onSubmit={(e) => { e.preventDefault(); setSearch(q); }} className="inline"><input placeholder="Search listing" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn btn-outline">Search</button></form>
        </div>
        {loading ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data.length ? <Empty title="No listings found" /> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Property</th><th>Owner</th><th>District</th><th>Rent from</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{data.map((p) => (
              <tr key={p._id}>
                <td><div className="row-img"><img src={imgSrc(p.images?.[0])} alt="" onError={onImgError} /><div><Link to={`/pgs/${p._id}`}><b>{p.name}</b></Link><br /><small className="muted">{p.propertyType} · {p.gender}</small></div></div></td>
                <td>{p.owner?.name}<br /><small className="muted">{p.owner?.phone}</small></td><td>{p.location}, {p.district}</td><td>{fmt(p.minRent)}</td>
                <td><StatusBadge status={p.status} />{p.featured && <span className="badge st-approved"> Featured</span>}</td>
                <td className="actions">
                  {p.status !== 'approved' && <button className="btn btn-sm btn-success" onClick={() => setSt(p, { status: 'approved' }, 'Listing approved')}>Approve</button>}
                  {p.status !== 'rejected' && <button className="btn btn-sm btn-danger" onClick={() => setSt(p, { status: 'rejected' }, 'Listing rejected')}>Reject</button>}
                  <button className="icon-btn" title={p.featured ? 'Remove from featured' : 'Mark featured'} onClick={() => setSt(p, { featured: !p.featured }, p.featured ? 'Removed from featured' : 'Marked featured')}><Star size={16} fill={p.featured ? '#f59e0b' : 'none'} /></button>
                  <Link className="icon-btn" title="Edit" to={`/admin/listings/${p._id}/edit`}><Pencil size={16} /></Link>
                  <button className="icon-btn danger" title="Delete" onClick={() => del(p)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>)}
      </div>
    </>
  );
}
