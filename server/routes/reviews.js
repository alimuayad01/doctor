const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// @route GET /api/reviews/doctor/:doctorId  (Public)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/reviews  (Patient only)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, rating, comment, isAnonymous, appointmentId } = req.body;
    const existing = await Review.findOne({ patient: req.user._id, doctor: doctorId });
    if (existing)
      return res.status(400).json({ success: false, message: 'لقد أضفت تقييماً لهذا الطبيب مسبقاً' });

    const review = await Review.create({
      patient: req.user._id,
      doctor: doctorId,
      appointment: appointmentId,
      rating,
      comment,
      isAnonymous: isAnonymous || false,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'لقد أضفت تقييماً لهذا الطبيب مسبقاً' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/reviews/:id/reply  (Doctor reply)
router.put('/:id/reply', protect, authorize('doctor'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
    review.doctorReply = req.body.reply;
    review.doctorRepliedAt = new Date();
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
