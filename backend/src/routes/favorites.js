const router = require('express').Router();
const c = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));
router.get('/', c.list);
router.post('/:pgId', c.toggle);
module.exports = router;
