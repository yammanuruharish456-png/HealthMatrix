const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all doctors (including unverified for admin)
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = {};

    if (specialization) {
      query.specialization = specialization;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query).sort('-rating');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify doctor (Admin only)
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, isActive: true },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update user verification status
    await User.findByIdAndUpdate(doctor.userId, { isVerified: true });

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, patientId } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.reviews.push({ patientId, rating, comment });
    
    const totalRating = doctor.reviews.reduce((acc, review) => acc + review.rating, 0);
    doctor.rating = totalRating / doctor.reviews.length;

    await doctor.save();

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new doctor (Admin only)
router.post('/add', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update doctor (Admin only)
router.put('/:id/update', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete doctor (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Also delete user account
    if (doctor.userId) {
      await User.findByIdAndDelete(doctor.userId);
    }

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
