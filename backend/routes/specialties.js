const express = require('express');
const router = express.Router();
const Specialty = require('../models/Specialty');
const { protect, authorize } = require('../middleware/auth');

// Get all specialties
router.get('/', async (req, res) => {
  try {
    const specialties = await Specialty.find({ isActive: true });
    res.json({ success: true, count: specialties.length, specialties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single specialty
router.get('/:id', async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);
    
    if (!specialty) {
      return res.status(404).json({ message: 'Specialty not found' });
    }

    res.json({ success: true, specialty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create specialty (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const specialty = await Specialty.create(req.body);
    res.status(201).json({ success: true, specialty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update specialty (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const specialty = await Specialty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!specialty) {
      return res.status(404).json({ message: 'Specialty not found' });
    }

    res.json({ success: true, specialty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete specialty (soft delete, Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const specialty = await Specialty.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!specialty) {
      return res.status(404).json({ message: 'Specialty not found' });
    }

    res.json({ success: true, message: 'Specialty removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
