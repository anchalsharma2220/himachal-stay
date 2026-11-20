import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate } from '../../constants';
import { Spinner, ErrorBox, Empty, Modal, Field } from '../../components/ui';

export default function AdminUsers() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(() => api.get('/users', { params: { role, search } }).then((r) => r.data.data), [role, search]);

  const act = async (fn, ok) => { try { await fn(); toast(ok); await reload(); return true; } catch (e) { toast(errMsg(e), 'error'); return false; } };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { name: modal.name, phone: modal.phone, role: modal.role, ...(modal.password ? { password: modal.password } : {}) };
    const ok = await act(() => (modal._id ? api.put(`/users/${modal._id}`, body) : api.post('/users', { ...body, email: modal.email })), modal._id ? 'User updated' : 'User created');
    setBusy(false); if (ok) setModal(null);
  };
  const del = (u) => window.confirm(`Delete ${u.name}? ${u.role === 'owner' ? 'Their listings and bookings will be removed too.' : ''}`) && act(() => api.delete(`/users/${u._id}`), 'User deleted');
  const toggle = (u) => act(() => api.put(`/users/${u._id}`, { isActive: !u.isActive }), u.isActive ? 'Account deactivated' : 'Account activated');

  return (
    <>
      <div className="sec-head"><h1 className="page-title">Manage Users</h1><button className="btn btn-primary" onClick={() => setModal({ name: '', email: '', phone: '', role: 'student', password: '' })}><Plus size={16} /> Add User</button></div>
      <div className="card-box">
        <div className="toolbar">
          <div className="tabs flat">{[['', 'All'], ['student', 'Students'], ['owner', 'Owners'], ['admin', 'Admins']].map(([v, l]) => <button key={l} className={role === v ? 'on' : ''} onClick={() => setRole(v)}>{l}</button>)}</div>
          <form onSubmit={(e) => { e.preventDefault(); setSearch(q); }} className="inline"><input placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn btn-outline">Search</button></form>
        </div>
        {loading ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data.length ? <Empty title="No users found" /> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Name</th><th>Contact</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{data.map((u) => (
              <tr key={u._id}><td><b>{u.name}</b></td><td>{u.email}<br /><small className="muted">{u.phone || '-'}</small></td><td><span className="badge st-pending cap">{u.role}</span></td><td>{fmtDate(u.createdAt)}</td>
                <td><span className={`badge ${u.isActive ? 'st-approved' : 'st-rejected'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
                <td className="actions">
                  {u._id !== me._id && <button className="btn btn-sm btn-outline" onClick={() => toggle(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>}
                  <button className="icon-btn" onClick={() => setModal({ ...u, password: '' })}><Pencil size={16} /></button>
                  {u._id !== me._id && <button className="icon-btn danger" onClick={() => del(u)}><Trash2 size={16} /></button>}</td></tr>))}</tbody></table></div>)}
      </div>
      {modal && (
        <Modal title={modal._id ? 'Edit user' : 'Add user'} onClose={() => setModal(null)}>
          <form className="form" onSubmit={save}>
            <Field label="Name"><input required value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
            <Field label="Email"><input type="email" required disabled={!!modal._id} value={modal.email} onChange={(e) => setModal({ ...modal, email: e.target.value })} /></Field>
            <Field label="Phone"><input pattern="[0-9+\-\s]{10,15}" value={modal.phone || ''} onChange={(e) => setModal({ ...modal, phone: e.target.value })} /></Field>
            <Field label="Role"><select value={modal.role} disabled={modal._id === me._id} onChange={(e) => setModal({ ...modal, role: e.target.value })}><option value="student">Student</option><option value="owner">PG Owner</option><option value="admin">Admin</option></select></Field>
            <Field label={modal._id ? 'New password (leave blank to keep)' : 'Password'}><input type="password" minLength="6" required={!modal._id} value={modal.password} onChange={(e) => setModal({ ...modal, password: e.target.value })} /></Field>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </form>
        </Modal>)}
    </>
  );
}
