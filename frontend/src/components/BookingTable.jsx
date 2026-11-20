import { Link } from 'react-router-dom';
import { fmt, fmtDate } from '../constants';
import { StatusBadge } from './ui';

// Shared list used in dashboards. `actions(booking)` renders per-row controls.
export default function BookingTable({ rows, show = 'pg', actions }) {
  return (
    <div className="table-wrap"><table className="table">
      <thead><tr>
        <th>{show === 'pg' ? 'Property' : 'Tenant'}</th>{show === 'admin' && <th>Property</th>}<th>Room</th><th>Rent</th><th>Move-in</th><th>Requested</th><th>Status</th>{actions && <th>Actions</th>}
      </tr></thead>
      <tbody>{rows.map((b) => (
        <tr key={b._id}>
          <td>{show === 'pg'
            ? <>{b.pg ? <Link to={`/pgs/${b.pg._id}`}><b>{b.pg.name}</b></Link> : <i>Deleted listing</i>}<br /><small className="muted">{b.pg?.location}, {b.pg?.district}</small></>
            : <><b>{b.tenant?.name || 'Deleted user'}</b><br /><small className="muted">{b.tenant?.phone} · {b.tenant?.email}</small></>}</td>
          {show === 'admin' && <td>{b.pg?.name || '-'}<br /><small className="muted">Owner: {b.owner?.name}</small></td>}
          <td>{b.roomType}<br /><small className="muted">{b.durationMonths} mo</small></td>
          <td>{fmt(b.rent)}</td><td>{fmtDate(b.moveInDate)}</td><td>{fmtDate(b.createdAt)}</td>
          <td><StatusBadge status={b.status} />{b.ownerNote && <><br /><small className="muted">{b.ownerNote}</small></>}</td>
          {actions && <td className="actions">{actions(b)}</td>}
        </tr>))}</tbody>
    </table></div>
  );
}
