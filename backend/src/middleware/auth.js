const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../utils/helpers');

const getUser = async (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  let decoded;
  try { decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); }
  catch { throw new ApiError(401, 'Session expired or invalid. Please log in again.'); }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or deactivated.');
  return user;
};

exports.protect = asyncHandler(async (req, _res, next) => {
  const user = await getUser(req);
  if (!user) throw new ApiError(401, 'Not authenticated. Please log in.');
  req.user = user;
  next();
});

exports.optionalAuth = asyncHandler(async (req, _res, next) => {
  try { req.user = await getUser(req); } catch { req.user = null; }
  next();
});

exports.authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, 'You do not have permission to perform this action.'));
