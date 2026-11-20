import { Link } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, Heart } from 'lucide-react';
import api from '../../api';
import { useFetch } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorBox, StatCard, Empty } from '../../components/ui';
import BookingTable from '../../components/BookingTable';

export default function StudentOverview() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => api.get('/stats/student').then((r) => r.data), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const c = data.counts;
  return (
    <>
      <h1 className="page-title">Welcome, {user.name.split(' ')[0]}</h1>
      <div className="stats-row">
        <StatCard icon={CalendarDays} label="Total Bookings" value={c.total} />
        <StatCard icon={Clock} label="Pending Requests" value={c.Pending} tone="orange" />
        <StatCard icon={CheckCircle2} label="Approved" value={c.Approved} tone="green" />
        <StatCard icon={Heart} label="Favourites" value={c.favourites} tone="pink" />
      </div>
      <div className="card-box">
        <div className="sec-head"><h3>Recent booking requests</h3><Link to="/student/bookings">View all →</Link></div>
        {data.recentBookings.length ? <BookingTable rows={data.recentBookings} /> : <Empty title="No bookings yet" text="Find a PG that suits you and send your first request."><Link to="/pgs" className="btn btn-primary">Search PGs</Link></Empty>}
      </div>
    </>
  );
}
