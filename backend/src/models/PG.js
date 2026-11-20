const mongoose = require('mongoose');
const { DISTRICTS, FACILITIES, ROOM_TYPES } = require('../config/constants');

const roomSchema = new mongoose.Schema({
  type: { type: String, enum: ROOM_TYPES, required: [true, 'Room type is required'] },
  rent: { type: Number, required: [true, 'Rent is required'], min: [500, 'Rent must be at least 500'] },
  capacity: { type: Number, required: true, min: 1, max: 10, default: 1 },
  totalUnits: { type: Number, min: 1, default: 1 },
  available: { type: Number, min: 0, default: 1 }, // vacancies; 0 = Not Available
});
roomSchema.virtual('isAvailable').get(function () { return this.available > 0; });
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

const pgSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Property name is required'], trim: true, minlength: 3, maxlength: 100 },
    district: { type: String, enum: { values: DISTRICTS, message: 'Select a valid Himachal district' }, required: [true, 'District is required'], index: true },
    location: { type: String, required: [true, 'Town / area is required'], trim: true, maxlength: 80 },
    address: { type: String, required: [true, 'Address is required'], trim: true, maxlength: 250 },
    description: { type: String, required: [true, 'Description is required'], trim: true, minlength: [20, 'Description must be at least 20 characters'], maxlength: 2000 },
    propertyType: { type: String, enum: ['PG', 'Room'], default: 'PG' },
    gender: { type: String, enum: ['Boys', 'Girls', 'Unisex'], default: 'Unisex' },
    images: [String],
    facilities: [{ type: String, enum: FACILITIES }],
    rules: [String],
    nearby: { type: String, trim: true, maxlength: 120 },
    contactPhone: { type: String, trim: true },
    rooms: [roomSchema],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    featured: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    minRent: { type: Number, default: 0, index: true },
    maxRent: { type: Number, default: 0 },
    totalAvailable: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pgSchema.pre('save', function (next) {
  const rents = this.rooms.map((r) => r.rent);
  this.minRent = rents.length ? Math.min(...rents) : 0;
  this.maxRent = rents.length ? Math.max(...rents) : 0;
  this.totalAvailable = this.rooms.reduce((s, r) => s + (r.available || 0), 0);
  next();
});

module.exports = mongoose.model('PG', pgSchema);
