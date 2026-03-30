const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  institutionName: { type: String, required: true, trim: true },
  type: { type: String, enum: ['مستشفى', 'عيادة', 'مركز طبي', 'مختبر', 'مركز أشعة', 'صيدلية'], required: true },
  governorate: { type: String, required: true },
  address: { type: String, required: true },
  phone: [{ type: String }],
  email: { type: String },
  website: { type: String },
  logo: { type: String },
  images: [{ type: String }],
  description: { type: String, maxlength: 2000 },
  departments: [{ type: String }],
  workingHours: {
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday:   { open: String, close: String, isOpen: Boolean },
    monday:   { open: String, close: String, isOpen: Boolean },
    tuesday:  { open: String, close: String, isOpen: Boolean },
    wednesday:{ open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday:   { open: String, close: String, isOpen: Boolean },
  },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  isVerified: { type: Boolean, default: false },
  totalRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Institution', InstitutionSchema);
