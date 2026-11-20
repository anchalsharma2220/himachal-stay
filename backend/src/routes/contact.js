const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { message: 'Too many messages, try later' } }), c.create);
router.get('/', protect, authorize('admin'), c.list);
router.patch('/:id/read', protect, authorize('admin'), c.markRead);
router.delete('/:id', protect, authorize('admin'), c.remove);
module.exports = router;
