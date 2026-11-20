const jwt = require('jsonwebtoken');
const Activity = require('../models/Activity');

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, k) => { if (obj[k] !== undefined) acc[k] = obj[k]; return acc; }, {});

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const logActivity = (user, action, type = 'general') =>
  Activity.create({ user: user._id, userName: user.name, role: user.role, action, type }).catch(() => {});

const num = (v) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

module.exports = { ApiError, asyncHandler, pick, escapeRegex, signToken, logActivity, num };
