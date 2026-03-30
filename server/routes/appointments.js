const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { addNotification } = require('../services/notificationService');

// @route GET /api/appointments/my  (Patient)
router.get('/my', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
      .sort({ date: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/appointments/doctor  (Doctor)
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ success: false, message: 'ملف الطبيب غير موجود' });

    const { date, status } = req.query;
    const query = { doctor: doctorProfile._id };
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = {
        $gte: new Date(d.setHours(0,0,0,0)),
        $lte: new Date(d.setHours(23,59,59,999))
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name avatar phone')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/appointments  (Patient book)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, date, startTime, type, notes } = req.body;
    const doctor = await Doctor.findById(doctorId).populate('user', 'name');
    if (!doctor) return res.status(404).json({ success: false, message: 'الطبيب غير موجود' });
    if (!doctor.isAcceptingAppointments)
      return res.status(400).json({ success: false, message: 'الطبيب لا يقبل مواعيد حالياً' });

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number);
    const slotDuration = doctor.schedule[0]?.slotDuration || 30;
    const endMinutes = h * 60 + m + slotDuration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2,'0')}:${String(endMinutes % 60).padStart(2,'0')}`;

    // Check if slot already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      startTime,
      status: { $nin: ['cancelled', 'no_show'] }
    });
    if (existingAppointment)
      return res.status(400).json({ success: false, message: 'هذا الوقت محجوز مسبقاً' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      startTime,
      endTime,
      duration: slotDuration,
      type: type || 'كشف',
      notes,
      price: doctor.consultationFee,
    });

    // Update doctor stats
    await Doctor.findByIdAndUpdate(doctorId, { $inc: { totalAppointments: 1 } });

    // Notify patient
    await addNotification(req.user._id, {
      message: `✅ تم تأكيد موعدك مع د. ${doctor.user.name} بتاريخ ${new Date(date).toLocaleDateString('ar-IQ')} الساعة ${startTime}`,
      type: 'appointment',
      data: { appointmentId: appointment._id }
    });

    // Notify doctor
    await addNotification(doctor.user._id, {
      message: `📅 موعد جديد: ${req.user.name} بتاريخ ${new Date(date).toLocaleDateString('ar-IQ')} الساعة ${startTime}`,
      type: 'appointment',
      data: { appointmentId: appointment._id }
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'هذا الوقت محجوز مسبقاً' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/appointments/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name _id' } })
      .populate('patient', 'name _id');

    if (!appointment) return res.status(404).json({ success: false, message: 'الموعد غير موجود' });

    // Only patient or doctor can cancel
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctorUser = appointment.doctor.user._id.toString() === req.user._id.toString();
    if (!isPatient && !isDoctorUser && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'لا يمكنك إلغاء هذا الموعد' });

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || '';
    appointment.cancelledBy = isPatient ? 'patient' : 'doctor';
    await appointment.save();

    // Notify the other party
    const notifyUserId = isPatient ? appointment.doctor.user._id : appointment.patient._id;
    const canceller = isPatient ? `المريض ${appointment.patient.name}` : `الدكتور ${appointment.doctor.user.name}`;
    await addNotification(notifyUserId, {
      message: `❌ تم إلغاء الموعد بتاريخ ${new Date(appointment.date).toLocaleDateString('ar-IQ')} من قِبل ${canceller}`,
      type: 'appointment',
      data: { appointmentId: appointment._id }
    });

    res.json({ success: true, message: 'تم إلغاء الموعد', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/appointments/:id/complete  (Doctor)
router.put('/:id/complete', protect, authorize('doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: 'completed' }, { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    res.json({ success: true, message: 'تم تعليم الموعد كمكتمل', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
