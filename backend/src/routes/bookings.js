const router = require('express').Router();
const c = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('student'), c.create);
router.get('/my', authorize('student'), c.my);
router.get('/owner', authorize('owner'), c.ownerList);
router.get('/', authorize('admin'), c.adminList);
router.patch('/:id/cancel', authorize('student'), c.cancel);
router.patch('/:id/status', authorize('owner', 'admin'), c.updateStatus);
router.delete('/:id', authorize('admin'), c.remove);
module.exports = router;
