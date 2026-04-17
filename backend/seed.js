const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

const doctors = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@amedic.com',
    phone: '+1-800-123-4501',
    specialization: 'Cardiology',
    qualification: ['MD - Cardiology', 'MBBS', 'Fellowship in Interventional Cardiology'],
    experience: 15,
    about: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating complex cardiac conditions. She specializes in interventional cardiology and has performed over 2000 successful procedures.',
    consultationFee: 150,
    availability: [
      {
        day: 'Monday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '10:00', endTime: '11:00', isAvailable: true },
          { startTime: '14:00', endTime: '15:00', isAvailable: true }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '10:00', endTime: '11:00', isAvailable: true }
        ]
      }
    ],
    rating: 4.8,
    isActive: true
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@amedic.com',
    phone: '+1-800-123-4502',
    specialization: 'Oncology',
    qualification: ['MD - Medical Oncology', 'MBBS', 'Fellowship in Cancer Research'],
    experience: 12,
    about: 'Dr. Michael Chen is a leading oncologist specializing in cancer treatment and research. He has published numerous papers on innovative cancer therapies.',
    consultationFee: 200,
    availability: [
      {
        day: 'Tuesday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '11:00', endTime: '12:00', isAvailable: true }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          { startTime: '14:00', endTime: '15:00', isAvailable: true },
          { startTime: '15:00', endTime: '16:00', isAvailable: true }
        ]
      }
    ],
    rating: 4.9,
    isActive: true
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@amedic.com',
    phone: '+1-800-123-4503',
    specialization: 'Neurology',
    qualification: ['MD - Neurology', 'MBBS', 'Fellowship in Stroke Medicine'],
    experience: 10,
    about: 'Dr. Emily Rodriguez specializes in neurological disorders with a focus on stroke care and epilepsy management.',
    consultationFee: 180,
    availability: [
      {
        day: 'Monday',
        slots: [
          { startTime: '10:00', endTime: '11:00', isAvailable: true },
          { startTime: '15:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        day: 'Friday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '10:00', endTime: '11:00', isAvailable: true }
        ]
      }
    ],
    rating: 4.7,
    isActive: true
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@amedic.com',
    phone: '+1-800-123-4504',
    specialization: 'Orthopedics',
    qualification: ['MS - Orthopedics', 'MBBS', 'Fellowship in Joint Replacement'],
    experience: 18,
    about: 'Dr. David Thompson is an expert orthopedic surgeon with extensive experience in joint replacement and sports medicine.',
    consultationFee: 160,
    availability: [
      {
        day: 'Wednesday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '14:00', endTime: '15:00', isAvailable: true }
        ]
      },
      {
        day: 'Saturday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true }
        ]
      }
    ],
    rating: 4.8,
    isActive: true
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@amedic.com',
    phone: '+1-800-123-4505',
    specialization: 'Pediatrics',
    qualification: ['MD - Pediatrics', 'MBBS', 'Fellowship in Neonatology'],
    experience: 14,
    about: 'Dr. Lisa Anderson is a compassionate pediatrician dedicated to providing comprehensive care for children of all ages.',
    consultationFee: 120,
    availability: [
      {
        day: 'Monday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '10:00', endTime: '11:00', isAvailable: true },
          { startTime: '11:00', endTime: '12:00', isAvailable: true }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          { startTime: '14:00', endTime: '15:00', isAvailable: true },
          { startTime: '15:00', endTime: '16:00', isAvailable: true }
        ]
      }
    ],
    rating: 4.9,
    isActive: true
  },
  {
    name: 'Robert Martinez',
    email: 'robert.martinez@amedic.com',
    phone: '+1-800-123-4506',
    specialization: 'Gastroenterology',
    qualification: ['MD - Gastroenterology', 'MBBS', 'Fellowship in Hepatology'],
    experience: 16,
    about: 'Dr. Robert Martinez specializes in digestive disorders and liver diseases with expertise in advanced endoscopic procedures.',
    consultationFee: 170,
    availability: [
      {
        day: 'Tuesday',
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '10:00', endTime: '11:00', isAvailable: true }
        ]
      },
      {
        day: 'Friday',
        slots: [
          { startTime: '14:00', endTime: '15:00', isAvailable: true },
          { startTime: '15:00', endTime: '16:00', isAvailable: true }
        ]
      }
    ],
    rating: 4.7,
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    await Specialty.deleteMany({});
    await Doctor.deleteMany({});

    await Specialty.insertMany(specialties);
    console.log('Specialties seeded successfully');

    await Doctor.insertMany(doctors);
    console.log('Doctors seeded successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
