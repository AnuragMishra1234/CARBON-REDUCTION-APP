const mongoose = require('mongoose');

// ── Goal Schema ────────────────────────────────────────────
const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['transport', 'food', 'energy', 'overall', 'custom'], default: 'overall' },
  targetReduction: { type: Number, required: true }, // kg/year
  currentReduction: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: Date
}, { timestamps: true });

goalSchema.virtual('percentage').get(function () {
  if (!this.targetReduction) return 0;
  return Math.min(Math.round((this.currentReduction / this.targetReduction) * 100), 100);
});
goalSchema.set('toJSON', { virtuals: true });

// ── Recommendation Schema ──────────────────────────────────
const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['transport', 'food', 'energy', 'shopping', 'lifestyle'] },
  title: String,
  description: String,
  potentialSavings: Number, // kg CO2/year
  effort: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  impact: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  cost: { type: String, enum: ['free', 'low', 'medium', 'high'], default: 'free' },
  feasibility: { type: Number, min: 1, max: 10, default: 7 },
  aiGenerated: { type: Boolean, default: true },
  viewed: { type: Boolean, default: false },
  generatedAt: { type: Date, default: Date.now }
});

// ── EmissionFactor Schema ──────────────────────────────────
const emissionFactorSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subcategory: String,
  activityType: { type: String, required: true },
  label: String,
  factor: { type: Number, required: true }, // kg CO2e per unit
  unit: String,
  source: { type: String, default: 'GHG Protocol' },
  region: { type: String, default: 'global' },
  year: { type: Number, default: 2024 },
  notes: String
});

module.exports = {
  Goal: mongoose.model('Goal', goalSchema),
  Recommendation: mongoose.model('Recommendation', recommendationSchema),
  EmissionFactor: mongoose.model('EmissionFactor', emissionFactorSchema)
};
