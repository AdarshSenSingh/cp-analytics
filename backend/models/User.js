const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  contactInfo: {
    mobile: String,
    city: String,
    state: String,
    pinCode: String,
    country: String
  },
  platformAccounts: [{
    platform: {
      type: String,
      enum: ['codeforces'], // Only allow Codeforces
      required: true
    },
    username: {
      type: String,
      required: true
    },
    accessToken: String,
    refreshToken: String,
    lastSynced: Date,
    stats: {
      problemsSolved: {
        type: Number,
        default: 0
      },
      totalSubmissions: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 0
      }
    }
  }],
  preferences: {
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    },
    preferredDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'all'],
      default: 'all'
    },
    preferredTopics: [String],
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  points: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

