const User = require('../models/User');
const PG = require('../models/PG');
const { ApiError, asyncHandler } = require('../utils/helpers');

exports.list = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'favorites', match: { status: 'approved' }, populate: { path: 'owner', select: 'name' } });
  res.json({ data: user.favorites });
});

exports.toggle = asyncHandler(async (req, res) => {
  const pg = await PG.findById(req.params.pgId).select('_id status');
  if (!pg || pg.status !== 'approved') throw new ApiError(404, 'Property not found');
  const has = req.user.favorites.some((f) => String(f) === String(pg._id));
  const user = await User.findByIdAndUpdate(req.user._id, has ? { $pull: { favorites: pg._id } } : { $addToSet: { favorites: pg._id } }, { new: true });
  res.json({ isFavorite: !has, favorites: user.favorites, message: has ? 'Removed from favourites' : 'Saved to favourites' });
});
