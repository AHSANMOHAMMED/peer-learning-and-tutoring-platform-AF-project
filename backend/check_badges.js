const mongoose = require('mongoose');
const Badge = require('./models/Badge');
require('dotenv').config();

async function checkBadges() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning');
    const badges = await Badge.find();
    console.log('Badges in DB:', JSON.stringify(badges, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkBadges();
