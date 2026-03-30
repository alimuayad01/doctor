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
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, role, governorate, specialization, department, institutionName, institutionType } = req.body;

    if (!phone) return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });

    // Check duplicate phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ success: false, message: 'رقم الهاتف مستخدم مسبقاً' });

    // Check duplicate email (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم مسبقاً' });
    }

    // Create user
    const user = await User.create({ name, email: email || undefined, phone, password, role: role || 'patient', governorate });

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
    next(err);
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone
    if (!identifier || !password)
      return res.status(400).json({ success: false, message: 'رقم الهاتف/البريد وكلمة المرور مطلوبان' });

    // Find user by email OR phone
    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }] 
    }).select('+password');

    if (!user) return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;
    if (user.role === 'doctor') profile = await Doctor.findOne({ user: user._id });
    if (user.role === 'institution') profile = await Institution.findOne({ user: user._id });
    res.json({ success: true, user, profile });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/auth/notifications
router.get('/notifications', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, notifications: user.notifications.sort((a,b) => b.createdAt - a.createdAt) });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/auth/notifications/read
router.put('/notifications/read', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].isRead': true } });
    res.json({ success: true, message: 'تم تعليم الإشعارات كمقروءة' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
