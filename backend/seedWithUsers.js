const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Specialty = require('./models/Specialty');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const specialties = [
  {
    name: 'Cardiology',
    description: 'Comprehensive cardiac care including diagnostics, interventional procedures, and cardiac surgery.',
    icon: 'heartbeat',
    services: ['Angioplasty', 'Bypass Surgery', 'Pacemaker Implantation', 'Heart Failure Management']
  },
  {
    name: 'Oncology',
    description: 'Advanced cancer treatment with chemotherapy, radiation therapy, and surgical oncology.',
    icon: 'ribbon',
    services: ['Chemotherapy', 'Radiation Therapy', 'Surgical Oncology', 'Immunotherapy']
  },
  {
    name: 'Neurology',
    description: 'Expert care for neurological disorders including stroke, epilepsy, and movement disorders.',
    icon: 'brain',
    services: ['Stroke Care', 'Epilepsy Treatment', 'Parkinson\'s Disease', 'Multiple Sclerosis']
  },
  {
    name: 'Orthopedics',
    description: 'Specialized treatment for bone, joint, and musculoskeletal conditions.',
    icon: 'bone',
    services: ['Joint Replacement', 'Sports Medicine', 'Spine Surgery', 'Trauma Care']
  },
  {
    name: 'Pediatrics',
    description: 'Comprehensive healthcare for infants, children, and adolescents.',
    icon: 'baby',
    services: ['Neonatal Care', 'Vaccination', 'Growth Monitoring', 'Pediatric Surgery']
  },
  {
    name: 'Gastroenterology',
    description: 'Treatment of digestive system disorders and liver diseases.',
    icon: 'stomach',
    services: ['Endoscopy', 'Colonoscopy', 'Liver Disease Treatment', 'IBD Management']
  }
];

const seedDatabase = async () => {
  try {
    await Specialty.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});

    await Specialty.insertMany(specialties);
    console.log('✅ Specialties seeded successfully');

    // Create users one by one to ensure password hashing works
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@amedic.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-800-ADMIN',
      isVerified: true
    });

    const doctor1 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@amedic.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1-800-123-4501',
      isVerified: true
    });

    const doctor2 = await User.create({
      name: 'Michael Chen',
      email: 'michael.chen@amedic.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1-800-123-4502',
      isVerified: true
    });

    const doctor3 = await User.create({
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@amedic.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1-800-123-4503',
      isVerified: true
    });

    const doctor4 = await User.create({
      name: 'David Thompson',
      email: 'david.thompson@amedic.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1-800-123-4504',
      isVerified: true
    });

    const doctor5 = await User.create({
      name: 'Lisa Anderson',
      email: 'lisa.anderson@amedic.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1-800-123-4505',
      isVerified: true
    });

    const doctor6 = await User.create({
      name: 'Robert Martinez',
      email: 'robert.martinez@amedic.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1-800-123-4506',
      isVerified: true
    });

    console.log('✅ Users seeded successfully');

    // Create doctor profiles
    await Doctor.create({
      userId: doctor1._id,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@amedic.com',
      phone: '+1-800-123-4501',
      specialization: 'Cardiology',
      nmcRegistrationNumber: 'NMC-2024-001',
      qualification: ['MD - Cardiology', 'MBBS', 'Fellowship in Interventional Cardiology'],
      experience: 15,
      about: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience.',
      consultationFee: 150,
      rating: 4.8,
      isActive: true,
      isVerified: true
    });

    await Doctor.create({
      userId: doctor2._id,
      name: 'Michael Chen',
      email: 'michael.chen@amedic.com',
      phone: '+1-800-123-4502',
      specialization: 'Oncology',
      nmcRegistrationNumber: 'NMC-2024-002',
      qualification: ['MD - Medical Oncology', 'MBBS', 'Fellowship in Cancer Research'],
      experience: 12,
      about: 'Dr. Michael Chen is a leading oncologist specializing in cancer treatment.',
      consultationFee: 200,
      rating: 4.9,
      isActive: true,
      isVerified: true
    });

    await Doctor.create({
      userId: doctor3._id,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@amedic.com',
      phone: '+1-800-123-4503',
      specialization: 'Neurology',
      nmcRegistrationNumber: 'NMC-2024-003',
      qualification: ['MD - Neurology', 'MBBS', 'Fellowship in Stroke Medicine'],
      experience: 10,
      about: 'Dr. Emily Rodriguez specializes in neurological disorders.',
      consultationFee: 180,
      rating: 4.7,
      isActive: true,
      isVerified: true
    });

    await Doctor.create({
      userId: doctor4._id,
      name: 'David Thompson',
      email: 'david.thompson@amedic.com',
      phone: '+1-800-123-4504',
      specialization: 'Orthopedics',
      nmcRegistrationNumber: 'NMC-2024-004',
      qualification: ['MS - Orthopedics', 'MBBS', 'Fellowship in Joint Replacement'],
      experience: 18,
      about: 'Dr. David Thompson is an expert orthopedic surgeon.',
      consultationFee: 160,
      rating: 4.8,
      isActive: true,
      isVerified: true
    });

    await Doctor.create({
      userId: doctor5._id,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@amedic.com',
      phone: '+1-800-123-4505',
      specialization: 'Pediatrics',
      nmcRegistrationNumber: 'NMC-2024-005',
      qualification: ['MD - Pediatrics', 'MBBS', 'Fellowship in Neonatology'],
      experience: 14,
      about: 'Dr. Lisa Anderson is a compassionate pediatrician.',
      consultationFee: 120,
      rating: 4.9,
      isActive: true,
      isVerified: true
    });

    await Doctor.create({
      userId: doctor6._id,
      name: 'Robert Martinez',
      email: 'robert.martinez@amedic.com',
      phone: '+1-800-123-4506',
      specialization: 'Gastroenterology',
      nmcRegistrationNumber: 'NMC-2024-006',
      qualification: ['MD - Gastroenterology', 'MBBS', 'Fellowship in Hepatology'],
      experience: 16,
      about: 'Dr. Robert Martinez specializes in digestive disorders.',
      consultationFee: 170,
      rating: 4.7,
      isActive: true,
      isVerified: true
    });

    console.log('✅ Doctors seeded successfully');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨💼 Admin:');
    console.log('   URL: http://localhost:3000/admin-login');
    console.log('   Email: admin@amedic.com');
    console.log('   Password: admin123');
    console.log('\n👨⚕️ Doctor:');
    console.log('   URL: http://localhost:3000/doctor-login');
    console.log('   Email: sarah.johnson@amedic.com');
    console.log('   Password: doctor123');
    console.log('\n👤 Patient:');
    console.log('   URL: http://localhost:3000/login');
    console.log('   Register a new account');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
