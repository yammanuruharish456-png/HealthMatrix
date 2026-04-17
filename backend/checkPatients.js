require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkPatients = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const patients = await User.find({ role: 'patient' });
    
    console.log(`Total patients: ${patients.length}\n`);
    
    if (patients.length === 0) {
      console.log('❌ No patient accounts found!');
      console.log('\nPlease register a new patient at: http://localhost:3000/register');
    } else {
      console.log('✅ Patient accounts found:\n');
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.name}`);
        console.log(`   Email: ${patient.email}`);
        console.log(`   Phone: ${patient.phone || 'N/A'}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPatients();
