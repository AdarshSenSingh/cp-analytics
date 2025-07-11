// resetDatabase.js
// Run this script ONCE to clear all main collections in your MongoDB database.
// Usage: node backend/scripts/resetDatabase.js

const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

// Use the same URI as your app
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-tracker';

async function resetDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    console.log('Connected to DB:', mongoose.connection.name, 'at URI:', MONGO_URI);

    const collections = ['users', 'submissions', 'problems', 'platformaccounts'];
    for (const name of collections) {
      if (mongoose.connection.collections[name]) {
        await mongoose.connection.collections[name].deleteMany({});
        console.log(`Cleared collection: ${name}`);
      } else {
        console.log(`Collection not found: ${name}`);
      }
    }

    await mongoose.disconnect();
    console.log('Database reset complete.');
  } catch (err) {
    console.error('Error resetting database:', err);
    process.exit(1);
  }
}

resetDatabase();
