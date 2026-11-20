import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api';
import { Field } from '../components/ui';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: sp.get('role') === 'owner' ? 'owner' : 'student' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to={`/${user.role}`} replace />;
  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (f.password.length < 6) return setError('Password must be at least 6 characters');
    if (f.password !== f.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      const u = await register({ name: f.name, email: f.email, phone: f.phone, password: f.password, role: f.role });
      toast('Account created successfully!'); nav(`/${u.role}`, { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <form className="auth-card form" onSubmit={submit}>
        <h1>Create account</h1>
        {error && <div className="alert error">{error}</div>}
        <div className="role-pick">
          {[['student', 'Student / Tenant'], ['owner', 'PG Owner']].map(([v, l]) => <button type="button" key={v} className={f.role === v ? 'on' : ''} onClick={() => setF({ ...f, role: v })}>{l}</button>)}
        </div>
        <Field label="Full name"><input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Phone"><input type="tel" required pattern="[0-9+\-\s]{10,15}" title="10-15 digits" value={f.phone} onChange={set('phone')} /></Field>
        <div className="two"><Field label="Password"><input type="password" required minLength="6" value={f.password} onChange={set('password')} /></Field>
          <Field label="Confirm"><input type="password" required value={f.confirm} onChange={set('confirm')} /></Field></div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
        <p className="center">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
