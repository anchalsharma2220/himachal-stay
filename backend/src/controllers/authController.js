const User = require('../models/User');
const { ApiError, asyncHandler, pick, signToken, logActivity } = require('../utils/helpers');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'Name, email and password are required');
  if (String(password).length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  const mail = String(email).toLowerCase().trim();
  if (await User.findOne({ email: mail })) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ name, email: mail, password: String(password), phone, role: role === 'owner' ? 'owner' : 'student' });
  logActivity(user, `${user.name} registered as ${user.role === 'owner' ? 'PG owner' : 'student'}`, 'user');
  res.status(201).json({ token: signToken(user._id), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(String(password)))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated. Please contact the admin.');
  logActivity(user, `${user.name} logged in`, 'user');
  res.json({ token: signToken(user._id), user });
});

exports.me = asyncHandler(async (req, res) => res.json({ user: req.user }));

exports.updateMe = asyncHandler(async (req, res) => {
  Object.assign(req.user, pick(req.body, ['name', 'phone', 'district', 'address', 'organization']));
  await req.user.save();
  res.json({ user: req.user, message: 'Profile updated' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Current and new password are required');
  if (String(newPassword).length < 6) throw new ApiError(400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(String(currentPassword)))) throw new ApiError(400, 'Current password is incorrect');
  user.password = String(newPassword);
  await user.save();
  res.json({ message: 'Password changed successfully' });
});
