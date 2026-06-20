const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
  location: { type: String, default: '' },
  avatar: { type: String, default: '🌱' },

  // Sustainability Metrics
  sustainabilityScore: { type: Number, default: 50, min: 0, max: 100 },
  currentFootprint: { type: Number, default: 0 },   // tons CO2/year
  goalTarget: { type: Number, default: 2.5 },         // tons CO2/year target
  totalCO2Saved: { type: Number, default: 0 },         // kg saved vs baseline

  // Streaks
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },

  // Points & Rank
  totalPoints: { type: Number, default: 0 },
  rank: { type: Number, default: 9999 },

  // Challenges
  joinedChallenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],

  // Achievements
  achievements: [{
    badgeName: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],

  // Onboarding
  onboardingCompleted: { type: Boolean, default: false },
  quizAnswers: {
    transport: String,
    diet: String,
    energy: String,
    remote: String,
    flights: String
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Safe object (no password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Update sustainability score based on footprint
userSchema.methods.updateSustainabilityScore = function () {
  const globalAvg = 4.0; // tons/year
  const target = 2.0;
  const fp = this.currentFootprint;
  if (fp <= target) this.sustainabilityScore = 100;
  else if (fp >= globalAvg * 2) this.sustainabilityScore = 10;
  else {
    const range = globalAvg * 2 - target;
    this.sustainabilityScore = Math.round(100 - ((fp - target) / range) * 90);
  }
};

module.exports = mongoose.model('User', userSchema);
