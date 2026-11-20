const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.route('/').get(c.list).post(c.create);
router.route('/:id').put(c.update).delete(c.remove);
module.exports = router;
