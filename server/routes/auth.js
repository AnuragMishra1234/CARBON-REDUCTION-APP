const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register',    validateRegister, ctrl.register);
router.post('/login',       validateLogin,    ctrl.login);
router.get('/profile',      auth,             ctrl.getProfile);
router.put('/profile',      auth,             ctrl.updateProfile);
router.post('/onboarding',  auth,             ctrl.completeOnboarding);

module.exports = router;
