const express = require('express');
const router = express.Router();
const Insurance = require('../models/Insurance');
const { protect, authorize } = require('../middleware/auth');

// Get patient's insurance
router.get('/:patientId?', protect, async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    
    // Check authorization
    if (req.user.role === 'patient' && patientId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const insurance = await Insurance.findOne({ patientId }).populate('patientId', 'name email');
    
    res.json({ success: true, insurance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update insurance
router.post('/', protect, async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;
    
    let insurance = await Insurance.findOne({ patientId });
    
    if (insurance) {
      // Update existing
      Object.assign(insurance, req.body);
      insurance.updatedAt = new Date();
      await insurance.save();
    } else {
      // Create new
      insurance = await Insurance.create({
        ...req.body,
        patientId,
        updatedAt: new Date()
      });
    }
    
    res.status(201).json({ success: true, insurance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify insurance
router.post('/:patientId/verify', protect, authorize('receptionist', 'admin'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.body;
    
    const insurance = await Insurance.findOneAndUpdate(
      { patientId },
      {
        verificationStatus: status,
        lastVerified: new Date(),
        verifiedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }
    
    res.json({ success: true, insurance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add insurance claim
router.post('/:patientId/claims', protect, authorize('receptionist', 'admin'), async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const insurance = await Insurance.findOne({ patientId });
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }
    
    const claimNumber = 'CLM' + Date.now();
    const claim = {
      ...req.body,
      claimNumber,
      submittedDate: new Date()
    };
    
    insurance.claims.push(claim);
    insurance.updatedAt = new Date();
    await insurance.save();
    
    res.json({ success: true, claim, insurance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update claim status
router.put('/:patientId/claims/:claimId', protect, authorize('receptionist', 'admin'), async (req, res) => {
  try {
    const { patientId, claimId } = req.params;
    const { status, amountApproved, amountPaid, denialReason } = req.body;
    
    const insurance = await Insurance.findOne({ patientId });
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }
    
    const claim = insurance.claims.id(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    claim.status = status;
    if (amountApproved) claim.amountApproved = amountApproved;
    if (amountPaid) claim.amountPaid = amountPaid;
    if (denialReason) claim.denialReason = denialReason;
    claim.processedDate = new Date();
    
    insurance.updatedAt = new Date();
    await insurance.save();
    
    res.json({ success: true, claim, insurance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all insurance records (Admin/Receptionist)
router.get('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.verificationStatus = status;
    }
    
    const insurance = await Insurance.find(query)
      .populate('patientId', 'name email phone')
      .sort('-updatedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Insurance.countDocuments(query);
    
    res.json({
      success: true,
      insurance,
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

module.exports = router;