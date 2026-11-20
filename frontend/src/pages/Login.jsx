import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api';
import { Field } from '../components/ui';

const DEMO = [['Student', 'student1@himachalstay.com', 'Student@123'], ['PG Owner', 'owner1@himachalstay.com', 'Owner@123'], ['Admin', 'admin@himachalstay.com', 'Admin@123']];

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}`} replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const u = await login(f.email, f.password);
      toast(`Welcome back, ${u.name.split(' ')[0]}!`);
      nav(loc.state?.from || `/${u.role}`, { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <form className="auth-card form" onSubmit={submit}>
        <h1>Login</h1><p className="muted">Sign in to book rooms or manage your listings.</p>
        {error && <div className="alert error">{error}</div>}
        <Field label="Email"><input type="email" required autoFocus value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        <p className="center">New here? <Link to="/register">Create an account</Link></p>
        <div className="demo"><small>Demo accounts (click to fill)</small>
          <div>{DEMO.map(([l, e, p]) => <button type="button" key={l} className="chip" onClick={() => setF({ email: e, password: p })}>{l}</button>)}</div></div>
      </form>
    </div>
  );
}
