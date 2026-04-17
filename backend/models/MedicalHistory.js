const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    dateIdentified: Date
  }],
  chronicConditions: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'managed'],
      default: 'active'
    },
    notes: String
  }],
  surgeries: [{
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String,
    complications: String,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    status: {
      type: String,
      enum: ['active', 'discontinued', 'completed'],
      default: 'active'
    }
  }],
  familyHistory: [{
    relation: String,
    condition: String,
    ageAtDiagnosis: Number,
    notes: String
  }],
  socialHistory: {
    smoking: {
      status: {
        type: String,
        enum: ['never', 'former', 'current']
      },
      packsPerDay: Number,
      yearsSmoked: Number
    },
    alcohol: {
      status: {
        type: String,
        enum: ['never', 'occasional', 'regular', 'heavy']
      },
      drinksPerWeek: Number
    },
    exercise: {
      frequency: String,
      type: String
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);