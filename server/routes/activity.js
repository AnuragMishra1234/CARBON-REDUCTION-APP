const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/activityController');

router.post('/log',       auth, ctrl.logActivity);
router.get('/history',    auth, ctrl.getHistory);
router.get('/daily',      auth, ctrl.getDailyLog);
router.delete('/:id',     auth, ctrl.deleteActivity);

module.exports = router;
