const express = require('express');
const router = express.Router();
const LabReport = require('../models/LabReport');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendTestResultNotification } = require('../utils/email');

// Create lab report request (Doctor) or new report (Lab Technician)
router.post('/', protect, async (req, res) => {
  try {
    const reportNumber = 'LAB-' + Date.now();
    const reportData = {
      ...req.body,
      reportNumber
    };

    // If doctor is creating a request
    if (req.user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor) {
        reportData.doctorId = doctor._id;
        reportData.doctorName = doctor.name;
      }
      reportData.requestedBy = req.user.id;
      reportData.status = 'requested';
    }
    
    // If lab technician is creating a new report
    if (req.user.role === 'lab_technician') {
      reportData.technicianId = req.user.id;
      reportData.technicianName = req.user.name;
      if (!reportData.status) {
        reportData.status = 'completed';
      }
    }

    const report = await LabReport.create(reportData);
    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('Lab report creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all reports
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor) {
        query.doctorId = doctor._id;
      }
    }
    const reports = await LabReport.find(query).sort('-createdAt').populate('patientId', 'name email phone').populate('doctorId', 'name specialization');
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single report
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update report (Lab Technician completes, Doctor reviews)
router.put('/:id', protect, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.user.role === 'lab_technician' && req.body.status === 'completed') {
      updateData.technicianId = req.user.id;
      updateData.technicianName = req.user.name;
      updateData.reportGeneratedAt = new Date();
    }
    
    if (req.user.role === 'doctor' && req.body.status === 'reviewed') {
      updateData.reviewedBy = req.user.id;
      updateData.reviewedAt = new Date();
      
      // Send test result notification when doctor reviews
      const report = await LabReport.findById(req.params.id).populate('patientId', 'name email');
      if (report && report.patientId) {
        try {
          await sendTestResultNotification(
            report.patientId.email,
            report.patientId.name,
            report.testType,
            req.user.name
          );
        } catch (emailError) {
          console.error('Failed to send test result notification:', emailError);
        }
      }
    }
    
    const report = await LabReport.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (error) {
    console.error('Lab report update error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
