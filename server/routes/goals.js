const router = require('express').Router();
const auth = require('../middleware/auth');
const { Goal } = require('../models/Models');

router.post('/', auth, async (req, res, next) => {
  try {
    const goal = await Goal.create({ userId: req.userId, ...req.body });
    res.status(201).json({ goal });
  } catch (err) { next(err); }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });
    res.json({ goal });
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Goal deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
