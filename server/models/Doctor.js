const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  specialization: { type: String, required: [true, 'التخصص مطلوب'] },
  department: { type: String, required: true },
  bio: { type: String, maxlength: 1000 },
  governorate: { type: String, required: true },
  address: { type: String },

  // Pricing
  consultationFee: { type: Number, default: 25000 },
  specialConsultationFee: { type: Number, default: 30000 },
  emergencyConsultationFee: { type: Number, default: 35000 },

  additionalPhones: [{ type: String }],
  
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

  // Schedule
  schedule: [{
    day: { type: String, enum: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "17:00" },
    slotDuration: { type: Number, default: 30 },
    isAvailable: { type: Boolean, default: true },
  }],

  offDays: [{ 
    date: Date,
    reason: String
  }],
  blockedDates: [{ type: Date }],

  totalAppointments: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },

  location: {
    lat: { type: Number, default: 33.3152 },
    lng: { type: Number, default: 44.3661 }
  },
  
  autoApprove: {
    normal: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    emergency: { type: Boolean, default: false },
  },

  isVerified: { type: Boolean, default: false },
  isAcceptingAppointments: { type: Boolean, default: true },
}, { timestamps: true });

DoctorSchema.index({ specialization: 'text', clinicName: 'text', bio: 'text' });

module.exports = mongoose.model('Doctor', DoctorSchema);
