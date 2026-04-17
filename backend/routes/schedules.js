const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const DoctorSchedule = require('../models/DoctorSchedule');
const Doctor = require('../models/Doctor');

// Get doctor's schedule
router.get('/my-schedule', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can access this' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    let schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
    
    if (!schedule) {
      // Create default schedule if doesn't exist
      schedule = await DoctorSchedule.create({
        doctorId: doctor._id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        schedules: [
          { dayOfWeek: 'Monday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Friday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Saturday', isAvailable: false, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '17:00' }
        ]
      });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update doctor's schedule
router.put('/my-schedule', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can access this' });
    }

    const { schedules } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    let schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
    
    if (!schedule) {
      schedule = new DoctorSchedule({
        doctorId: doctor._id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        schedules
      });
    } else {
      schedule.schedules = schedules;
    }

    await schedule.save();
    res.json({ success: true, message: 'Schedule updated successfully', schedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor schedule by doctor ID (for receptionist/admin)
router.get('/doctor/:doctorId', protect, async (req, res) => {
  try {
    const schedule = await DoctorSchedule.findOne({ doctorId: req.params.doctorId });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Only return timing information
    const timingInfo = {
      doctorName: schedule.doctorName,
      doctorSpecialization: schedule.doctorSpecialization,
      schedules: schedule.schedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        isAvailable: s.isAvailable,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration
      }))
    };

    res.json({ success: true, schedule: timingInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all doctors schedules (for admin - view only)
router.get('/admin/all-schedules', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this' });
    }

    const schedules = await DoctorSchedule.find();
    
    // Return only timing information
    const timingInfo = schedules.map(schedule => ({
      doctorName: schedule.doctorName,
      doctorSpecialization: schedule.doctorSpecialization,
      schedules: schedule.schedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        isAvailable: s.isAvailable,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration
      }))
    }));

    res.json({ success: true, schedules: timingInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available time slots for a doctor on a specific date
router.get('/available-slots/:doctorId/:date', protect, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    const schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const daySchedule = schedule.schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({ success: true, slots: [] });
    }

    // Generate time slots
    const slots = [];
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(startHour, startMin, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0);

    while (currentTime < endTime) {
      const hours = String(currentTime.getHours()).padStart(2, '0');
      const minutes = String(currentTime.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + daySchedule.slotDuration);
    }

    res.json({ success: true, slots, dayOfWeek });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
