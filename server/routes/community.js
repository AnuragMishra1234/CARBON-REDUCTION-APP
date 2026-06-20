const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/communityController');

router.get('/leaderboard', auth,         ctrl.getLeaderboard);
router.get('/stats',                     ctrl.getCommunityStats); // public
router.get('/feed',        auth,         ctrl.getFeed);

module.exports = router;
