const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DISTRICTS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [2, 'Name is too short'], maxlength: 60 },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
    role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
    phone: { type: String, trim: true, match: [/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number'] },
    district: { type: String, enum: [...DISTRICTS, ''], default: '' },
    address: { type: String, trim: true, maxlength: 200 },
    organization: { type: String, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PG' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => { delete ret.password; delete ret.__v; return ret; },
});

module.exports = mongoose.model('User', userSchema);
