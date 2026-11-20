const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, required: true },
    roomType: String,
    rent: { type: Number, required: true },
    moveInDate: { type: Date, required: [true, 'Move-in date is required'] },
    durationMonths: { type: Number, min: 1, max: 24, default: 1 },
    message: { type: String, trim: true, maxlength: 500 },
    ownerNote: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: BOOKING_STATUS, default: 'Pending', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
