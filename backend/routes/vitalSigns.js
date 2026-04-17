const express = require('express');
const router = express.Router();
const VitalSigns = require('../models/VitalSigns');
const { protect } = require('../middleware/auth');

// Get patient's vital signs
router.get('/:patientId?', protect, async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    const { limit = 10, page = 1 } = req.query;
    
    // Check authorization
    if (req.user.role === 'patient' && patientId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const vitals = await VitalSigns.find({ patientId })
      .populate('recordedBy', 'name role')
      .sort('-recordedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await VitalSigns.countDocuments({ patientId });
    
    res.json({ 
      success: true, 
      vitals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record new vital signs
router.post('/', protect, async (req, res) => {
  try {
    if (!['nurse', 'doctor', 'receptionist', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only care staff can record vitals' });
    }

    const vitalSigns = await VitalSigns.create({
      ...req.body,
      recordedBy: req.user.id,
      recordedByName: req.user.name
    });
    
    await vitalSigns.populate('recordedBy', 'name role');
    
    res.status(201).json({ success: true, vitalSigns });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update recorded vital signs
router.put('/:id', protect, async (req, res) => {
  try {
    const vitalRecord = await VitalSigns.findById(req.params.id);
    if (!vitalRecord) {
      return res.status(404).json({ message: 'Vital signs record not found' });
    }

    const canEdit =
      req.user.role === 'admin' ||
      req.user.role === 'nurse' ||
      vitalRecord.recordedBy.toString() === req.user.id;

    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await VitalSigns.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        recordedBy: req.user.id,
        recordedByName: req.user.name,
        recordedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('recordedBy', 'name role');

    res.json({ success: true, vitalSigns: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vital signs trends
router.get('/:patientId/trends', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const vitals = await VitalSigns.find({
      patientId,
      recordedAt: { $gte: startDate }
    }).sort('recordedAt');
    
    // Process data for trends
    const trends = {
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      weight: [],
      dates: []
    };
    
    vitals.forEach(vital => {
      const date = vital.recordedAt.toISOString().split('T')[0];
      trends.dates.push(date);
      
      trends.bloodPressure.push({
        systolic: vital.vitals.bloodPressure?.systolic || null,
        diastolic: vital.vitals.bloodPressure?.diastolic || null,
        date
      });
      
      trends.heartRate.push({
        value: vital.vitals.heartRate?.value || null,
        date
      });
      
      trends.temperature.push({
        value: vital.vitals.temperature?.value || null,
        date
      });
      
      trends.weight.push({
        value: vital.vitals.weight?.value || null,
        date
      });
    });
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest vital signs
router.get('/:patientId/latest', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const latestVitals = await VitalSigns.findOne({ patientId })
      .populate('recordedBy', 'name role')
      .sort('-recordedAt');
    
    res.json({ success: true, vitals: latestVitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;