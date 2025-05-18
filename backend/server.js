require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { initScheduler } = require('./services/scheduler');

// Import routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const analyticsRoutes = require('./routes/analytics');
const platformRoutes = require('./routes/platforms');
const submissionsRoutes = require('./routes/submissions');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  
  // Initialize scheduler after database connection
  initScheduler();
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/submissions', submissionsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

