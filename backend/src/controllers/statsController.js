const User = require('../models/User');
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');
const Contact = require('../models/Contact');
const { DISTRICTS, BOOKING_STATUS } = require('../config/constants');
const { asyncHandler } = require('../utils/helpers');

const statusMap = (rows) => {
  const m = Object.fromEntries(BOOKING_STATUS.map((s) => [s, 0]));
  rows.forEach((r) => { m[r._id] = r.n; });
  return m;
};
const byStatus = (match) => Booking.aggregate([{ $match: match }, { $group: { _id: '$status', n: { $sum: 1 } } }]);
const recent = (match, n = 5) =>
  Booking.find(match).sort('-createdAt').limit(n).populate('tenant', 'name phone email').populate('pg', 'name district location');

exports.admin = asyncHandler(async (_req, res) => {
  const since = new Date(); since.setMonth(since.getMonth() - 5); since.setDate(1); since.setHours(0, 0, 0, 0);
  const [students, owners, pgs, pendingPgs, bookings, unread, st, perDistrict, monthlyRaw, activities, recentBookings] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'owner' }),
    PG.countDocuments(),
    PG.countDocuments({ status: 'pending' }),
    Booking.countDocuments(),
    Contact.countDocuments({ isRead: false }),
    byStatus({}),
    PG.aggregate([{ $group: { _id: '$district', n: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, n: { $sum: 1 } } }]),
    Activity.find().sort('-createdAt').limit(10),
    recent({}, 6),
  ]);
  const bs = statusMap(st);
  const dm = Object.fromEntries(perDistrict.map((d) => [d._id, d.n]));
  const monthly = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    const hit = monthlyRaw.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    monthly.push({ label: d.toLocaleString('en-IN', { month: 'short' }), count: hit ? hit.n : 0 });
  }
  res.json({
    counts: { students, owners, pgs, pendingPgs, bookings, pendingBookings: bs.Pending, unreadMessages: unread },
    bookingsByStatus: bs,
    pgsByDistrict: DISTRICTS.map((name) => ({ name, count: dm[name] || 0 })),
    monthly, activities, recentBookings,
  });
});

exports.owner = asyncHandler(async (req, res) => {
  const pgs = await PG.find({ owner: req.user._id }).select('rooms status');
  const bs = statusMap(await byStatus({ owner: req.user._id }));
  const approved = await Booking.find({ owner: req.user._id, status: 'Approved' }).select('rent');
  res.json({
    counts: {
      pgs: pgs.length,
      approvedPgs: pgs.filter((p) => p.status === 'approved').length,
      pendingPgs: pgs.filter((p) => p.status === 'pending').length,
      rooms: pgs.reduce((s, p) => s + p.rooms.length, 0),
      vacancies: pgs.reduce((s, p) => s + p.rooms.reduce((a, r) => a + r.available, 0), 0),
      pendingRequests: bs.Pending,
      monthlyRevenue: approved.reduce((s, b) => s + b.rent, 0),
    },
    bookingsByStatus: bs,
    recentBookings: await recent({ owner: req.user._id }),
  });
});

exports.student = asyncHandler(async (req, res) => {
  const bs = statusMap(await byStatus({ tenant: req.user._id }));
  res.json({
    counts: { total: Object.values(bs).reduce((a, b) => a + b, 0), favourites: req.user.favorites.length, ...bs },
    recentBookings: await recent({ tenant: req.user._id }),
  });
});
