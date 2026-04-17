const express = require('express');
const router = express.Router();
const MedicalHistory = require('../models/MedicalHistory');
const { protect } = require('../middleware/auth');

// Get patient's medical history
router.get('/:patientId?', protect, async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    
    // Check authorization
    if (req.user.role === 'patient' && patientId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const history = await MedicalHistory.findOne({ patientId }).populate('patientId', 'name email');
    
    if (!history) {
      return res.json({ success: true, history: null });
    }
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update medical history
router.post('/', protect, async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;
    
    let history = await MedicalHistory.findOne({ patientId });
    
    if (history) {
      // Update existing
      Object.assign(history, req.body);
      history.updatedAt = new Date();
      await history.save();
    } else {
      // Create new
      history = await MedicalHistory.create({
        ...req.body,
        patientId,
        updatedAt: new Date()
      });
    }
    
    res.status(201).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add allergy
router.post('/:patientId/allergies', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let history = await MedicalHistory.findOne({ patientId });
    if (!history) {
      history = await MedicalHistory.create({ patientId, allergies: [] });
    }
    
    history.allergies.push(req.body);
    history.updatedAt = new Date();
    await history.save();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add surgery
router.post('/:patientId/surgeries', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let history = await MedicalHistory.findOne({ patientId });
    if (!history) {
      history = await MedicalHistory.create({ patientId, surgeries: [] });
    }
    
    history.surgeries.push(req.body);
    history.updatedAt = new Date();
    await history.save();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add chronic condition
router.post('/:patientId/conditions', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let history = await MedicalHistory.findOne({ patientId });
    if (!history) {
      history = await MedicalHistory.create({ patientId, chronicConditions: [] });
    }
    
    history.chronicConditions.push(req.body);
    history.updatedAt = new Date();
    await history.save();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;