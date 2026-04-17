const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
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
  patientPhone: String,
  patientEmail: String,
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  consultationFee: {
    type: Number,
    default: 0
  },
  labTests: [{
    testName: String,
    price: Number
  }],
  medicines: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  procedures: [{
    name: String,
    price: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net_banking', 'insurance'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'paid'
  },
  paidAmount: Number,
  upiId: String,
  upiTransactionId: String,
  paidAt: Date,
  receptionistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receptionistName: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', billSchema);
