const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Receptionist: Register a new patient
router.post('/register-patient', protect, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Only receptionists can register patients' });
    }

    const { name, phone, city, email } = req.body;

    // Validate required fields
    if (!name || !phone || !city) {
      return res.status(400).json({ message: 'Name, phone, and city are required' });
    }

    // Check if patient already exists
    if (email) {
      const existingPatient = await User.findOne({ email });
      if (existingPatient) {
        return res.status(400).json({ message: 'Patient with this email already exists' });
      }
    }

    // Create patient account
    const patient = await User.create({
      name,
      email: email || `patient_${Date.now()}@healthmatrix.com`,
      password: Math.random().toString(36).slice(-8), // Generate random password
      phone,
      role: 'patient',
      isVerified: true,
      // User model stores address as a string field.
      address: city
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        city: patient.address || city
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Receptionist: Book appointment for patient
router.post('/book-appointment', protect, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Only receptionists can book appointments' });
    }

    const { patientId, doctorId, appointmentDate, timeSlot, reasonForVisit, specialty } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.startTime': timeSlot,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorId,
      doctorName: doctor.name,
      specialty: specialty || doctor.specialization,
      appointmentDate: new Date(appointmentDate),
      timeSlot: {
        startTime: timeSlot,
        endTime: timeSlot // Can be calculated based on slot duration
      },
      reasonForVisit: reasonForVisit || 'General Checkup',
      status: 'confirmed',
      bookedBy: 'receptionist',
      bookedByStaffId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot.startTime,
        status: appointment.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Receptionist: Get all doctors with their availability
router.get('/available-doctors', protect, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Only receptionists can access this' });
    }

    const doctors = await Doctor.find({ isActive: true }).select('name specialization consultationFee');
    
    res.json({
      success: true,
      doctors: doctors.map(doc => ({
        id: doc._id,
        name: doc.name,
        specialization: doc.specialization,
        consultationFee: doc.consultationFee
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Receptionist: Get patient appointments
router.get('/patient-appointments/:patientId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Only receptionists can access this' });
    }

    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialization')
      .sort({ appointmentDate: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
