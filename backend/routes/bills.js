const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const { protect, authorize } = require('../middleware/auth');

// Create bill
router.post('/', protect, authorize('receptionist', 'admin'), async (req, res) => {
  try {
    console.log('Creating bill with data:', req.body);
    console.log('User:', req.user);
    
    const billNumber = 'BILL-' + Date.now();
    const billData = {
      ...req.body,
      billNumber,
      receptionistId: req.user.id,
      receptionistName: req.user.name
    };

    if (billData.paymentMode === 'upi' && !billData.paymentStatus) {
      billData.paymentStatus = 'pending';
      billData.paidAmount = 0;
    }
    
    console.log('Bill data to save:', billData);
    const bill = await Bill.create(billData);
    console.log('Bill created successfully:', bill);
    res.status(201).json({ success: true, bill });
  } catch (error) {
    console.error('Bill creation error:', error);
    res.status(500).json({ message: error.message, error: error.toString() });
  }
});

// Hardcoded UPI payment simulation
router.post('/:id/pay-upi', protect, authorize('patient', 'receptionist', 'admin'), async (req, res) => {
  try {
    const { upiId, upiPin } = req.body;

    if (!upiId || !upiPin) {
      return res.status(400).json({ message: 'upiId and upiPin are required' });
    }

    // Hardcoded simulation pin for demo workflow.
    if (String(upiPin) !== '1234') {
      return res.status(400).json({ message: 'UPI payment failed: invalid demo PIN' });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (req.user.role === 'patient' && String(bill.patientId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only pay your own bills' });
    }

    const updated = await Bill.findByIdAndUpdate(
      req.params.id,
      {
        paymentMode: 'upi',
        paymentStatus: 'paid',
        upiId,
        upiTransactionId: `UPI-${Date.now()}`,
        paidAmount: bill.totalAmount,
        paidAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'name email phone');

    res.json({ success: true, message: 'UPI payment successful', bill: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bills
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    }
    const bills = await Bill.find(query).sort('-createdAt').populate('patientId', 'name email phone');
    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single bill
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('patientId', 'name email phone');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
