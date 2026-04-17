const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const VitalSigns = require('../models/VitalSigns');
const { protect, authorize } = require('../middleware/auth');

// Nurse dashboard: assigned patients list
router.get('/assigned-patients', protect, authorize('nurse', 'admin'), async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { status: { $in: ['confirmed', 'completed'] } }
      : { assignedNurseId: req.user.id, status: { $in: ['confirmed', 'completed'] } };

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone dateOfBirth gender')
      .populate('doctorId', 'name specialization')
      .sort('-appointmentDate');

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record new vitals
router.post('/vitals', protect, authorize('nurse', 'admin'), async (req, res) => {
  try {
    const vitalSigns = await VitalSigns.create({
      ...req.body,
      recordedBy: req.user.id,
      recordedByName: req.user.name
    });

    const populated = await VitalSigns.findById(vitalSigns._id).populate('recordedBy', 'name role');
    res.status(201).json({ success: true, vitalSigns: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update existing vitals
router.put('/vitals/:id', protect, authorize('nurse', 'admin'), async (req, res) => {
  try {
    const vital = await VitalSigns.findById(req.params.id);
    if (!vital) {
      return res.status(404).json({ message: 'Vitals not found' });
    }

    const updated = await VitalSigns.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        recordedBy: req.user.id,
        recordedByName: req.user.name,
        recordedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('recordedBy', 'name role');

    res.json({ success: true, vitalSigns: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient vitals for monitoring
router.get('/patient/:patientId/vitals', protect, authorize('nurse', 'doctor', 'admin'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitals = await VitalSigns.find({ patientId })
      .populate('recordedBy', 'name role')
      .sort('-recordedAt')
      .limit(20);

    res.json({ success: true, count: vitals.length, vitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
