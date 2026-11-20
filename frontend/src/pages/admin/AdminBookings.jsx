import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, Empty } from '../../components/ui';
import BookingTable from '../../components/BookingTable';

export default function AdminBookings() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/bookings', { params: { status } }).then((r) => r.data.data), [status]);
  const act = async (fn, ok) => { try { await fn(); toast(ok); await reload(); } catch (e) { toast(errMsg(e), 'error'); } };

  return (
    <>
      <h1 className="page-title">All Bookings</h1>
      <div className="tabs">{['', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s || 'All'}</button>)}</div>
      <div className="card-box">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data.length ? <Empty title="No bookings found" /> : (
          <BookingTable rows={data} show="admin" actions={(b) => (
            <>
              <select value={b.status} onChange={(e) => act(() => api.patch(`/bookings/${b._id}/status`, { status: e.target.value }), 'Booking updated')}>
                {['Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</select>
              <button className="icon-btn danger" title="Delete" onClick={() => window.confirm('Delete this booking record?') && act(() => api.delete(`/bookings/${b._id}`), 'Booking deleted')}><Trash2 size={16} /></button>
            </>)} />)}
      </div>
    </>
  );
}
