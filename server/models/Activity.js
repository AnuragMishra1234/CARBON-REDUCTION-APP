const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: {
    type: String,
    required: true,
    enum: ['transport', 'food', 'energy', 'shopping', 'flight', 'waste']
  },
  activityType: { type: String, required: true },  // e.g. 'car', 'beef', 'electricity'
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'unit' },          // km, kg, kWh, item
  emissionValue: { type: Number, required: true, min: 0 }, // kg CO2e
  date: { type: Date, default: Date.now, index: true },
  notes: { type: String, default: '' },
  metadata: {
    distance: Number,
    passengers: Number,
    mealType: String,     // breakfast/lunch/dinner/snack
    kWh: Number,
    local: Boolean,
    renewable: Boolean,
    flightType: String    // short/long/domestic
  }
}, { timestamps: true });

// Static: total CO2 for a user on a given date
activitySchema.statics.getDailyTotal = async function (userId, date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end   = new Date(date); end.setHours(23, 59, 59, 999);
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$emissionValue' } } }
  ]);
  return result;
};

// Static: weekly breakdown (last 7 days)
activitySchema.statics.getWeeklyBreakdown = async function (userId) {
  const end   = new Date();
  const start = new Date(end - 7 * 24 * 60 * 60 * 1000);
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$emissionValue' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static: category breakdown (last 30 days)
activitySchema.statics.getCategoryBreakdown = async function (userId) {
  const end   = new Date();
  const start = new Date(end - 30 * 24 * 60 * 60 * 1000);
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$emissionValue' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema);
