const ACHIEVEMENTS = [
  { key: 'first_steps',       badgeName: 'First Steps',         icon: '🌱', description: 'Logged your very first activity!', condition: (user, stats) => stats.totalActivities >= 1 },
  { key: 'week_warrior',      badgeName: 'Week Warrior',         icon: '🔥', description: 'Maintained a 7-day streak!',       condition: (user) => user.currentStreak >= 7 },
  { key: 'month_champion',    badgeName: 'Month Champion',       icon: '⚡', description: 'Maintained a 30-day streak!',      condition: (user) => user.currentStreak >= 30 },
  { key: 'century_saver',     badgeName: 'Century Saver',        icon: '💚', description: 'Saved 100 kg CO₂!',               condition: (user) => user.totalCO2Saved >= 100 },
  { key: 'eco_commuter',      badgeName: 'Eco Commuter',         icon: '🚌', description: 'Logged 10 transport activities!', condition: (user, stats) => (stats.categoryCounts.transport || 0) >= 10 },
  { key: 'plant_power',       badgeName: 'Plant Power',          icon: '🥗', description: 'Logged 5 plant-based meals!',     condition: (user, stats) => (stats.veganMeals || 0) >= 5 },
  { key: 'energy_guardian',   badgeName: 'Energy Guardian',      icon: '⚡', description: 'Logged 5 energy activities!',     condition: (user, stats) => (stats.categoryCounts.energy || 0) >= 5 },
  { key: 'challenge_hero',    badgeName: 'Challenge Hero',        icon: '🏆', description: 'Completed 5 eco challenges!',    condition: (user) => (user.joinedChallenges || []).filter(c => c.completed).length >= 5 },
  { key: 'community_star',    badgeName: 'Community Star',        icon: '⭐', description: 'Reached top 100 on leaderboard!',condition: (user) => user.rank <= 100 },
  { key: 'half_ton_hero',     badgeName: 'Half-Ton Hero',         icon: '🌍', description: 'Saved 500 kg CO₂!',              condition: (user) => user.totalCO2Saved >= 500 },
  { key: 'ton_champion',      badgeName: 'Ton Champion',          icon: '🌟', description: 'Saved 1,000 kg CO₂!',            condition: (user) => user.totalCO2Saved >= 1000 },
];

/**
 * Check and award new achievements to a user
 * @param {object} user - User document
 * @param {object} stats - { totalActivities, categoryCounts, veganMeals }
 * @returns {array} newly unlocked achievements
 */
const checkAchievements = (user, stats = {}) => {
  const existing = new Set((user.achievements || []).map(a => a.badgeName));
  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (existing.has(ach.badgeName)) continue;
    try {
      if (ach.condition(user, stats)) {
        newlyUnlocked.push({
          badgeName: ach.badgeName,
          description: ach.description,
          icon: ach.icon,
          unlockedAt: new Date()
        });
      }
    } catch (_) {}
  }

  return newlyUnlocked;
};

module.exports = { checkAchievements, ACHIEVEMENTS };
