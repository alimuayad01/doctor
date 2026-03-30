const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['مختبر تحاليل', 'مركز أشعة', 'مركز تصوير طبي', 'بصريات'], required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  governorate: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  services: [{
    name: String,
    price: Number,
    duration: String, // "2 ساعات", "يوم واحد"
    description: String,
  }],
  workingHours: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LabOrderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  services: [{ name: String, price: Number }],
  totalPrice: { type: Number, default: 0 },
  date: { type: Date, required: true },
  time: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'delivered'],
    default: 'pending'
  },
  resultNotes: { type: String },
  resultFiles: [{ type: String }],
  notificationSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Lab: mongoose.model('Lab', LabSchema),
  LabOrder: mongoose.model('LabOrder', LabOrderSchema),
};
