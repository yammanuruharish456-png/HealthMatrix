const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    const admin = await User.findOne({ email: 'yammanuruharish456@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ Admin found in database\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:        ${admin._id}`);
    console.log(`Name:      ${admin.name}`);
    console.log(`Email:     ${admin.email}`);
    console.log(`Role:      ${admin.role}`);
    console.log(`Verified:  ${admin.isVerified}`);
    console.log(`Password Hash: ${admin.password.substring(0, 20)}...`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test password comparison
    const isPasswordCorrect = await admin.comparePassword('admin@123');
    console.log(`Password Match Test: ${isPasswordCorrect ? '✅ PASS' : '❌ FAIL'}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();
