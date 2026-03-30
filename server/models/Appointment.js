const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },

  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "10:30"
  duration: { type: Number, default: 30 },     // minutes

  type: { type: String, enum: ['كشف', 'متابعة', 'تحليل', 'استشارة'], default: 'كشف' },
  notes: { type: String, maxlength: 500 },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },

  cancellationReason: { type: String },
  cancelledBy: { type: String, enum: ['patient', 'doctor', 'institution', 'system'] },

  // Notification tracking
  reminderDaySent: { type: Boolean, default: false },
  reminderHourSent: { type: Boolean, default: false },

  // Lab result notification
  labResultReady: { type: Boolean, default: false },
  labResultNotes: { type: String },

  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index to prevent double booking
AppointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
