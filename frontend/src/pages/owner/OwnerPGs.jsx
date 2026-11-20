import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { fmt, imgSrc, onImgError } from '../../constants';
import { Spinner, ErrorBox, Empty, StatusBadge } from '../../components/ui';

export default function OwnerPGs() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.get('/pgs/mine').then((r) => r.data.data), []);
  const del = async (pg) => {
    if (!window.confirm(`Delete "${pg.name}"? All its bookings will be removed too.`)) return;
    try { await api.delete(`/pgs/${pg._id}`); toast('Listing deleted'); reload(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <>
      <div className="sec-head"><h1 className="page-title">My PGs</h1><Link to="/owner/pgs/new" className="btn btn-primary"><Plus size={16} /> Add PG</Link></div>
      {!data.length ? <Empty title="You have not added any PG yet"><Link to="/owner/pgs/new" className="btn btn-primary">Add your first PG</Link></Empty> : (
        <div className="card-box"><div className="table-wrap"><table className="table">
          <thead><tr><th>Property</th><th>District</th><th>Rent from</th><th>Rooms</th><th>Requests</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{data.map((p) => (
            <tr key={p._id}>
              <td><div className="row-img"><img src={imgSrc(p.images?.[0])} alt="" onError={onImgError} /><div><b>{p.name}</b><br /><small className="muted">{p.propertyType} · {p.gender}</small></div></div></td>
              <td>{p.location}, {p.district}</td><td>{fmt(p.minRent)}</td><td>{p.rooms.length} types · {p.totalAvailable} vacant</td>
              <td>{p.pendingRequests ? <span className="badge st-pending">{p.pendingRequests} pending</span> : '-'}</td>
              <td><StatusBadge status={p.status} /></td>
              <td className="actions">
                <Link className="icon-btn" title="View" to={`/pgs/${p._id}`}><Eye size={16} /></Link>
                <Link className="icon-btn" title="Edit" to={`/owner/pgs/${p._id}/edit`}><Pencil size={16} /></Link>
                <button className="icon-btn danger" title="Delete" onClick={() => del(p)}><Trash2 size={16} /></button>
              </td></tr>))}</tbody></table></div></div>)}
    </>
  );
}
