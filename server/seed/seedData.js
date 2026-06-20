require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear
    await Promise.all([Challenge.deleteMany({}), Activity.deleteMany({})]);
    await User.deleteMany({ email: 'demo@carbon.ai' });
    console.log('🗑  Cleared existing seed data');

    // ── Seed Challenges ────────────────────────────────────
    const challenges = await Challenge.insertMany([
      {
        title: 'No Car Friday', icon: '🚲', category: 'transport', rewardPoints: 150, difficulty: 'easy',
        description: 'Replace at least one car trip this Friday with walking, cycling, or public transport.',
        targetAction: 'log_activity', targetQuantity: 1, unit: 'trip', co2SavedEstimate: 4.2,
        duration: 7, isActive: true
      },
      {
        title: 'Green Meal Week', icon: '🥗', category: 'food', rewardPoints: 200, difficulty: 'medium',
        description: 'Choose plant-based meals every day for a full week. Discover delicious sustainable alternatives!',
        targetAction: 'log_activity', targetQuantity: 7, unit: 'meals', co2SavedEstimate: 28,
        duration: 7, isActive: true
      },
      {
        title: 'Energy Saver Challenge', icon: '⚡', category: 'energy', rewardPoints: 120, difficulty: 'easy',
        description: 'Reduce your household energy usage by 10% this week. Smart habits start at home!',
        targetAction: 'reduce_energy', targetQuantity: 10, unit: '%', co2SavedEstimate: 8,
        duration: 7, isActive: true
      },
      {
        title: 'Community Clean-Up Mission', icon: '🌍', category: 'community', rewardPoints: 300, difficulty: 'medium',
        description: 'Participate in a local environmental clean-up or sustainability event near you.',
        targetAction: 'attend_event', targetQuantity: 1, unit: 'event', co2SavedEstimate: 0,
        duration: 14, isActive: true
      },
      {
        title: 'Zero Waste Week', icon: '♻️', category: 'waste', rewardPoints: 250, difficulty: 'hard',
        description: 'Minimize waste by refusing single-use plastics, composting, and recycling everything possible.',
        targetAction: 'log_waste', targetQuantity: 7, unit: 'days', co2SavedEstimate: 4,
        duration: 7, isActive: true
      }
    ]);
    console.log(`✅ Seeded ${challenges.length} challenges`);

    // ── Seed Demo User ─────────────────────────────────────
    const user = await User.create({
      name: 'Alex Chen',
      email: 'demo@carbon.ai',
      password: 'Demo1234!',
      location: 'India',
      avatar: '🌱',
      onboardingCompleted: true,
      currentFootprint: 3.2,
      goalTarget: 2.56,
      currentStreak: 18,
      longestStreak: 25,
      totalPoints: 2450,
      totalCO2Saved: 125,
      sustainabilityScore: 68,
      lastActiveDate: new Date(),
      quizAnswers: { transport: 'Private Car', diet: 'Fish / Chicken', energy: 'Medium', remote: 'Hybrid (3 days)', flights: '1–2 Short Flights' },
      achievements: [
        { badgeName: 'First Steps', icon: '🌱', description: 'Logged your very first activity!', unlockedAt: new Date(Date.now() - 30*24*60*60*1000) },
        { badgeName: 'Week Warrior', icon: '🔥', description: 'Maintained a 7-day streak!', unlockedAt: new Date(Date.now() - 14*24*60*60*1000) },
        { badgeName: 'Eco Commuter', icon: '🚌', description: 'Logged 10 transport activities!', unlockedAt: new Date(Date.now() - 7*24*60*60*1000) }
      ]
    });
    console.log(`✅ Created demo user: demo@carbon.ai / Demo1234!`);

    // ── Seed Activities for Demo User ──────────────────────
    const activities = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      activities.push({ userId: user._id, category: 'transport', activityType: 'car', quantity: 20, unit: 'km', emissionValue: 4.2, date });
      activities.push({ userId: user._id, category: 'food', activityType: 'chicken', quantity: 1, unit: 'meal', emissionValue: 2.1, date });
      activities.push({ userId: user._id, category: 'energy', activityType: 'electricity', quantity: 8, unit: 'kWh', emissionValue: 6.24, date });
    }
    await Activity.insertMany(activities);
    console.log(`✅ Seeded ${activities.length} activities for demo user`);

    console.log('\n🌿 ═══════════════════════════════════');
    console.log('🌿  Seed Complete!');
    console.log('🌿  Demo Login: demo@carbon.ai');
    console.log('🌿  Password:   Demo1234!');
    console.log('🌿 ═══════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
