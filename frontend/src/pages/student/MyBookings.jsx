import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useFetch } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, Empty } from '../../components/ui';
import BookingTable from '../../components/BookingTable';

export default function MyBookings() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.get('/bookings/my').then((r) => r.data.data), []);
  const [tab, setTab] = useState('All');
  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking request?')) return;
    try { await api.patch(`/bookings/${id}/cancel`); toast('Booking cancelled'); reload(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const rows = tab === 'All' ? data : data.filter((b) => b.status === tab);
  return (
    <>
      <h1 className="page-title">My Bookings</h1>
      <div className="tabs">{['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t} ({t === 'All' ? data.length : data.filter((b) => b.status === t).length})</button>)}</div>
      <div className="card-box">
        {rows.length ? <BookingTable rows={rows} actions={(b) => b.status === 'Pending'
          ? <button className="btn btn-sm btn-danger" onClick={() => cancel(b._id)}>Cancel</button> : <span className="muted">-</span>} />
          : <Empty title="No bookings here"><Link to="/pgs" className="btn btn-primary">Search PGs</Link></Empty>}
      </div>
    </>
  );
}
