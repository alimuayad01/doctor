const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/institutions  (Public)
router.get('/', async (req, res) => {
  try {
    const { governorate, type } = req.query;
    const query = {};
    if (governorate) query.governorate = governorate;
    if (type) query.type = type;

    const institutions = await Institution.find(query)
      .populate('user', 'name avatar phone')
      .populate({ path: 'doctors', populate: { path: 'user', select: 'name avatar' } })
      .sort({ totalReviews: -1 });
    res.json({ success: true, institutions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/institutions/:id  (Public)
router.get('/:id', async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate({ path: 'doctors', populate: { path: 'user', select: 'name avatar' } });
    if (!inst) return res.status(404).json({ success: false, message: 'المؤسسة غير موجودة' });
    res.json({ success: true, institution: inst });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/institutions/profile  (Institution only)
router.put('/profile', protect, authorize('institution'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]), async (req, res) => {
  try {
    const inst = await Institution.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: 'ملف المؤسسة غير موجود' });

    const fields = ['institutionName', 'type', 'address', 'description', 'website', 'workingHours', 'departments'];
    fields.forEach(f => { if (req.body[f]) inst[f] = typeof req.body[f] === 'string' && f !== 'departments' && f !== 'workingHours' ? req.body[f] : JSON.parse(req.body[f] instanceof Object ? JSON.stringify(req.body[f]) : req.body[f]); });

    if (req.files?.logo) inst.logo = `/uploads/institutions/${req.files.logo[0].filename}`;
    if (req.files?.images) inst.images.push(...req.files.images.map(f => `/uploads/institutions/${f.filename}`));

    await inst.save();
    res.json({ success: true, institution: inst });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/institutions/add-doctor  (Institution: add doctor)
router.post('/add-doctor', protect, authorize('institution'), async (req, res) => {
  try {
    const inst = await Institution.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: 'المؤسسة غير موجودة' });

    const { doctorId } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'الطبيب غير موجود' });

    if (inst.doctors.includes(doctorId))
      return res.status(400).json({ success: false, message: 'الطبيب مضاف مسبقاً' });

    inst.doctors.push(doctorId);
    await inst.save();
    await Doctor.findByIdAndUpdate(doctorId, { institution: inst._id });

    res.json({ success: true, message: 'تم إضافة الطبيب للمؤسسة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
