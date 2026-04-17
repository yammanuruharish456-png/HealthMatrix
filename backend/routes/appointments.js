const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { sendAppointmentReminder } = require('../utils/email');

// Create appointment
router.post('/', protect, async (req, res) => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      patientId: req.user.id
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all appointments (for admin/doctor)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      // Find doctor record by userId
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor) {
        query.doctorId = doctor._id;
      }
    } else if (req.user.role === 'nurse') {
      query.assignedNurseId = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort('-createdAt');

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (
      req.user.role === 'patient' &&
      appointment.patientId?._id?.toString?.() !== req.user.id &&
      appointment.patientId?.toString?.() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const existingAppointment = await Appointment.findById(req.params.id);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Patients can only update their own appointments and only status to cancelled.
    if (req.user.role === 'patient') {
      if (existingAppointment.patientId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own appointments' });
      }
      if (req.body.status !== 'cancelled') {
        return res.status(403).json({ message: 'Patients can only cancel appointments from this action' });
      }
    }

    const updateData = { ...req.body, updatedAt: Date.now() };
    
    // If receptionist is updating, add receptionist action date
    if (req.user.role === 'receptionist' && (req.body.status === 'confirmed' || req.body.status === 'cancelled')) {
      updateData.receptionistActionDate = new Date();
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Send appointment reminder when confirmed
    if (req.body.status === 'confirmed' && appointment.patientEmail) {
      try {
        await sendAppointmentReminder(
          appointment.patientEmail,
          appointment.patientName,
          appointment.doctorId?.name || 'Doctor',
          appointment.appointmentDate,
          appointment.timeSlot?.startTime || 'TBD'
        );
      } catch (emailError) {
        console.error('Failed to send appointment reminder:', emailError);
      }
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reschedule appointment (Patient/Receptionist/Admin)
router.put('/:id/reschedule', protect, authorize('patient', 'receptionist', 'admin'), async (req, res) => {
  try {
    const { appointmentDate, timeSlot } = req.body;

    if (!appointmentDate || !timeSlot || !timeSlot.startTime) {
      return res.status(400).json({ message: 'appointmentDate and timeSlot.startTime are required' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only reschedule your own appointments' });
    }

    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.startTime': timeSlot.startTime,
      status: { $in: ['pending', 'confirmed', 'rescheduled'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Selected slot is not available' });
    }

    appointment.appointmentDate = new Date(appointmentDate);
    appointment.timeSlot = {
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime || timeSlot.startTime
    };
    appointment.status = 'rescheduled';
    appointment.updatedAt = Date.now();
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization');

    res.json({ success: true, appointment: populated, message: 'Appointment rescheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign nurse to appointment
router.put('/:id/assign-nurse', protect, authorize('receptionist', 'admin'), async (req, res) => {
  try {
    const { nurseId, nurseName } = req.body;

    if (!nurseId) {
      return res.status(400).json({ message: 'nurseId is required' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        assignedNurseId: nurseId,
        assignedNurseName: nurseName || '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const existingAppointment = await Appointment.findById(req.params.id);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && existingAppointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
