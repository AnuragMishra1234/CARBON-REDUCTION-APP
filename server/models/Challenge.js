const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['transport', 'food', 'energy', 'community', 'waste', 'lifestyle'], default: 'lifestyle' },
  icon: { type: String, default: '🌱' },
  rewardPoints: { type: Number, default: 100 },
  duration: { type: Number, default: 7 },  // days
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  targetAction: String,
  targetQuantity: Number,
  unit: String,
  co2SavedEstimate: { type: Number, default: 0 }, // kg CO2e per completion
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date
}, { timestamps: true });

challengeSchema.virtual('completionRate').get(function () {
  if (!this.participants.length) return 0;
  const done = this.participants.filter(p => p.completed).length;
  return Math.round((done / this.participants.length) * 100);
});

challengeSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

challengeSchema.set('toJSON', { virtuals: true });
challengeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Challenge', challengeSchema);
