const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const admins = [
  {
    email: 'admin@peerlearn.lk',
    username: 'superadmin',
    role: 'superadmin',
    firstName: 'System'
  },
  {
    email: 'adminuser@peerlearn.lk',
    username: 'admin',
    role: 'admin',
    firstName: 'Admin'
  }
];

const resetAdmins = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }

  const password = process.env.ADMIN_RESET_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('ADMIN_RESET_PASSWORD must be set to at least 8 characters');
  }

  await mongoose.connect(process.env.MONGO_URI);

  for (const admin of admins) {
    const existingUser = await User.findOne({ email: admin.email });
    const user = existingUser || new User({ email: admin.email });

    user.username = admin.username;
    user.role = admin.role;
    user.password = password;
    user.isActive = true;
    user.isVerified = true;
    user.authProvider = 'local';
    user.profile = {
      ...(user.profile || {}),
      firstName: admin.firstName,
      lastName: 'Administrator'
    };

    await user.save();
    console.log(`Reset ${admin.role}: ${admin.email}`);
  }

  await mongoose.disconnect();
  console.log('Admin credentials reset complete.');
};

resetAdmins().catch(async (error) => {
  console.error('Admin reset failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
