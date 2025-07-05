const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/profile';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, contactInfo, preferences } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (contactInfo) profileFields.contactInfo = contactInfo;
    if (preferences) profileFields.preferences = preferences;
    
    // Only update email if it's changed and not already in use
    if (email) {
      // Check if email already exists for a different user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use by another account' });
      }
      profileFields.email = email;
    }
    
    // Update user with error handling
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      res.json(user);
    } catch (dbErr) {
      console.error('MongoDB error:', dbErr);
      res.status(500).json({ msg: 'Database error', error: dbErr.message });
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   POST api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Get the file path relative to server
    const profilePicture = `/uploads/profile/${req.file.filename}`;
    
    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture } },
      { new: true }
    ).select('-password');
    
    res.json({ profilePicture });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;