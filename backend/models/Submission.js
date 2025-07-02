const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  platformSubmissionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error', 'other'],
    required: true
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String
  },
  timeTaken: {
    type: Number // in seconds
  },
  memoryUsed: {
    type: Number // in KB
  },
  runtimePercentile: {
    type: Number // percentile compared to other submissions
  },
  memoryPercentile: {
    type: Number // percentile compared to other submissions
  },
  timeComplexity: {
    type: String // e.g., "O(n)", "O(n log n)"
  },
  spaceComplexity: {
    type: String // e.g., "O(n)", "O(1)"
  },
  notes: {
    type: String
  },
  aiAnalysis: {
    strengths: [String],
    weaknesses: [String],
    optimizationTips: [String],
    conceptsUsed: [String],
    suggestedResources: [{
      title: String,
      url: String,
      type: String // article, video, tutorial
    }]
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  platform: {
    type: String,
    enum: ['codeforces'], // Only allow Codeforces
    required: true,
    default: 'codeforces'
  },
  timeSpent: {
    type: Number,  // Time spent in minutes
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Create a compound index for user and problem to easily find all submissions for a problem by a user
SubmissionSchema.index({ user: 1, problem: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);

