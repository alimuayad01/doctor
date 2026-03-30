const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  specialization: { type: String, required: [true, 'التخصص مطلوب'] },
  department: { type: String, required: true },
  bio: { type: String, maxlength: 1000 },
  governorate: { type: String, required: true },
  address: { type: String },
  consultationFee: { type: Number, default: 0 },
  languages: [{ type: String }],

  // Credentials
  credentials: [{
    type: { type: String, enum: ['شهادة', 'دبلوم', 'دكتوراه', 'بورد', 'زمالة', 'دورة'] },
    title: String,
    institution: String,
    year: Number,
    fileUrl: String,
  }],

  experience: [{
    position: String,
    hospital: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
  }],

  // Clinic/Lab info
  clinicName: { type: String },
  clinicAddress: { type: String },
  clinicPhone: { type: String },
  isLabDoctor: { type: Boolean, default: false },

  // Schedule: array of working days
  schedule: [{
    day: { type: String, enum: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] },
    startTime: String, // "09:00"
    endTime: String,   // "17:00"
    slotDuration: { type: Number, default: 30 }, // minutes
    isAvailable: { type: Boolean, default: true },
  }],

  // Blocked dates (holidays etc)
  blockedDates: [{ type: Date }],

  // Stats
  totalAppointments: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },

  isVerified: { type: Boolean, default: false },
  isAcceptingAppointments: { type: Boolean, default: true },
}, { timestamps: true });

// Full text search index
DoctorSchema.index({ specialization: 'text', clinicName: 'text', bio: 'text' });

module.exports = mongoose.model('Doctor', DoctorSchema);
