const User = require('../models/User');
const Activity = require('../models/Activity');

// ── Leaderboard ────────────────────────────────────────────
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name avatar totalCO2Saved totalPoints currentStreak achievements rank location')
      .sort({ totalCO2Saved: -1, totalPoints: -1 })
      .limit(100);

    // Assign ranks
    const ranked = users.map((u, i) => ({
      ...u.toObject(),
      rank: i + 1
    }));

    // Find current user's rank
    const myRank = ranked.findIndex(u => u._id.toString() === req.userId.toString()) + 1;

    res.json({ leaderboard: ranked, myRank: myRank || 999 });
  } catch (err) { next(err); }
};

// ── Community Stats ────────────────────────────────────────
exports.getCommunityStats = async (req, res, next) => {
  try {
    const [memberCount, activityCount, co2Agg] = await Promise.all([
      User.countDocuments(),
      Activity.countDocuments(),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$totalCO2Saved' } } }])
    ]);

    const totalCO2Saved = co2Agg.length > 0 ? Math.round(co2Agg[0].total) : 0;

    res.json({
      memberCount,
      activityCount,
      totalCO2SavedKg: totalCO2Saved,
      totalCO2SavedTons: Math.round(totalCO2Saved / 1000 * 10) / 10
    });
  } catch (err) { next(err); }
};

// ── Live Feed (recent activities) ─────────────────────────
exports.getFeed = async (req, res, next) => {
  try {
    const recent = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name avatar location');

    const feed = recent.map(a => ({
      id: a._id,
      user: {
        name: a.userId?.name || 'Anonymous',
        avatar: a.userId?.avatar || '🌱',
        location: a.userId?.location || ''
      },
      category: a.category,
      activityType: a.activityType,
      emissionValue: a.emissionValue,
      date: a.date,
      timeAgo: getTimeAgo(a.date)
    }));

    res.json({ feed });
  } catch (err) { next(err); }
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
