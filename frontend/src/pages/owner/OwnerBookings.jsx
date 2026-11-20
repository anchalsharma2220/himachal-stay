import { useState } from 'react';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, Empty } from '../../components/ui';
import BookingTable from '../../components/BookingTable';

export default function OwnerBookings() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.get('/bookings/owner').then((r) => r.data.data), []);
  const [tab, setTab] = useState('Pending');
  const [busyId, setBusyId] = useState('');

  const decide = async (b, status) => {
    const note = status === 'Rejected' ? window.prompt('Reason for rejection (optional):', '') : '';
    if (note === null) return;
    setBusyId(b._id);
    try { await api.patch(`/bookings/${b._id}/status`, { status, ownerNote: note }); toast(`Booking ${status.toLowerCase()}`); await reload(); }
    catch (e) { toast(errMsg(e), 'error'); } finally { setBusyId(''); }
  };
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const rows = tab === 'All' ? data : data.filter((b) => b.status === tab);
  return (
    <>
      <h1 className="page-title">Booking Requests</h1>
      <div className="tabs">{['Pending', 'Approved', 'Rejected', 'Cancelled', 'All'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t} ({t === 'All' ? data.length : data.filter((b) => b.status === t).length})</button>)}</div>
      <div className="card-box">
        {rows.length ? <BookingTable rows={rows} show="tenant" actions={(b) => (
          <>
            {b.status === 'Pending' && <button className="btn btn-sm btn-success" disabled={busyId === b._id} onClick={() => decide(b, 'Approved')}>Approve</button>}
            {['Pending', 'Approved'].includes(b.status) && <button className="btn btn-sm btn-danger" disabled={busyId === b._id} onClick={() => decide(b, 'Rejected')}>Reject</button>}
            {['Rejected', 'Cancelled'].includes(b.status) && <span className="muted">-</span>}
          </>)} /> : <Empty title={`No ${tab.toLowerCase()} requests`} />}
      </div>
    </>
  );
}
