const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/doctors  (Public - Search)
router.get('/', async (req, res) => {
  try {
    const { governorate, department, specialization, name, page = 1, limit = 12 } = req.query;
    const query = { isAcceptingAppointments: true };
    if (governorate) query.governorate = governorate;
    if (department) query.department = department;
    if (specialization) query.specialization = new RegExp(specialization, 'i');

    let doctors = await Doctor.find(query)
      .populate('user', 'name avatar phone')
      .populate('institution', 'institutionName type')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, totalAppointments: -1 });

    // Filter by name
    if (name) {
      doctors = doctors.filter(d => d.user && d.user.name.includes(name));
    }

    const total = await Doctor.countDocuments(query);
    res.json({ success: true, doctors, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/doctors/:id  (Public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name avatar phone email governorate')
      .populate('institution', 'institutionName type address phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'الطبيب غير موجود' });

    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, doctor, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/doctors/:id/available-slots  (Public)
router.get('/:id/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'التاريخ مطلوب' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'الطبيب غير موجود' });

    const requestedDate = new Date(date);
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = dayNames[requestedDate.getDay()];

    // Check if doctor works this day
    const daySchedule = doctor.schedule.find(s => s.day === dayName && s.isAvailable);
    if (!daySchedule) return res.json({ success: true, slots: [], message: 'الطبيب لا يعمل في هذا اليوم' });

    // Check if date is blocked
    const isBlocked = doctor.blockedDates.some(d =>
      new Date(d).toDateString() === requestedDate.toDateString()
    );
    if (isBlocked) return res.json({ success: true, slots: [], message: 'هذا اليوم محجوز' });

    // Generate all slots
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);
    const duration = daySchedule.slotDuration;
    const slots = [];
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = String(Math.floor(current / 60)).padStart(2, '0');
      const m = String(current % 60).padStart(2, '0');
      slots.push(`${h}:${m}`);
      current += duration;
    }

    // Get booked slots for that date
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: { $nin: ['cancelled', 'no_show'] }
    });
    const bookedTimes = bookedAppointments.map(a => a.startTime);

    // Return slots with availability status
    const slotsWithStatus = slots.map(slot => ({
      time: slot,
      isBooked: bookedTimes.includes(slot),
    }));

    res.json({ success: true, slots: slotsWithStatus, duration: daySchedule.slotDuration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/doctors/profile  (Doctor only)
router.put('/profile', protect, authorize('doctor'), upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'credential', maxCount: 10 }
]), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'ملف الطبيب غير موجود' });

    const {
      bio, clinicName, clinicAddress, clinicPhone, consultationFee,
      specialization, department, address, isAcceptingAppointments
    } = req.body;

    if (bio) doctor.bio = bio;
    if (clinicName) doctor.clinicName = clinicName;
    if (clinicAddress) doctor.clinicAddress = clinicAddress;
    if (clinicPhone) doctor.clinicPhone = clinicPhone;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (specialization) doctor.specialization = specialization;
    if (department) doctor.department = department;
    if (address) doctor.address = address;
    if (isAcceptingAppointments !== undefined) doctor.isAcceptingAppointments = isAcceptingAppointments;

    // Handle avatar
    if (req.files && req.files.avatar) {
      await User.findByIdAndUpdate(req.user._id, { avatar: `/uploads/avatars/${req.files.avatar[0].filename}` });
    }

    // Handle credentials
    if (req.files && req.files.credential) {
      req.files.credential.forEach((file, i) => {
        const credentialData = JSON.parse(req.body[`credential_${i}`] || '{}');
        doctor.credentials.push({ ...credentialData, fileUrl: `/uploads/credentials/${file.filename}` });
      });
    }

    // Handle new credential without file
    if (req.body.newCredential) {
      const cred = JSON.parse(req.body.newCredential);
      doctor.credentials.push(cred);
    }

    await doctor.save();
    res.json({ success: true, message: 'تم تحديث الملف الشخصي بنجاح', doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/doctors/schedule  (Doctor only)
router.put('/schedule', protect, authorize('doctor'), async (req, res) => {
  try {
    const { schedule, blockedDates } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'ملف الطبيب غير موجود' });

    if (schedule) doctor.schedule = schedule;
    if (blockedDates) doctor.blockedDates = blockedDates;

    await doctor.save();
    res.json({ success: true, message: 'تم تحديث الجدول بنجاح', schedule: doctor.schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
