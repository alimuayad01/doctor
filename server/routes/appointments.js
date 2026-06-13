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

// @route GET /api/appointments/booked/:doctorId (Public - for booking)
router.get('/booked/:doctorId', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'التاريخ مطلوب' });

    const d = new Date(date);
    const query = {
      doctor: req.params.doctorId,
      date: {
        $gte: new Date(d.setHours(0,0,0,0)),
        $lte: new Date(d.setHours(23,59,59,999))
      },
      status: { $nin: ['cancelled', 'no_show'] }
    };

    const appointments = await Appointment.find(query).select('startTime endTime');
    res.json({ success: true, bookedSlots: appointments.map(a => a.startTime) });
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

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const casesUploadDir = path.join(process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads'), 'cases');
if (!fs.existsSync(casesUploadDir)) fs.mkdirSync(casesUploadDir, { recursive: true });

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, casesUploadDir),
  filename: (req, file, cb) => cb(null, `case-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('نوع صورة الحالة غير مسموح به'));
  }
});

const allowedPaymentMethods = ['cash', 'zaincash', 'mastercard'];

// @route POST /api/appointments  (Patient book)
router.post('/', protect, authorize('patient'), upload.single('caseImage'), async (req, res) => {
  try {
    const { doctorId, date, startTime, type, notes, priority, paymentMethod = 'cash', paymentAccountId } = req.body;
    const doctor = await Doctor.findById(doctorId).populate('user', 'name');
    if (!doctor) return res.status(404).json({ success: false, message: 'الطبيب غير موجود' });
    if (!date || !startTime) return res.status(400).json({ success: false, message: 'التاريخ والوقت مطلوبان' });
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'طريقة الدفع غير صحيحة' });
    }
    
    if (!doctor.isAcceptingAppointments)
      return res.status(400).json({ success: false, message: 'الطبيب لا يقبل مواعيد حالياً' });

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number);
    const slotDuration = doctor.schedule[0]?.slotDuration || 30;
    const endMinutes = h * 60 + m + slotDuration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2,'0')}:${String(endMinutes % 60).padStart(2,'0')}`;

    // Calculate Price based on priority
    let price = doctor.consultationFee || 25000;
    if (priority === 'urgent') price = doctor.specialConsultationFee || (price + 5000);
    if (priority === 'emergency') price = doctor.emergencyConsultationFee || (price + 10000);

    // Auto-approve logic
    const isAutoApprove = (doctor.autoApprove && doctor.autoApprove[priority || 'normal']);
    const status = isAutoApprove ? 'confirmed' : 'pending';

    const isDigitalPayment = paymentMethod !== 'cash';
    let selectedPaymentAccountId = null;
    if (isDigitalPayment) {
      if (!paymentAccountId) {
        return res.status(400).json({ success: false, message: 'يرجى اختيار وسيلة دفع محفوظة' });
      }
      const patient = await User.findById(req.user._id).select('paymentAccounts');
      const account = patient.paymentAccounts.id(paymentAccountId);
      const isMatchingAccount = account && (
        (paymentMethod === 'zaincash' && account.accountType === 'zaincash') ||
        (paymentMethod === 'mastercard' && account.accountType === 'card')
      );
      if (!isMatchingAccount) {
        return res.status(400).json({ success: false, message: 'وسيلة الدفع المختارة غير صالحة لهذا الحجز' });
      }
      selectedPaymentAccountId = account._id;
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      startTime,
      endTime,
      duration: slotDuration,
      type: type || 'اعتيادي',
      priority: priority || 'normal',
      notes,
      price,
      paymentMethod,
      paymentAccountId: selectedPaymentAccountId,
      transactionId: isDigitalPayment ? `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}` : null,
      isPaid: isDigitalPayment,
      caseImage: req.file ? `/uploads/cases/${req.file.filename}` : null,
      status
    });

    await Doctor.findByIdAndUpdate(doctorId, { $inc: { totalAppointments: 1 } });

    // Notify doctor
    const notifMsg = isAutoApprove 
      ? `✅ تم قبول موعد تلقائياً: ${req.user.name} (${priority || 'اعتيادي'})`
      : `📅 طلب حجز جديد بحاجة لموافقتك: ${req.user.name} (${priority || 'اعتيادي'})`;
      
    await addNotification(doctor.user._id, {
      message: notifMsg,
      type: 'appointment',
      data: { appointmentId: appointment._id }
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/appointments/:id/approve (Doctor)
router.put('/:id/approve', protect, authorize('doctor'), async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id).populate('doctor').populate('patient');
      if (!appointment) return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
      
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (appointment.doctor._id.toString() !== doctorProfile._id.toString())
        return res.status(403).json({ success: false, message: 'غير مصرح لك بالموافقة على هذا الموعد' });
  
      appointment.status = 'confirmed';
      await appointment.save();
  
      await addNotification(appointment.patient._id, {
        message: `✅ تمت الموافقة على حجزك مع د. ${req.user.name} بتاريخ ${new Date(appointment.date).toLocaleDateString('ar-IQ')} الساعة ${appointment.startTime}`,
        type: 'appointment',
        data: { appointmentId: appointment._id }
      });
  
      res.json({ success: true, message: 'تمت الموافقة على الموعد', appointment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  
  // @route PUT /api/appointments/:id/reject (Doctor)
  router.put('/:id/reject', protect, authorize('doctor'), async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
  
      appointment.status = 'rejected';
      await appointment.save();
  
      await addNotification(appointment.patient, {
        message: `❌ عذراً، تم رفض طلب حجزك مع د. ${req.user.name}. يرجى محاولة حجز موعد آخر.`,
        type: 'appointment'
      });
  
      res.json({ success: true, message: 'تم رفض الموعد' });
    } catch (err) {
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
