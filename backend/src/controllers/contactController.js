const Contact = require('../models/Contact');
const { ApiError, asyncHandler, pick } = require('../utils/helpers');

exports.create = asyncHandler(async (req, res) => {
  await Contact.create(pick(req.body, ['name', 'email', 'subject', 'message']));
  res.status(201).json({ message: 'Thank you! Your message has been sent.' });
});
exports.list = asyncHandler(async (_req, res) => res.json({ data: await Contact.find().sort('-createdAt') }));
exports.markRead = asyncHandler(async (req, res) => {
  const c = await Contact.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead !== false }, { new: true });
  if (!c) throw new ApiError(404, 'Message not found');
  res.json({ data: c });
});
exports.remove = asyncHandler(async (req, res) => {
  const c = await Contact.findByIdAndDelete(req.params.id);
  if (!c) throw new ApiError(404, 'Message not found');
  res.json({ message: 'Message deleted' });
});
