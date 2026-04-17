require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkCorrectEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = 'santoshreddyyemmiganur@gmail.com';
    const password = 'Srikanth@9493';

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ User found:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('isVerified:', user.isVerified);

    const isMatch = await user.comparePassword(password);
    console.log('\nPassword match:', isMatch ? '✅ YES' : '❌ NO');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCorrectEmail();
