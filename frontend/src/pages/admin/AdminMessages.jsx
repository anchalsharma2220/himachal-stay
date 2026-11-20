import { Trash2, MailOpen } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { fmtDateTime } from '../../constants';
import { Spinner, ErrorBox, Empty } from '../../components/ui';

export default function AdminMessages() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.get('/contact').then((r) => r.data.data), []);
  const act = async (fn, ok) => { try { await fn(); if (ok) toast(ok); await reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <>
      <h1 className="page-title">Contact Messages</h1>
      {!data.length ? <Empty title="No messages yet" /> : data.map((m) => (
        <div key={m._id} className={`card-box msg ${m.isRead ? '' : 'unread'}`}>
          <div className="sec-head"><div><b>{m.subject}</b><br /><small className="muted">{m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {fmtDateTime(m.createdAt)}</small></div>
            <div className="actions">{!m.isRead && <button className="btn btn-sm btn-outline" onClick={() => act(() => api.patch(`/contact/${m._id}/read`), 'Marked as read')}><MailOpen size={14} /> Mark read</button>}
              <button className="icon-btn danger" onClick={() => window.confirm('Delete this message?') && act(() => api.delete(`/contact/${m._id}`), 'Message deleted')}><Trash2 size={16} /></button></div></div>
          <p>{m.message}</p></div>))}
    </>
  );
}
