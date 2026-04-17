const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

// Create prescription (Doctor only) — patient looked up by email
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    const { patientEmail, ...rest } = req.body;

    // Find patient by email
    const patient = await User.findOne({ email: patientEmail, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'No patient found with that email' });
    }

    // Get doctor profile for name/specialization
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });

    const prescription = await Prescription.create({
      ...rest,
      patient: patient._id,
      patientEmail: patient.email,
      patientName: patient.name,
      doctor: req.user._id,
      doctorName: req.user.name,
      doctorSpecialization: doctorProfile?.specialization || ''
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get prescriptions
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescriptions = await Prescription.find(query).sort('-createdAt');
    res.json(prescriptions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single prescription
router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    if (req.user.role === 'patient' && prescription.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update prescription (Doctor only, own prescription)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update prescriptions' });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own prescriptions' });
    }

    const allowedFields = [
      'chiefComplaint',
      'diagnosis',
      'medications',
      'labTests',
      'notes',
      'followUpDate'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        prescription[field] = req.body[field];
      }
    });

    await prescription.save();
    res.json({ success: true, prescription, message: 'Prescription updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
