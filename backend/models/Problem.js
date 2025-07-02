const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  platformId: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'hackerrank', 'atcoder', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'unknown'],
    default: 'unknown'
  },
  topics: [{
    type: String
  }],
  description: {
    type: String
  },
  acceptanceRate: {
    type: Number
  },
  timeLimit: {
    type: Number
  },
  memoryLimit: {
    type: Number
  },
  notes: {
    type: Map,
    of: String,
    default: new Map() // Map of userId -> notes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index for platform and platformId to ensure uniqueness
ProblemSchema.index({ platform: 1, platformId: 1 }, { unique: true });

module.exports = mongoose.model('Problem', ProblemSchema);
