const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all staff
router.get('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    // Receptionists can only access verified nurse records for assignment workflows.
    if (req.user.role === 'receptionist') {
      query = {
        ...query,
        role: 'nurse',
        isVerified: true,
        isActive: true
      };
    }
    
    const staff = await Staff.find(query).sort('-createdAt');
    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify staff
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, isActive: true },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await User.findByIdAndUpdate(staff.userId, { isVerified: true });
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete staff
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    if (staff.userId) {
      await User.findByIdAndDelete(staff.userId);
    }
    res.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
