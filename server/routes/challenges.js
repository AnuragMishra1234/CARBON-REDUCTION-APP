const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/challengeController');

// Optional auth: try to verify token but don't block if missing
const optAuth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return next(); // no token — still allow listing
  auth(req, res, next);       // token present — verify it
};

router.get('/',              optAuth, ctrl.getChallenges);
router.post('/join/:id',     auth,    ctrl.joinChallenge);
router.put('/progress/:id',  auth,    ctrl.updateProgress);
router.post('/complete/:id', auth,    ctrl.completeChallenge);
router.get('/my',            auth,    ctrl.getMyChallenges);

module.exports = router;
