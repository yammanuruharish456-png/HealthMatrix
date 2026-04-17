const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientName: String,
  patientEmail: String,
  patientPhone: String,
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  specialty: String,
  reasonForVisit: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  notes: String,
  prescription: String,
  receptionistApproved: {
    type: Boolean,
    default: false
  },
  receptionistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receptionistName: String,
  receptionistActionDate: {
    type: Date
  },
  assignedNurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedNurseName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
