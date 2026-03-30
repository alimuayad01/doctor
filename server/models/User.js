const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'الاسم مطلوب'], trim: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'بريد إلكتروني غير صالح']
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: [true, 'رقم الهاتف مستخدم مسبقاً'],
    trim: true
  },
  password: { type: String, required: [true, 'كلمة المرور مطلوبة'], minlength: 6, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'institution', 'admin'], default: 'patient' },
  governorate: { type: String },
  avatar: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  notifications: [{
    message: String,
    type: { type: String, enum: ['appointment', 'lab', 'review', 'system'] },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed,
  }],
  fcmToken: { type: String, default: null },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', UserSchema);
