import { Link } from 'react-router-dom';
import { Building2, BedDouble, Inbox, IndianRupee } from 'lucide-react';
import api from '../../api';
import { useFetch } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { fmt } from '../../constants';
import { Spinner, ErrorBox, StatCard, Empty } from '../../components/ui';
import BookingTable from '../../components/BookingTable';

export default function OwnerOverview() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => api.get('/stats/owner').then((r) => r.data), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const c = data.counts;
  return (
    <>
      <h1 className="page-title">Owner Dashboard - {user.name}</h1>
      <div className="stats-row">
        <StatCard icon={Building2} label={`Total PGs (${c.pendingPgs} awaiting approval)`} value={c.pgs} />
        <StatCard icon={BedDouble} label={`Room types (${c.vacancies} vacancies)`} value={c.rooms} tone="green" />
        <StatCard icon={Inbox} label="Pending Requests" value={c.pendingRequests} tone="orange" />
        <StatCard icon={IndianRupee} label="Monthly rent from approved" value={fmt(c.monthlyRevenue)} tone="purple" />
      </div>
      <div className="card-box">
        <div className="sec-head"><h3>Latest booking requests</h3><Link to="/owner/bookings">Manage →</Link></div>
        {data.recentBookings.length ? <BookingTable rows={data.recentBookings} show="tenant" /> : <Empty title="No requests yet" text="Add a PG and wait for admin approval to start receiving requests."><Link to="/owner/pgs/new" className="btn btn-primary">Add PG</Link></Empty>}
      </div>
    </>
  );
}
