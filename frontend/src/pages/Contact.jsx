import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import api, { errMsg } from '../api';
import { useToast } from '../context/ToastContext';
import { Field } from '../components/ui';

export default function Contact() {
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.post('/contact', f); toast(data.message); setF({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="container section contact">
      <div>
        <h1>Contact Us</h1>
        <p className="lead">Questions about a listing, your account or listing your own property? Send us a message.</p>
        <p><MapPin size={16} /> Hamirpur, Himachal Pradesh</p>
        <p><Mail size={16} /> support@himachalstay.com</p>
        <p><Phone size={16} /> +91 98050 00001</p>
      </div>
      <form className="form card-box" onSubmit={submit}>
        <Field label="Your name"><input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Subject"><input value={f.subject} onChange={set('subject')} /></Field>
        <Field label="Message"><textarea rows="5" required minLength="10" value={f.message} onChange={set('message')} /></Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send Message'}</button>
      </form>
    </div>
  );
}
