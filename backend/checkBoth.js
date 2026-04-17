require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const checkBoth = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'santhoshreddyyemmiganur@gmail.com';

    const user = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    console.log('\n=== USER COLLECTION ===');
    if (user) {
      console.log('✅ User found:');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('isVerified:', user.isVerified);
    } else {
      console.log('❌ No user found');
    }

    console.log('\n=== DOCTOR COLLECTION ===');
    if (doctor) {
      console.log('✅ Doctor found:');
      console.log('ID:', doctor._id);
      console.log('Name:', doctor.name);
      console.log('Email:', doctor.email);
      console.log('UserId:', doctor.userId);
      console.log('isVerified:', doctor.isVerified);
      console.log('isActive:', doctor.isActive);
      console.log('NMC Number:', doctor.nmcRegistrationNumber);
    } else {
      console.log('❌ No doctor found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkBoth();
