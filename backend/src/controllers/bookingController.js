const Booking = require('../models/Booking');
const PG = require('../models/PG');
const { BOOKING_STATUS } = require('../config/constants');
const { ApiError, asyncHandler, logActivity } = require('../utils/helpers');
const { adjustVacancy } = require('../services');

const populateAll = (q) => q.populate('tenant', 'name email phone').populate('pg', 'name district location images').populate('owner', 'name email phone');

exports.create = asyncHandler(async (req, res) => {
  const { pgId, roomId, moveInDate, durationMonths = 1, message } = req.body;
  if (!pgId || !roomId || !moveInDate) throw new ApiError(400, 'Property, room type and move-in date are required');
  const date = new Date(moveInDate);
  if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid move-in date');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (date < today) throw new ApiError(400, 'Move-in date cannot be in the past');
  const months = Number(durationMonths);
  if (!(months >= 1 && months <= 24)) throw new ApiError(400, 'Duration must be between 1 and 24 months');

  const pg = await PG.findById(pgId);
  if (!pg || pg.status !== 'approved') throw new ApiError(404, 'Property not found');
  const room = pg.rooms.id(roomId);
  if (!room) throw new ApiError(404, 'Room type not found');
  if (room.available < 1) throw new ApiError(400, 'This room type is currently not available');
  const dup = await Booking.findOne({ tenant: req.user._id, pg: pg._id, room: room._id, status: { $in: ['Pending', 'Approved'] } });
  if (dup) throw new ApiError(409, `You already have a ${dup.status.toLowerCase()} request for this room`);

  const booking = await Booking.create({
    tenant: req.user._id, owner: pg.owner, pg: pg._id, room: room._id, roomType: room.type,
    rent: room.rent, moveInDate: date, durationMonths: months, message,
  });
  logActivity(req.user, `${req.user.name} requested a ${room.type} room at "${pg.name}"`, 'booking');
  res.status(201).json({ data: booking, message: 'Booking request submitted. The owner will respond soon.' });
});

exports.my = asyncHandler(async (req, res) => {
  res.json({ data: await populateAll(Booking.find({ tenant: req.user._id }).sort('-createdAt')) });
});

exports.ownerList = asyncHandler(async (req, res) => {
  const q = { owner: req.user._id };
  if (BOOKING_STATUS.includes(req.query.status)) q.status = req.query.status;
  res.json({ data: await populateAll(Booking.find(q).sort('-createdAt')) });
});

exports.adminList = asyncHandler(async (req, res) => {
  const q = {};
  if (BOOKING_STATUS.includes(req.query.status)) q.status = req.query.status;
  res.json({ data: await populateAll(Booking.find(q).sort('-createdAt')) });
});

exports.cancel = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b || String(b.tenant) !== String(req.user._id)) throw new ApiError(404, 'Booking not found');
  if (b.status !== 'Pending') throw new ApiError(400, 'Only pending bookings can be cancelled');
  b.status = 'Cancelled';
  await b.save();
  logActivity(req.user, `${req.user.name} cancelled a booking request`, 'booking');
  res.json({ data: b, message: 'Booking cancelled' });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, ownerNote } = req.body;
  const isAdmin = req.user.role === 'admin';
  if (!BOOKING_STATUS.includes(status)) throw new ApiError(400, 'Invalid status');
  const b = await Booking.findById(req.params.id);
  if (!b) throw new ApiError(404, 'Booking not found');
  if (!isAdmin) {
    if (String(b.owner) !== String(req.user._id)) throw new ApiError(403, 'This booking does not belong to your properties');
    if (!['Approved', 'Rejected'].includes(status)) throw new ApiError(400, 'Owners can only approve or reject requests');
    const ok = (b.status === 'Pending') || (b.status === 'Approved' && status === 'Rejected');
    if (!ok) throw new ApiError(400, `A ${b.status.toLowerCase()} booking cannot be changed`);
  }
  const prev = b.status;
  if (prev !== status) {
    if (status === 'Approved') {
      const pg = await PG.findById(b.pg);
      const room = pg && pg.rooms.id(b.room);
      if (room) {
        if (room.available < 1) throw new ApiError(409, 'No vacancy left in this room type');
        room.available -= 1;
        await pg.save();
      }
    } else if (prev === 'Approved') {
      await adjustVacancy(b.pg, b.room, 1);
    }
    b.status = status;
  }
  if (ownerNote !== undefined) b.ownerNote = String(ownerNote).slice(0, 300);
  await b.save();
  logActivity(req.user, `${req.user.name} marked a booking as ${status}`, 'booking');
  res.json({ data: b, message: `Booking ${status.toLowerCase()}` });
});

exports.remove = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new ApiError(404, 'Booking not found');
  if (b.status === 'Approved') await adjustVacancy(b.pg, b.room, 1);
  await b.deleteOne();
  logActivity(req.user, 'Admin deleted a booking record', 'booking');
  res.json({ message: 'Booking deleted' });
});
