import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PGDetails from './pages/PGDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import StudentOverview from './pages/student/StudentOverview';
import MyBookings from './pages/student/MyBookings';
import Favourites from './pages/student/Favourites';
import OwnerOverview from './pages/owner/OwnerOverview';
import OwnerPGs from './pages/owner/OwnerPGs';
import PGForm from './pages/owner/PGForm';
import ManageRooms from './pages/owner/ManageRooms';
import OwnerBookings from './pages/owner/OwnerBookings';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminMessages from './pages/admin/AdminMessages';

const NotFound = () => (
  <div className="container section center"><h1>404</h1><p className="muted">This page does not exist.</p><Link to="/" className="btn btn-primary">Go home</Link></div>
);

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const guard = (role, el) => <ProtectedRoute roles={[role]}>{el}</ProtectedRoute>;
  return (
    <>
      <Navbar />
      <div className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pgs" element={<Listings />} />
          <Route path="/pgs/:id" element={<PGDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student" element={guard('student', <DashboardLayout />)}>
            <Route index element={<StudentOverview />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/owner" element={guard('owner', <DashboardLayout />)}>
            <Route index element={<OwnerOverview />} />
            <Route path="pgs" element={<OwnerPGs />} />
            <Route path="pgs/new" element={<PGForm />} />
            <Route path="pgs/:id/edit" element={<PGForm />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/admin" element={guard('admin', <DashboardLayout />)}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="listings/:id/edit" element={<PGForm />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
