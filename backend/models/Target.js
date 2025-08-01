const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  targetType: { type: String, enum: ['solve', 'problems', 'contest'], required: true },
  problemsPerDay: { type: Number }, // Only for problems target
  contestTime: { type: String },    // Only for contest target, format 'HH:mm'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Target', TargetSchema);
