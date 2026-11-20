import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useToast } from '../../context/ToastContext';
import { DISTRICTS, FACILITIES, ROOM_TYPES, imgSrc, onImgError } from '../../constants';
import { Spinner, ErrorBox, Field } from '../../components/ui';

const emptyRoom = { type: 'Double', rent: '', capacity: 2, totalUnits: 1, available: 1 };
const CAP = { Single: 1, Double: 2, Triple: 3, 'Four Sharing': 4 };

export default function PGForm() {
  const { id } = useParams();
  const edit = Boolean(id);
  const nav = useNavigate();
  const toast = useToast();
  const base = useLocation().pathname.startsWith('/admin') ? '/admin/listings' : '/owner/pgs';
  const [f, setF] = useState({ name: '', district: '', location: '', address: '', description: '', propertyType: 'PG', gender: 'Boys', nearby: '', contactPhone: '', facilities: [], rules: '', imageUrls: '' });
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([{ ...emptyRoom }]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!edit) return;
    api.get(`/pgs/${id}`).then(({ data }) => {
      const p = data.data;
      setF({ name: p.name, district: p.district, location: p.location, address: p.address, description: p.description, propertyType: p.propertyType, gender: p.gender, nearby: p.nearby || '', contactPhone: p.contactPhone || '', facilities: p.facilities, rules: (p.rules || []).join('\n'), imageUrls: '' });
      setImages(p.images || []);
    }).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [id, edit]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleFac = (x) => setF({ ...f, facilities: f.facilities.includes(x) ? f.facilities.filter((y) => y !== x) : [...f.facilities, x] });
  const setRoom = (i, k, v) => setRooms(rooms.map((r, j) => (j === i ? { ...r, [k]: v, ...(k === 'type' ? { capacity: CAP[v] } : {}) } : r)));

  const removeImage = async (url) => {
    try { const { data } = await api.delete(`/pgs/${id}/images`, { data: { url } }); setImages(data.data.images); toast('Image removed'); } catch (e) { toast(errMsg(e), 'error'); }
  };

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const urls = f.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean);
      const payload = { ...f, images: edit ? [...images, ...urls] : urls };
      delete payload.imageUrls;
      let pgId = id; let msg;
      if (edit) { const r = await api.put(`/pgs/${id}`, payload); msg = r.data.message; }
      else {
        const r = await api.post('/pgs', { ...payload, rooms });
        pgId = r.data.data._id; msg = r.data.message;
      }
      if (files.length) {
        const fd = new FormData(); files.forEach((x) => fd.append('images', x));
        try { await api.post(`/pgs/${pgId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); }
        catch (up) { toast(`Saved, but image upload failed: ${errMsg(up)}`, 'error'); }
      }
      toast(msg); nav(base);
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <h1 className="page-title">{edit ? 'Edit Listing' : 'Add New PG / Room'}</h1>
      <form className="form card-box" onSubmit={submit}>
        <div className="two">
          <Field label="Property name"><input required minLength="3" value={f.name} onChange={set('name')} placeholder="e.g. Green View Boys PG" /></Field>
          <Field label="District"><select required value={f.district} onChange={set('district')}><option value="">Select district</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Town / area"><input required value={f.location} onChange={set('location')} placeholder="e.g. Dharamshala" /></Field>
          <Field label="Contact phone"><input value={f.contactPhone} onChange={set('contactPhone')} placeholder="Defaults to your profile phone" /></Field>
          <Field label="Property type"><select value={f.propertyType} onChange={set('propertyType')}><option value="PG">PG</option><option value="Room">Room</option></select></Field>
          <Field label="Suitable for"><select value={f.gender} onChange={set('gender')}><option>Boys</option><option>Girls</option><option>Unisex</option></select></Field>
        </div>
        <Field label="Full address"><input required value={f.address} onChange={set('address')} /></Field>
        <Field label="Nearby landmark / distance"><input value={f.nearby} onChange={set('nearby')} placeholder="e.g. 1.5 km from NIT Hamirpur" /></Field>
        <Field label="Description" hint="At least 20 characters"><textarea required minLength="20" rows="4" value={f.description} onChange={set('description')} /></Field>
        <div className="field"><span>Facilities</span><div className="checks cols">{FACILITIES.map((x) => <label key={x}><input type="checkbox" checked={f.facilities.includes(x)} onChange={() => toggleFac(x)} /> {x}</label>)}</div></div>
        <Field label="House rules (one per line)"><textarea rows="3" value={f.rules} onChange={set('rules')} /></Field>

        {!edit && (
          <div className="field"><span>Room types & rent</span>
            {rooms.map((r, i) => (
              <div className="room-row" key={i}>
                <select value={r.type} onChange={(e) => setRoom(i, 'type', e.target.value)}>{ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                <input type="number" required min="500" placeholder="Rent ₹/month" value={r.rent} onChange={(e) => setRoom(i, 'rent', e.target.value)} />
                <input type="number" required min="1" max="10" title="Capacity per room" placeholder="Capacity" value={r.capacity} onChange={(e) => setRoom(i, 'capacity', e.target.value)} />
                <input type="number" required min="1" title="Total rooms of this type" placeholder="Units" value={r.totalUnits} onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, totalUnits: e.target.value, available: e.target.value } : x)))} />
                {rooms.length > 1 && <button type="button" className="icon-btn danger" onClick={() => setRooms(rooms.filter((_, j) => j !== i))}><Trash2 size={16} /></button>}
              </div>))}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setRooms([...rooms, { ...emptyRoom }])}><Plus size={14} /> Add another room type</button>
            <small className="muted">Rent per month · capacity per room · number of rooms of this type</small>
          </div>)}
        {edit && <p className="muted">Manage room types, rent and availability from the <b>Manage Rooms</b> page.</p>}

        <div className="field"><span>Property images</span>
          {edit && images.length > 0 && <div className="img-grid">{images.map((u) => <div key={u}><img src={imgSrc(u)} alt="" onError={onImgError} /><button type="button" onClick={() => removeImage(u)} aria-label="Remove image"><X size={14} /></button></div>)}</div>}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles([...e.target.files])} />
          <small className="muted">Upload JPG / PNG / WEBP, up to 5 MB each (max 8 images total){files.length ? ` · ${files.length} selected` : ''}</small>
          <textarea rows="2" placeholder="...or paste image URLs, one per line" value={f.imageUrls} onChange={set('imageUrls')} />
        </div>
        <div className="form-actions"><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : edit ? 'Save Changes' : 'Submit Listing'}</button><button type="button" className="btn btn-outline" onClick={() => nav(base)}>Cancel</button></div>
      </form>
    </>
  );
}
