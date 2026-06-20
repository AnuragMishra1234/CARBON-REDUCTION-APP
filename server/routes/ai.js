const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/aiController');

router.post('/chat',             auth, ctrl.chat);
router.post('/generate-plan',    auth, ctrl.generatePlan);
router.post('/recommendations',  auth, ctrl.getRecommendations);
router.get('/daily-tip',         auth, ctrl.getDailyTip);

module.exports = router;
