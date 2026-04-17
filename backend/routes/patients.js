const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all patients (for staff/admin)
router.get('/', protect, authorize('admin', 'doctor', 'lab_technician', 'receptionist', 'nurse'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ success: true, count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient profile
router.get('/profile', protect, async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password');
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update patient profile
router.put('/profile', protect, async (req, res) => {
  try {
    const patient = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
