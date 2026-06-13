const express = require('express');
const router = express.Router();
const { Lab, LabOrder } = require('../models/Lab');
const { protect, authorize } = require('../middleware/auth');
const { addNotification } = require('../services/notificationService');

// @route GET /api/labs  (Public)
router.get('/', async (req, res) => {
  try {
    const { governorate, type } = req.query;
    const query = { isActive: true };
    if (governorate) query.governorate = governorate;
    if (type) query.type = type;
    const labs = await Lab.find(query)
      .populate('doctor', 'specialization')
      .populate('institution', 'institutionName');
    res.json({ success: true, labs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/labs  (Doctor or Institution)
router.post('/', protect, authorize('doctor', 'institution'), async (req, res) => {
  try {
    const lab = await Lab.create({ ...req.body });
    res.status(201).json({ success: true, lab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/labs/order  (Patient books lab)
router.post('/order', protect, authorize('patient'), async (req, res) => {
  try {
    const { labId, services, date, time } = req.body;
    const total = (services || []).reduce((sum, s) => sum + (s.price || 0), 0);
    const order = await LabOrder.create({
      patient: req.user._id,
      lab: labId,
      services,
      totalPrice: total,
      date: new Date(date),
      time,
    });

    await addNotification(req.user._id, {
      message: `🔬 تم تأكيد حجزك في المختبر بتاريخ ${new Date(date).toLocaleDateString('ar-IQ')} الساعة ${time}`,
      type: 'lab',
      data: { orderId: order._id }
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/labs/order/:id/ready  (Doctor/Institution: mark result ready)
router.put('/order/:id/ready', protect, authorize('doctor', 'institution'), async (req, res) => {
  try {
    const order = await LabOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'ready', resultNotes: req.body.resultNotes, notificationSent: true },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

    // Notify patient
    await addNotification(order.patient, {
      message: `✅ نتائج تحاليلك جاهزة! يمكنك استلامها من المختبر`,
      type: 'lab',
      data: { orderId: order._id }
    });

    res.json({ success: true, message: 'تم إشعار المريض بجاهزية النتيجة', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/labs/lab-orders  (Doctor/Institution sees orders for their labs)
router.get('/lab-orders', protect, authorize('doctor', 'institution'), async (req, res) => {
  try {
    const ownerQuery = req.user.role === 'doctor' ? { doctor: req.user._id } : { institution: req.user._id };
    const labs = await Lab.find(ownerQuery);
    const labIds = labs.map(l => l._id);
    
    const orders = await LabOrder.find({ lab: { $in: labIds } })
      .populate('patient', 'name email phone')
      .populate('lab', 'name type')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/labs/order/:id/upload  (Doctor/Institution: upload result files)
const upload = require('../middleware/upload');
router.put('/order/:id/upload', protect, authorize('doctor', 'institution'), upload.array('lab', 5), async (req, res) => {
  try {
    const files = (req.files || []).map(f => `/uploads/labs/${f.filename}`);
    const order = await LabOrder.findByIdAndUpdate(
      req.params.id,
      { $push: { resultFiles: { $each: files } }, status: 'ready', resultNotes: req.body.notes },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

    await addNotification(order.patient, {
      message: `✅ نتائج تحاليلك أصبحت جاهزة! يرجى مراجعة لوحة التحكم`,
      type: 'lab',
      link: `/dashboard-patient.html#labs`
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/labs/my-orders  (Patient)
router.get('/my-orders', protect, authorize('patient'), async (req, res) => {
  try {
    const orders = await LabOrder.find({ patient: req.user._id })
      .populate('lab', 'name type address governorate')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
