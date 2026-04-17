require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const checkTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'test@test.com' });
    const doctor = await Doctor.findOne({ email: 'test@test.com' });

    console.log('User:', user ? '✅ Found' : '❌ Not found');
    console.log('Doctor:', doctor ? '✅ Found' : '❌ Not found');

    if (user) {
      console.log('User ID:', user._id);
      console.log('isVerified:', user.isVerified);
    }

    if (doctor) {
      console.log('Doctor ID:', doctor._id);
      console.log('UserId:', doctor.userId);
      console.log('isVerified:', doctor.isVerified);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkTest();
