const fs = require('fs');
const path = require('path');
const PG = require('../models/PG');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { DISTRICTS, FACILITIES } = require('../config/constants');
const { ApiError, asyncHandler, pick, escapeRegex, logActivity, num } = require('../utils/helpers');
const { uploadDir } = require('../middleware/upload');

const PG_FIELDS = ['name', 'district', 'location', 'address', 'description', 'propertyType', 'gender', 'facilities', 'rules', 'nearby', 'contactPhone', 'images'];

const cleanPayload = (body) => {
  const d = pick(body, PG_FIELDS);
  if (d.facilities !== undefined) d.facilities = [].concat(d.facilities).filter((f) => FACILITIES.includes(f));
  if (d.rules !== undefined) d.rules = (Array.isArray(d.rules) ? d.rules : String(d.rules).split('\n')).map((r) => String(r).trim()).filter(Boolean).slice(0, 15);
  if (d.images !== undefined) d.images = [].concat(d.images).map((i) => String(i).trim()).filter(Boolean).slice(0, 8);
  return d;
};

const cleanRoom = (b = {}) => {
  const r = pick(b, ['type', 'rent', 'capacity', 'totalUnits', 'available']);
  ['rent', 'capacity', 'totalUnits', 'available'].forEach((k) => { if (r[k] !== undefined) r[k] = Number(r[k]); });
  return r;
};

const loadOwned = async (req) => {
  const pg = await PG.findById(req.params.id);
  if (!pg) throw new ApiError(404, 'Listing not found');
  if (req.user.role !== 'admin' && String(pg.owner) !== String(req.user._id)) throw new ApiError(403, 'You can only manage your own listings');
  return pg;
};

const removeLocalFile = (url) => {
  if (url && url.startsWith('/uploads/')) fs.unlink(path.join(uploadDir, path.basename(url)), () => {});
};

// ---------- public ----------
exports.list = asyncHandler(async (req, res) => {
  const { district, propertyType, gender, facilities, available, roomType, search, sort = 'popular' } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));
  const q = { status: 'approved' };
  if (district && DISTRICTS.includes(district)) q.district = district;
  if (['PG', 'Room'].includes(propertyType)) q.propertyType = propertyType;
  if (['Boys', 'Girls', 'Unisex'].includes(gender)) q.gender = gender;
  if (num(req.query.minRent) !== null) q.maxRent = { $gte: num(req.query.minRent) };
  if (num(req.query.maxRent) !== null) q.minRent = { $lte: num(req.query.maxRent) };
  if (facilities) {
    const list = String(facilities).split(',').filter((f) => FACILITIES.includes(f));
    if (list.length) q.facilities = { $all: list };
  }
  if (available === 'true') q.totalAvailable = { $gt: 0 };
  if (roomType) q['rooms.type'] = String(roomType);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    q.$or = [{ name: rx }, { location: rx }, { address: rx }, { nearby: rx }];
  }
  const sortMap = { popular: { rating: -1, reviewsCount: -1 }, priceLow: { minRent: 1 }, priceHigh: { minRent: -1 }, newest: { createdAt: -1 } };
  const [data, total] = await Promise.all([
    PG.find(q).sort(sortMap[sort] || sortMap.popular).skip((page - 1) * limit).limit(limit).populate('owner', 'name'),
    PG.countDocuments(q),
  ]);
  res.json({ data, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

exports.featured = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Number(req.query.limit) || 6);
  let data = await PG.find({ status: 'approved', featured: true }).sort('-rating').limit(limit);
  if (data.length < limit) {
    const ids = data.map((d) => d._id);
    const more = await PG.find({ status: 'approved', _id: { $nin: ids } }).sort('-rating').limit(limit - data.length);
    data = data.concat(more);
  }
  res.json({ data });
});

exports.publicStats = asyncHandler(async (_req, res) => {
  const [pgs, owners, students, bookings, byDistrict] = await Promise.all([
    PG.countDocuments({ status: 'approved' }),
    User.countDocuments({ role: 'owner', isActive: true }),
    User.countDocuments({ role: 'student', isActive: true }),
    Booking.countDocuments(),
    PG.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: '$district', count: { $sum: 1 }, minRent: { $min: '$minRent' } } }]),
  ]);
  const map = Object.fromEntries(byDistrict.map((d) => [d._id, d]));
  res.json({
    pgs, owners, students, bookings,
    districts: DISTRICTS.map((name) => ({ name, count: map[name]?.count || 0, minRent: map[name]?.minRent || 0 })),
  });
});

exports.getOne = asyncHandler(async (req, res) => {
  const pg = await PG.findById(req.params.id).populate('owner', 'name email phone');
  if (!pg) throw new ApiError(404, 'Listing not found');
  const canSee = pg.status === 'approved' || (req.user && (req.user.role === 'admin' || String(pg.owner._id) === String(req.user._id)));
  if (!canSee) throw new ApiError(404, 'Listing not found');
  res.json({ data: pg });
});

// ---------- owner / admin ----------
exports.mine = asyncHandler(async (req, res) => {
  const pgs = await PG.find({ owner: req.user._id }).sort('-createdAt');
  const pending = await Booking.aggregate([{ $match: { owner: req.user._id, status: 'Pending' } }, { $group: { _id: '$pg', n: { $sum: 1 } } }]);
  const pm = Object.fromEntries(pending.map((p) => [String(p._id), p.n]));
  res.json({ data: pgs.map((p) => ({ ...p.toJSON(), pendingRequests: pm[String(p._id)] || 0 })) });
});

