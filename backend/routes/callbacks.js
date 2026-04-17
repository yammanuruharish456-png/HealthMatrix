const express = require('express');
const router = express.Router();
const CallbackRequest = require('../models/CallbackRequest');
const { protect, authorize } = require('../middleware/auth');

// Create callback request
router.post('/', protect, async (req, res) => {
  try {
    const { query } = req.body;
    
    const callback = await CallbackRequest.create({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      userRole: req.user.role,
      query
    });
    
    res.status(201).json({ success: true, callback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all callback requests (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const callbacks = await CallbackRequest.find().sort('-createdAt').populate('userId', 'name email phone');
    res.json({ success: true, count: callbacks.length, callbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update callback status (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateData = { status, adminNotes };
    
    if (status === 'contacted') {
      updateData.contactedAt = new Date();
    }
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    const callback = await CallbackRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, callback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
