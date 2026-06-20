const Activity = require('../models/Activity');
const User = require('../models/User');
const { calculateEmission } = require('../utils/emissionsCalc');
const { checkAndUpdateStreak, calculateStreakBonus } = require('../utils/streakEngine');
const { checkAchievements } = require('../utils/achievementEngine');

// ── Log Activity ───────────────────────────────────────────
exports.logActivity = async (req, res, next) => {
  try {
    const { category, activityType, quantity, unit, notes, metadata, date } = req.body;

    // 1. Calculate emissions
    const { emissionValue, label, equivalents } = calculateEmission(category, activityType, quantity, metadata || {});

    // 2. Save activity
    const activity = await Activity.create({
      userId: req.userId,
      category,
      activityType,
      quantity,
      unit: unit || '',
      emissionValue,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
      metadata: metadata || {}
    });

    // 3. Update streak
    const streakResult = await checkAndUpdateStreak(req.userId);
    const bonus = calculateStreakBonus(streakResult?.user?.currentStreak || 1);

    // 4. Award points (base 10 + streak bonus)
    const pointsEarned = Math.round(10 * bonus);

    // 5. Update user stats
    const user = await User.findById(req.userId);
    user.totalPoints = (user.totalPoints || 0) + pointsEarned;
    // We track CO2 saved relative to a "high emission" baseline
    // Baseline: same category high-emission option vs chosen option
    const BASELINES = { transport: 0.21, food: 10.0, energy: 0.78, shopping: 30, flight: 0.255, waste: 0.58 };
    const baseline = BASELINES[category] || 0.21;
    const maxEmission = baseline * quantity;
    const co2Saved = Math.max(0, maxEmission - emissionValue);
    user.totalCO2Saved = (user.totalCO2Saved || 0) + co2Saved;

    // 6. Check achievements
    const totalActivities = await Activity.countDocuments({ userId: req.userId });
    const catCounts = await Activity.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryCounts = {};
    catCounts.forEach(c => { categoryCounts[c._id] = c.count; });
    const veganMeals = await Activity.countDocuments({ userId: req.userId, category: 'food', activityType: { $in: ['vegan', 'vegetarian'] } });

    const stats = { totalActivities, categoryCounts, veganMeals };
    const newAchievements = checkAchievements(user, stats);
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
    }

    // Update footprint estimate (rolling 30-day annualized)
    const thirtyDayTotal = await Activity.aggregate([
      { $match: { userId: user._id, date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, total: { $sum: '$emissionValue' } } }
    ]);
    if (thirtyDayTotal.length > 0) {
      const daily = thirtyDayTotal[0].total / 30;
      user.currentFootprint = Math.round((daily * 365 / 1000) * 100) / 100; // convert to tons
      user.updateSustainabilityScore();
    }

    await user.save();

    res.status(201).json({
      message: `Activity logged! 🌱 ${emissionValue.toFixed(2)} kg CO₂e`,
      activity,
      emissionValue,
      equivalents,
      pointsEarned,
      co2Saved: Math.round(co2Saved * 100) / 100,
      newAchievements,
      streak: streakResult?.user?.currentStreak || 1,
      milestoneReached: streakResult?.milestoneReached || null,
      updatedUser: user.toSafeObject()
    });
  } catch (err) { next(err); }
};

// ── Get Activity History ───────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const filter = { userId: req.userId };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }
    const total = await Activity.countDocuments(filter);
    const activities = await Activity.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ activities, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── Get Daily Log ──────────────────────────────────────────
exports.getDailyLog = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const dailyBreakdown = await Activity.getDailyTotal(req.userId, date);
    const activities = await Activity.find({
      userId: req.userId,
      date: {
        $gte: new Date(date.setHours(0,0,0,0)),
        $lte: new Date(date.setHours(23,59,59,999))
      }
    }).sort({ date: -1 });

    const totalToday = activities.reduce((s, a) => s + a.emissionValue, 0);
    res.json({ activities, dailyBreakdown, totalToday: Math.round(totalToday * 100) / 100 });
  } catch (err) { next(err); }
};

// ── Delete Activity ────────────────────────────────────────
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    res.json({ message: 'Activity removed.', activity });
  } catch (err) { next(err); }
};
