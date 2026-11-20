import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { ROOM_TYPES, fmt } from '../../constants';
import { Spinner, ErrorBox, Empty, Modal, Field } from '../../components/ui';

const blank = { type: 'Double', rent: '', capacity: 2, totalUnits: 1, available: 1 };

export default function ManageRooms() {
  const toast = useToast();
  const { data: pgs, loading, error, reload } = useFetch(() => api.get('/pgs/mine').then((r) => r.data.data), []);
  const [sel, setSel] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (pgs?.length && !pgs.find((p) => p._id === sel)) setSel(pgs[0]._id); }, [pgs, sel]);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!pgs.length) return <Empty title="Add a PG first" text="You need at least one listing to manage rooms." />;
  const pg = pgs.find((p) => p._id === sel) || pgs[0];

  const act = async (fn, ok) => { try { await fn(); toast(ok); await reload(); return true; } catch (e) { toast(errMsg(e), 'error'); return false; } };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { type: modal.type, rent: modal.rent, capacity: modal.capacity, totalUnits: modal.totalUnits, available: modal.available };
    const ok = await act(() => (modal._id ? api.put(`/pgs/${pg._id}/rooms/${modal._id}`, body) : api.post(`/pgs/${pg._id}/rooms`, body)), modal._id ? 'Room updated' : 'Room added');
    setBusy(false); if (ok) setModal(null);
  };
  const toggle = (r) => act(() => api.put(`/pgs/${pg._id}/rooms/${r._id}`, { available: r.available > 0 ? 0 : r.totalUnits }), r.available > 0 ? 'Marked not available' : 'Marked available');
  const del = (r) => window.confirm(`Delete ${r.type} room type?`) && act(() => api.delete(`/pgs/${pg._id}/rooms/${r._id}`), 'Room deleted');

  return (
    <>
      <div className="sec-head"><h1 className="page-title">Manage Rooms</h1>
        <button className="btn btn-primary" onClick={() => setModal({ ...blank })}><Plus size={16} /> Add Room Type</button></div>
      <div className="card-box">
        <Field label="Select property"><select value={pg._id} onChange={(e) => setSel(e.target.value)}>{pgs.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.district}</option>)}</select></Field>
        {pg.rooms.length ? <div className="table-wrap"><table className="table">
          <thead><tr><th>Room type</th><th>Rent</th><th>Capacity</th><th>Units (available / total)</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{pg.rooms.map((r) => (
            <tr key={r._id}><td><b>{r.type}</b></td><td>{fmt(r.rent)}</td><td>{r.capacity}</td><td>{r.available} / {r.totalUnits}</td>
              <td><span className={`badge ${r.available > 0 ? 'st-approved' : 'st-rejected'}`}>{r.available > 0 ? 'Available' : 'Not available'}</span></td>
              <td className="actions"><button className="btn btn-sm btn-outline" onClick={() => toggle(r)}>{r.available > 0 ? 'Mark full' : 'Mark available'}</button>
                <button className="icon-btn" onClick={() => setModal({ ...r })}><Pencil size={16} /></button>
                <button className="icon-btn danger" onClick={() => del(r)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
          : <Empty title="No room types yet" text="Add Single, Double or Triple rooms with rent and capacity." />}
      </div>
      {modal && (
        <Modal title={modal._id ? 'Edit room type' : 'Add room type'} onClose={() => setModal(null)}>
          <form className="form" onSubmit={save}>
            <Field label="Room type"><select value={modal.type} onChange={(e) => setModal({ ...modal, type: e.target.value })}>{ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Rent per month (₹)"><input type="number" required min="500" value={modal.rent} onChange={(e) => setModal({ ...modal, rent: e.target.value })} /></Field>
            <Field label="Capacity per room"><input type="number" required min="1" max="10" value={modal.capacity} onChange={(e) => setModal({ ...modal, capacity: e.target.value })} /></Field>
            <div className="two"><Field label="Total units"><input type="number" required min="1" value={modal.totalUnits} onChange={(e) => setModal({ ...modal, totalUnits: e.target.value })} /></Field>
              <Field label="Available now"><input type="number" required min="0" value={modal.available} onChange={(e) => setModal({ ...modal, available: e.target.value })} /></Field></div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </form>
        </Modal>)}
    </>
  );
}