exports.adminAll = asyncHandler(async (req, res) => {
  const q = {};
  if (['pending', 'approved', 'rejected'].includes(req.query.status)) q.status = req.query.status;
  if (req.query.district && DISTRICTS.includes(req.query.district)) q.district = req.query.district;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    q.$or = [{ name: rx }, { location: rx }];
  }
  const data = await PG.find(q).sort('-createdAt').populate('owner', 'name email phone');
  res.json({ data, total: data.length });
});

exports.create = asyncHandler(async (req, res) => {
  const rooms = (Array.isArray(req.body.rooms) ? req.body.rooms : []).map((r) => {
    const room = cleanRoom(r);
    if (room.available === undefined) room.available = room.totalUnits ?? 1;
    if (room.available > (room.totalUnits ?? 1)) room.totalUnits = room.available;
    return room;
  });
  if (!rooms.length) throw new ApiError(400, 'Add at least one room type with its rent');
  const isAdmin = req.user.role === 'admin';
  const pg = await PG.create({
    ...cleanPayload(req.body),
    rooms,
    owner: isAdmin && req.body.owner ? req.body.owner : req.user._id,
    contactPhone: req.body.contactPhone || req.user.phone,
    status: isAdmin ? 'approved' : 'pending',
  });
  logActivity(req.user, `${req.user.name} added listing "${pg.name}" (${pg.district})`, 'listing');
  res.status(201).json({ data: pg, message: isAdmin ? 'Listing published' : 'Listing submitted for admin approval' });
});

exports.update = asyncHandler(async (req, res) => {
  const pg = await loadOwned(req);
  Object.assign(pg, cleanPayload(req.body));
  if (req.user.role === 'owner' && pg.status === 'rejected') pg.status = 'pending'; // resubmission
  await pg.save();
  logActivity(req.user, `${req.user.name} updated listing "${pg.name}"`, 'listing');
  res.json({ data: pg, message: 'Listing updated' });
});

exports.remove = asyncHandler(async (req, res) => {
  const pg = await loadOwned(req);
  await Booking.deleteMany({ pg: pg._id });
  await User.updateMany({ favorites: pg._id }, { $pull: { favorites: pg._id } });
  pg.images.forEach(removeLocalFile);
  await pg.deleteOne();
  logActivity(req.user, `${req.user.name} deleted listing "${pg.name}"`, 'listing');
  res.json({ message: 'Listing deleted' });
});

exports.setStatus = asyncHandler(async (req, res) => {
  const pg = await PG.findById(req.params.id);
  if (!pg) throw new ApiError(404, 'Listing not found');
  const { status, featured } = req.body;
  if (status !== undefined) {
    if (!['pending', 'approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');
    pg.status = status;
  }
  if (featured !== undefined) pg.featured = Boolean(featured);
  await pg.save();
  logActivity(req.user, `Admin set "${pg.name}" to ${pg.status}${pg.featured ? ' (featured)' : ''}`, 'listing');
  res.json({ data: pg, message: 'Listing updated' });
});

exports.uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  try {
    const pg = await loadOwned(req);
    if (!files.length) throw new ApiError(400, 'Select at least one image');
    if (pg.images.length + files.length > 8) throw new ApiError(400, 'A listing can have at most 8 images');
    files.forEach((f) => pg.images.push(`/uploads/${f.filename}`));
    await pg.save();
    res.json({ data: pg, message: 'Images uploaded' });
  } catch (e) {
    files.forEach((f) => fs.unlink(f.path, () => {}));
    throw e;
  }
});

exports.removeImage = asyncHandler(async (req, res) => {
  const pg = await loadOwned(req);
  const { url } = req.body;
  if (!url || !pg.images.includes(url)) throw new ApiError(404, 'Image not found on this listing');
  pg.images = pg.images.filter((i) => i !== url);
  await pg.save();
  removeLocalFile(url);
  res.json({ data: pg, message: 'Image removed' });
});

// ---------- rooms ----------
exports.addRoom = asyncHandler(async (req, res) => {
  const pg = await loadOwned(req);
  const room = cleanRoom(req.body);
  if (room.totalUnits === undefined) room.totalUnits = 1;
  if (room.available === undefined) room.available = room.totalUnits;
  if (room.available > room.totalUnits) throw new ApiError(400, 'Available cannot exceed total units');
  pg.rooms.push(room);
  await pg.save();
  res.status(201).json({ data: pg, message: 'Room added' });
});

exports.updateRoom = asyncHandler(async (req, res) => {
  const pg = await loadOwned(req);
  const room = pg.rooms.id(req.params.roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  room.set(cleanRoom(req.body));
  if (room.available > room.totalUnits) throw new ApiError(400, 'Available cannot exceed total units');
  await pg.save();
  res.json({ data: pg, message: 'Room updated' });
});

exports.deleteRoom = asyncHandler(async (req, res) => {
  const pg = await loadOwned(req);
  const room = pg.rooms.id(req.params.roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  const active = await Booking.countDocuments({ pg: pg._id, room: room._id, status: { $in: ['Pending', 'Approved'] } });
  if (active) throw new ApiError(400, 'This room type has active booking requests. Resolve them before deleting.');
  pg.rooms.pull({ _id: room._id });
  await pg.save();
  res.json({ data: pg, message: 'Room deleted' });
});
