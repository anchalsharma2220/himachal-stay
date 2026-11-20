import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DISTRICTS } from '../constants';
import { Field } from './ui';

export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name || '', phone: user.phone || '', district: user.district || '', address: user.address || '', organization: user.organization || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const orgLabel = user.role === 'student' ? 'College / Institute' : user.role === 'owner' ? 'Business / Property name' : 'Organization';

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.put('/auth/me', f); setUser(data.user); toast('Profile updated'); } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api.put('/auth/me/password', pw); toast('Password changed'); setPw({ currentPassword: '', newPassword: '' }); } catch (err) { toast(errMsg(err), 'error'); }
  };
  return (
    <>
      <h1 className="page-title">My Profile</h1>
      <div className="two-col">
        <form className="form card-box" onSubmit={save}>
          <h3>Personal details</h3>
          <Field label="Full name"><input required value={f.name} onChange={set('name')} /></Field>
          <Field label="Email"><input value={user.email} disabled /></Field>
          <Field label="Phone"><input required pattern="[0-9+\-\s]{10,15}" value={f.phone} onChange={set('phone')} /></Field>
          <Field label="District"><select value={f.district} onChange={set('district')}><option value="">Select district</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
          <Field label={orgLabel}><input value={f.organization} onChange={set('organization')} /></Field>
          <Field label="Address"><textarea rows="2" value={f.address} onChange={set('address')} /></Field>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</button>
        </form>
        <form className="form card-box" onSubmit={changePw}>
          <h3>Change password</h3>
          <Field label="Current password"><input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
          <Field label="New password"><input type="password" required minLength="6" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
          <button className="btn btn-primary">Update Password</button>
        </form>
      </div>
    </>
  );
}
