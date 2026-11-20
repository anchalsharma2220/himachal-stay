const User = require('../models/User');
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const { ApiError, asyncHandler, pick, escapeRegex, logActivity } = require('../utils/helpers');
const { adjustVacancy } = require('../services');

exports.list = asyncHandler(async (req, res) => {
  const q = {};
  if (['student', 'owner', 'admin'].includes(req.query.role)) q.role = req.query.role;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    q.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const users = await User.find(q).sort('-createdAt');
  res.json({ data: users, total: users.length });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'Name, email and password are required');
  const user = await User.create({ name, email: String(email).toLowerCase(), password: String(password), phone, role: ['student', 'owner', 'admin'].includes(role) ? role : 'student' });
  logActivity(req.user, `Admin created ${user.role} account for ${user.name}`, 'user');
  res.status(201).json({ user });
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  const isSelf = String(user._id) === String(req.user._id);
  const data = pick(req.body, ['name', 'phone', 'role', 'district', 'address', 'organization', 'isActive']);
  if (isSelf && (data.isActive === false || (data.role && data.role !== 'admin'))) throw new ApiError(400, 'You cannot deactivate or demote your own account');
  if (data.role && !['student', 'owner', 'admin'].includes(data.role)) delete data.role;
  Object.assign(user, data);
  if (req.body.password) {
    if (String(req.body.password).length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
    user.password = String(req.body.password);
  }
  await user.save();
  logActivity(req.user, `Admin updated account of ${user.name}`, 'user');
  res.json({ user });
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(user._id) === String(req.user._id)) throw new ApiError(400, 'You cannot delete your own account');
  if (user.role === 'owner') {
    const pgs = await PG.find({ owner: user._id }).select('_id');
    const ids = pgs.map((p) => p._id);
    await Booking.deleteMany({ pg: { $in: ids } });
    await User.updateMany({ favorites: { $in: ids } }, { $pull: { favorites: { $in: ids } } });
    await PG.deleteMany({ owner: user._id });
  } else if (user.role === 'student') {
    const approved = await Booking.find({ tenant: user._id, status: 'Approved' });
    for (const b of approved) await adjustVacancy(b.pg, b.room, 1);
    await Booking.deleteMany({ tenant: user._id });
  }
  await user.deleteOne();
  logActivity(req.user, `Admin removed ${user.role} account of ${user.name}`, 'user');
  res.json({ message: 'User deleted' });
});
