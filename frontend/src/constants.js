export const DISTRICTS = ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul & Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'];
export const FACILITIES = ['Wi-Fi', 'Food Included', 'Laundry', 'CCTV', 'Parking', 'Attached Bath', 'Study Table', 'Hot Water', 'Power Backup', 'AC', 'TV', 'Security'];
export const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Four Sharing'];
export const HERO_IMG = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80';

export const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');

const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#93c5fd"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><text x="300" y="210" font-family="Arial" font-size="26" fill="#1e40af" text-anchor="middle">PG &amp; Room</text></svg>'
);
export const imgSrc = (u) => (!u ? FALLBACK : /^https?:|^data:/.test(u) ? u : `${import.meta.env.VITE_API_ORIGIN || ''}${u}`);
export const onImgError = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; };
export const toISODate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
