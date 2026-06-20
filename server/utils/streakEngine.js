const User = require('../models/User');

const MILESTONES = [7, 14, 30, 60, 100, 365];

/**
 * Check and update user streak based on last active date
 * @returns { user, streakChanged, milestoneReached }
 */
const checkAndUpdateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = user.lastActiveDate
    ? new Date(new Date(user.lastActiveDate).getFullYear(), new Date(user.lastActiveDate).getMonth(), new Date(user.lastActiveDate).getDate())
    : null;

  let streakChanged = false;
  let milestoneReached = null;

  if (!last) {
    // First activity ever
    user.currentStreak = 1;
    user.longestStreak = 1;
    streakChanged = true;
  } else {
    const diffMs = today - last;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today — no change
    } else if (diffDays === 1) {
      // Consecutive day — increment streak
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
      streakChanged = true;
    } else {
      // Streak broken
      user.currentStreak = 1;
      streakChanged = true;
    }
  }

  user.lastActiveDate = now;

  // Check milestone
  if (streakChanged && MILESTONES.includes(user.currentStreak)) {
    milestoneReached = user.currentStreak;
  }

  await user.save();
  return { user, streakChanged, milestoneReached };
};

/**
 * Get streak bonus multiplier for points
 */
const calculateStreakBonus = (streak) => {
  if (streak >= 100) return 3.0;
  if (streak >= 60)  return 2.5;
  if (streak >= 30)  return 2.0;
  if (streak >= 14)  return 1.5;
  if (streak >= 7)   return 1.25;
  return 1.0;
};

/**
 * Get milestone message
 */
const getStreakMilestoneMessage = (streak) => {
  const messages = {
    7:   '🔥 One Week Warrior! 7-day streak achieved!',
    14:  '⚡ Two Week Champion! Keep the momentum!',
    30:  '🌟 Month Master! 30 days of green choices!',
    60:  '💚 Eco Legend! 60 days of sustainable living!',
    100: '🏆 Century Club! 100 days — truly inspiring!',
    365: '🌍 Earth Guardian! A full year of impact!'
  };
  return messages[streak] || `🌱 ${streak} day streak — keep going!`;
};

module.exports = { checkAndUpdateStreak, calculateStreakBonus, getStreakMilestoneMessage };
