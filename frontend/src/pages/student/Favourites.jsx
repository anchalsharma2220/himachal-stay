import { Link } from 'react-router-dom';
import api from '../../api';
import { useFetch } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorBox, Empty } from '../../components/ui';
import PGCard from '../../components/PGCard';

export default function Favourites() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => api.get('/favorites').then((r) => r.data.data), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  // card hearts update user.favorites; hide anything un-saved without refetching
  const rows = data.filter((p) => user.favorites.includes(p._id));
  return (
    <>
      <h1 className="page-title">Favourite Properties</h1>
      {rows.length ? <div className="grid g3">{rows.map((p) => <PGCard key={p._id} pg={p} />)}</div>
        : <Empty title="No favourites yet" text="Tap the heart on any property to save it here."><Link to="/pgs" className="btn btn-primary">Browse PGs</Link></Empty>}
    </>
  );
}
