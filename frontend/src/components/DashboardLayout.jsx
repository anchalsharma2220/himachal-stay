import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Heart, User, Building2, PlusCircle, BedDouble, Inbox, Users, ListChecks, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MENUS = {
  student: [
    ['/student', 'Dashboard', LayoutDashboard, true], ['/pgs', 'Search PGs', Search], ['/student/bookings', 'My Bookings', CalendarDays],
    ['/student/favourites', 'Favourites', Heart], ['/student/profile', 'My Profile', User],
  ],
  owner: [
    ['/owner', 'Dashboard', LayoutDashboard, true], ['/owner/pgs', 'My PGs', Building2], ['/owner/pgs/new', 'Add PG', PlusCircle],
    ['/owner/rooms', 'Manage Rooms', BedDouble], ['/owner/bookings', 'Booking Requests', Inbox], ['/owner/profile', 'Owner Profile', User],
  ],
  admin: [
    ['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/users', 'Users', Users], ['/admin/listings', 'PG Listings', Building2],
    ['/admin/bookings', 'Bookings', ListChecks], ['/admin/messages', 'Messages', MessageSquare], ['/admin/profile', 'My Profile', User],
  ],
};
const TITLES = { student: 'Student / Tenant', owner: 'PG Owner', admin: 'Administrator' };

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <div className="container dash">
      <aside className="dash-side">
        <div className="who"><div className="avatar">{user.name[0]}</div><div><b>{user.name}</b><small>{TITLES[user.role]}</small></div></div>
        <nav>
          {MENUS[user.role].map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end}><Icon size={17} /> {label}</NavLink>
          ))}
        </nav>
      </aside>
      <main className="dash-main"><Outlet /></main>
    </div>
  );
}
