const Activity = require('../models/Activity');
const User = require('../models/User');

const GLOBAL_AVG_TONS = 4.0;
const INDIA_AVG_TONS  = 1.9;

// ── Calculate footprint ────────────────────────────────────
exports.calculate = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const agg = await Activity.aggregate([
      { $match: { userId: req.userId, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$emissionValue' }, count: { $sum: 1 } } }
    ]);

    const totalKg = agg.length > 0 ? agg[0].total : 0;
    const annualTons = Math.round((totalKg / 30 * 365 / 1000) * 100) / 100;

    const user = await User.findById(req.userId);

    res.json({
      totalKgLast30Days: Math.round(totalKg * 100) / 100,
      annualTons,
      goalTarget: user.goalTarget,
      progressToGoal: user.goalTarget > 0
        ? Math.min(Math.round(((user.goalTarget + (annualTons - user.goalTarget)) / user.goalTarget) * 100), 100)
        : 0,
      globalAvg: GLOBAL_AVG_TONS,
      indiaAvg: INDIA_AVG_TONS,
      vsGlobal: Math.round((annualTons / GLOBAL_AVG_TONS) * 100),
      sustainabilityScore: user.sustainabilityScore
    });
  } catch (err) { next(err); }
};

// ── Category breakdown ─────────────────────────────────────
exports.getBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Activity.getCategoryBreakdown(req.userId);
    const total = breakdown.reduce((s, b) => s + b.total, 0);
    const result = breakdown.map(b => ({
      category: b._id,
      total: Math.round(b.total * 100) / 100,
      percentage: total > 0 ? Math.round((b.total / total) * 100) : 0,
      count: b.count
    }));
    res.json({ breakdown: result, total: Math.round(total * 100) / 100 });
  } catch (err) { next(err); }
};

// ── Weekly trend (last 7 days) ─────────────────────────────
exports.getWeekly = async (req, res, next) => {
  try {
    const raw = await Activity.getWeeklyBreakdown(req.userId);
    // Fill gaps with 0s
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = raw.find(r => r._id === key);
      days.push({ date: key, total: found ? Math.round(found.total * 100) / 100 : 0, count: found?.count || 0 });
    }
    res.json({ weekly: days });
  } catch (err) { next(err); }
};

// ── Monthly trend (last 12 months) ────────────────────────
exports.getMonthly = async (req, res, next) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const raw = await Activity.aggregate([
      { $match: { userId: req.userId, date: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$emissionValue' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ monthly: raw.map(r => ({ month: r._id, total: Math.round(r.total * 100) / 100, count: r.count })) });
  } catch (err) { next(err); }
};
