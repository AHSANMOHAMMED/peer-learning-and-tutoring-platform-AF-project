const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './.env' });

async function setDemoOTPs() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const emails = ['nimal@peerlearn.lk', 'kamal@peerlearn.lk', 'admin@peerlearn.lk', 'adminuser@peerlearn.lk'];
  const otpCode = '123456';
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  for (const email of emails) {
    const user = await User.findOne({ email });
    if (user) {
      user.otpCode = otpCode;
      user.otpExpiry = otpExpiry;
      user.isVerified = true;
      await user.save();
      console.log(`OTP set for ${email}: ${otpCode}`);
    } else {
      console.log(`User not found: ${email}`);
    }
  }

  process.exit(0);
}

setDemoOTPs().catch(err => {
  console.error(err);
  process.exit(1);
});
