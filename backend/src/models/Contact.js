const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'] },
    subject: { type: String, trim: true, maxlength: 120, default: 'General enquiry' },
    message: { type: String, required: [true, 'Message is required'], trim: true, minlength: [10, 'Message must be at least 10 characters'], maxlength: 1000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
