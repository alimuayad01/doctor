const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { encrypt } = require('../utils/crypto');

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
    trim: true
  },
  additionalPhones: [{ type: String, trim: true }],
  phoneHash: {
    type: String,
    unique: true,
    sparse: true
  },
  password: { type: String, required: [true, 'كلمة المرور مطلوبة'], minlength: 6, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'institution', 'admin'], default: 'patient' },
  governorate: { type: String },
  avatar: { type: String, default: null },
  isVerified: { type: Boolean, default: false }, // General verification (e.g. for doctors)
  isPhoneVerified: { type: Boolean, default: false },
  verificationCode: { type: String, select: false },
  verificationExpires: { type: Date, select: false },
  isActive: { type: Boolean, default: true },
  notifications: [{
    message: String,
    type: { type: String, enum: ['appointment', 'lab', 'review', 'system'] },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed,
  }],
  paymentAccounts: [{
    accountType: { type: String, enum: ['card', 'zaincash'], required: true },
    provider: { type: String, enum: ['mastercard', 'visa', 'zaincash'] },
    holderName: String,
    last4: String,
    expiryDate: String,
    walletNumber: String,
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  fcmToken: { type: String, default: null },
}, { timestamps: true });

// Actions before save
UserSchema.pre('save', async function () {
  if (this.isModified('phone')) {
    // 1. Create searchable hash for uniqueness check
    this.phoneHash = crypto.createHash('sha256').update(this.phone).digest('hex');
    // 2. Encrypt actual phone with random IV
    this.phone = encrypt(this.phone);
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
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
