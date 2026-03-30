const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Institution = require('../models/Institution');
const { protect } = require('../middleware/auth');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      governorate: user.governorate,
    }
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, governorate, specialization, department, institutionName, institutionType } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم مسبقاً' });

    // Create user
    const user = await User.create({ name, email, phone, password, role: role || 'patient', governorate });

    // If doctor, create doctor profile
    if (role === 'doctor') {
      if (!specialization || !department) {
        return res.status(400).json({ success: false, message: 'التخصص والقسم مطلوبان للحساب الطبي' });
      }
      await Doctor.create({ user: user._id, specialization, department, governorate });
    }

    // If institution, create institution profile
    if (role === 'institution') {
      if (!institutionName || !institutionType) {
        return res.status(400).json({ success: false, message: 'اسم المؤسسة ونوعها مطلوبان' });
      }
      await Institution.create({
        user: user._id,
        institutionName,
        type: institutionType,
        governorate,
        address: req.body.address || '',
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'البريد وكلمة المرور مطلوبان' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;
    if (user.role === 'doctor') profile = await Doctor.findOne({ user: user._id });
    if (user.role === 'institution') profile = await Institution.findOne({ user: user._id });
    res.json({ success: true, user, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/auth/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, notifications: user.notifications.sort((a,b) => b.createdAt - a.createdAt) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/auth/notifications/read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].isRead': true } });
    res.json({ success: true, message: 'تم تعليم الإشعارات كمقروءة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
