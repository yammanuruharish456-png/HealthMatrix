require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const listDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const doctors = await Doctor.find({});
    
    console.log(`Total doctors: ${doctors.length}\n`);
    
    doctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Email: ${doc.email}`);
      console.log(`   Verified: ${doc.isVerified}`);
      console.log(`   Active: ${doc.isActive}`);
      console.log(`   NMC: ${doc.nmcRegistrationNumber}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listDoctors();
