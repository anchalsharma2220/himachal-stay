const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    role: String,
    action: { type: String, required: true },
    type: { type: String, enum: ['user', 'listing', 'booking', 'general'], default: 'general' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
