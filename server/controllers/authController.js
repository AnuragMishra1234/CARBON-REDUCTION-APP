const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { estimateFromQuiz } = require('../utils/emissionsCalc');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── Register ───────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, email, password, location } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password, location: location || '' });
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Welcome to Carbon AI! 🌿',
      token,
      user: user.toSafeObject()
    });
  } catch (err) { next(err); }
};

// ── Login ──────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    user.lastActiveDate = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({ message: 'Welcome back! 🌱', token, user: user.toSafeObject() });
  } catch (err) { next(err); }
};

// ── Get Profile ────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate('joinedChallenges.challengeId', 'title icon rewardPoints');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toSafeObject() });
  } catch (err) { next(err); }
};

// ── Update Profile ─────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'location', 'avatar', 'goalTarget'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated!', user: user.toSafeObject() });
  } catch (err) { next(err); }
};

// ── Complete Onboarding / Quiz ─────────────────────────────
exports.completeOnboarding = async (req, res, next) => {
  try {
    const { quizAnswers, goalTarget } = req.body;
    const estimated = estimateFromQuiz(quizAnswers || {});

    const user = await User.findByIdAndUpdate(req.userId, {
      quizAnswers,
      onboardingCompleted: true,
      currentFootprint: estimated,
      goalTarget: goalTarget || Math.round(estimated * 0.8 * 100) / 100
    }, { new: true });

    user.updateSustainabilityScore();
    await user.save();

    res.json({
      message: 'Your sustainability profile is ready! 🌍',
      estimatedFootprint: estimated,
      user: user.toSafeObject()
    });
  } catch (err) { next(err); }
};
