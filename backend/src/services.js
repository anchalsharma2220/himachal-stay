const PG = require('./models/PG');

// Increase/decrease the vacancy count of one room type (used when bookings change state)
exports.adjustVacancy = async (pgId, roomId, delta) => {
  const pg = await PG.findById(pgId);
  const room = pg && pg.rooms.id(roomId);
  if (!room) return;
  room.available = Math.max(0, Math.min(room.totalUnits, room.available + delta));
  await pg.save();
};
