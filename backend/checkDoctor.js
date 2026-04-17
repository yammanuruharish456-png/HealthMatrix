require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'santhoshreddyyemmiganur@gmail.com';
    const password = 'Srikanth@9493';

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      await mongoose.connection.close();
      return;
    }

    console.log('\n✅ User found:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('isVerified:', user.isVerified);
    console.log('Password hash:', user.password);

    const isMatch = await user.comparePassword(password);
    console.log('\nPassword match:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n⚠️ Password does not match. The password might be incorrect or not hashed properly.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDoctor();
