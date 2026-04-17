const mongoose = require('mongoose');

const vitalSignsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedByName: String,
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        default: 'breaths/min'
      }
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    bmi: Number
  },
  notes: String,
  recordedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate BMI before saving
vitalSignsSchema.pre('save', function(next) {
  if (this.vitals.weight?.value && this.vitals.height?.value) {
    const weightInKg = this.vitals.weight.unit === 'lbs' ? 
      this.vitals.weight.value * 0.453592 : this.vitals.weight.value;
    const heightInM = this.vitals.height.unit === 'inches' ? 
      this.vitals.height.value * 0.0254 : this.vitals.height.value / 100;
    
    this.vitals.bmi = Math.round((weightInKg / (heightInM * heightInM)) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('VitalSigns', vitalSignsSchema);