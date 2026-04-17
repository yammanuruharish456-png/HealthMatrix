const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  primaryInsurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    subscriberName: String,
    subscriberDOB: Date,
    relationshipToSubscriber: {
      type: String,
      enum: ['self', 'spouse', 'child', 'other'],
      default: 'self'
    },
    effectiveDate: Date,
    expirationDate: Date,
    copay: Number,
    deductible: Number,
    outOfPocketMax: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  secondaryInsurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    subscriberName: String,
    subscriberDOB: Date,
    relationshipToSubscriber: {
      type: String,
      enum: ['self', 'spouse', 'child', 'other']
    },
    effectiveDate: Date,
    expirationDate: Date,
    copay: Number,
    deductible: Number,
    outOfPocketMax: Number,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'expired', 'invalid'],
    default: 'pending'
  },
  lastVerified: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claims: [{
    claimNumber: String,
    serviceDate: Date,
    provider: String,
    diagnosis: String,
    amountBilled: Number,
    amountApproved: Number,
    amountPaid: Number,
    patientResponsibility: Number,
    status: {
      type: String,
      enum: ['submitted', 'processing', 'approved', 'denied', 'paid'],
      default: 'submitted'
    },
    submittedDate: Date,
    processedDate: Date,
    denialReason: String,
    notes: String
  }],
  preAuthorizations: [{
    authNumber: String,
    service: String,
    approvedAmount: Number,
    approvedUnits: Number,
    validFrom: Date,
    validTo: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'expired'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Insurance', insuranceSchema);