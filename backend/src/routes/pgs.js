const router = require('express').Router();
const c = require('../controllers/pgController');
const upload = require('../middleware/upload');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// public
router.get('/', c.list);
router.get('/featured', c.featured);
router.get('/public-stats', c.publicStats);
// owner / admin (declared before '/:id')
router.get('/mine', protect, authorize('owner'), c.mine);
router.get('/admin/all', protect, authorize('admin'), c.adminAll);
router.post('/', protect, authorize('owner', 'admin'), c.create);

router.get('/:id', optionalAuth, c.getOne);
router.put('/:id', protect, authorize('owner', 'admin'), c.update);
router.delete('/:id', protect, authorize('owner', 'admin'), c.remove);
router.patch('/:id/status', protect, authorize('admin'), c.setStatus);

router.post('/:id/images', protect, authorize('owner', 'admin'), upload.array('images', 8), c.uploadImages);
router.delete('/:id/images', protect, authorize('owner', 'admin'), c.removeImage);

router.post('/:id/rooms', protect, authorize('owner', 'admin'), c.addRoom);
router.put('/:id/rooms/:roomId', protect, authorize('owner', 'admin'), c.updateRoom);
router.delete('/:id/rooms/:roomId', protect, authorize('owner', 'admin'), c.deleteRoom);
module.exports = router;
