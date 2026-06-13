const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },

  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "10:30"
  duration: { type: Number, default: 30 },     // minutes

  type: {
    type: String,
    enum: ['اعتيادي', 'مستعجل', 'طارئ', 'كشف', 'متابعة', 'تحليل', 'استشارة'],
    default: 'اعتيادي'
  },
  priority: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'confirmed', 'cancelled', 'completed', 'no_show', 'rejected'],
    default: 'pending'
  },
  caseImage: { type: String }, // Path to uploaded image of condition
  paymentMethod: { type: String, enum: ['cash', 'mastercard', 'visa', 'zaincash'], default: 'cash' },

  // Future Systems
  insuranceProvider: { type: String, default: null },
  insuranceId: { type: String, default: null },
  discountCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },

  notes: { type: String, maxlength: 500 },
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  paymentAccountId: { type: mongoose.Schema.Types.ObjectId, default: null },
  transactionId: { type: String, default: null },

  // Reminder flags (used by cronJobs to avoid duplicate notifications)
  reminderHourSent: { type: Boolean, default: false },
  reminderDaySent: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index to prevent double booking
AppointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
