const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const SystemConfig = require('../models/SystemConfig');
const { protect, authorize } = require('../middleware/auth');

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
router.put('/:id', protect, authorize('admin'), async (req, res) => {
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
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Doctor deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      success: true,
      stats: {
        doctors: totalDoctors,
        patients: totalPatients,
        appointments: totalAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (Admin only)
router.post('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone, isVerified, gender, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      isVerified: typeof isVerified === 'boolean' ? isVerified : true,
      gender,
      address
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (Admin only)
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get system configuration (Admin only)
router.get('/config', protect, authorize('admin'), async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ key: 'global' });
    if (!config) {
      config = await SystemConfig.create({
        key: 'global',
        settings: {
          hospitalName: 'Health Matrix Hospital',
          supportEmail: 'support@healthmatrix.com',
          defaultAppointmentDuration: 30,
          allowSelfRegistration: true,
          themeAccent: '#2D9CDB'
        }
      });
    }

    res.json({ success: true, config: config.settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update system configuration (Admin only)
router.put('/config', protect, authorize('admin'), async (req, res) => {
  try {
    const config = await SystemConfig.findOneAndUpdate(
      { key: 'global' },
      {
        settings: req.body,
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, config: config.settings, message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
