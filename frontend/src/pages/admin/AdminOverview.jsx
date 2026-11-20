import { GraduationCap, Building, Home, CalendarCheck } from 'lucide-react';
import api from '../../api';
import { useFetch } from '../../hooks';
import { fmtDateTime } from '../../constants';
import { Spinner, ErrorBox, StatCard, BarList, Empty } from '../../components/ui';
import BookingTable from '../../components/BookingTable';

export default function AdminOverview() {
  const { data, loading, error, reload } = useFetch(() => api.get('/stats/admin').then((r) => r.data), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const c = data.counts;
  return (
    <>
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="stats-row">
        <StatCard icon={GraduationCap} label="Total Students" value={c.students} />
        <StatCard icon={Building} label="PG Owners" value={c.owners} tone="green" />
        <StatCard icon={Home} label={`Total PGs (${c.pendingPgs} pending approval)`} value={c.pgs} tone="orange" />
        <StatCard icon={CalendarCheck} label={`Bookings (${c.pendingBookings} pending)`} value={c.bookings} tone="purple" />
      </div>
      <div className="two-col">
        <div className="card-box"><h3>Bookings by status</h3><BarList items={Object.entries(data.bookingsByStatus).map(([label, value]) => ({ label, value }))} /></div>
        <div className="card-box"><h3>Bookings - last 6 months</h3><BarList color="#10b981" items={data.monthly.map((m) => ({ label: m.label, value: m.count }))} /></div>
        <div className="card-box"><h3>Listings by district</h3><BarList color="#8b5cf6" items={data.pgsByDistrict.map((d) => ({ label: d.name, value: d.count }))} /></div>
        <div className="card-box"><h3>Recent activities</h3>
          {data.activities.length ? <ul className="activity">{data.activities.map((a) => <li key={a._id}><span>{a.action}</span><small>{fmtDateTime(a.createdAt)}</small></li>)}</ul> : <Empty title="No activity yet" />}</div>
      </div>
      <div className="card-box"><h3>Recent bookings</h3>{data.recentBookings.length ? <BookingTable rows={data.recentBookings} show="tenant" /> : <Empty title="No bookings yet" />}</div>
    </>
  );
}
