import { X } from 'lucide-react';

export const Spinner = ({ label = 'Loading...' }) => (
  <div className="center-box"><div className="spinner" /><p className="muted">{label}</p></div>
);
export const ErrorBox = ({ message, onRetry }) => (
  <div className="alert error">{message}{onRetry && <button className="btn btn-sm btn-outline" onClick={onRetry}>Retry</button>}</div>
);
export const Empty = ({ title, text, children }) => (
  <div className="empty"><h3>{title}</h3>{text && <p className="muted">{text}</p>}{children}</div>
);
export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
export const StatusBadge = ({ status }) => <span className={`badge st-${String(status).toLowerCase()}`}>{status}</span>;
export const Field = ({ label, children, hint }) => (
  <label className="field"><span>{label}</span>{children}{hint && <small className="muted">{hint}</small>}</label>
);
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button className="btn btn-sm btn-outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}
export function BarList({ items, color }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="barlist">
      {items.map((i) => (
        <div className="bar-row" key={i.label}>
          <span className="bar-label">{i.label}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(i.value / max) * 100}%`, background: color }} /></div>
          <b>{i.value}</b>
        </div>
      ))}
    </div>
  );
}
export const StatCard = ({ icon: Icon, label, value, tone = 'blue' }) => (
  <div className="stat-card"><div className={`stat-ico ${tone}`}><Icon size={22} /></div><div><h3>{value}</h3><p>{label}</p></div></div>
);
