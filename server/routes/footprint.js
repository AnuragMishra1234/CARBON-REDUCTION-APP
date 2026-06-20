const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/footprintController');

router.get('/calculate',  auth, ctrl.calculate);
router.get('/breakdown',  auth, ctrl.getBreakdown);
router.get('/weekly',     auth, ctrl.getWeekly);
router.get('/monthly',    auth, ctrl.getMonthly);

module.exports = router;
