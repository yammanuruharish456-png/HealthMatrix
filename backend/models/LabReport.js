const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  reportNumber: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: String,
  patientAge: Number,
  patientGender: String,
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  doctorName: String,
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  testType: {
    type: String,
    required: true
  },
  testCategory: {
    type: String,
    enum: ['blood_test', 'urine_test', 'xray', 'mri', 'ct_scan', 'ultrasound', 'ecg', 'other']
  },
  testResults: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical']
    }
  }],
  findings: String,
  recommendations: String,
  reportFile: String, // File path or base64 data
  reportFileName: String,
  reportFileType: String,
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  technicianName: String,
  status: {
    type: String,
    enum: ['requested', 'in_progress', 'completed', 'reviewed'],
    default: 'requested'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date,
  sampleCollectedAt: Date,
  reportGeneratedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LabReport', labReportSchema);
