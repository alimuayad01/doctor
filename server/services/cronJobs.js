const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { addNotification } = require('./notificationService');

/**
 * Runs every hour to check upcoming appointments and send reminders
 */
const startCronJobs = () => {
  // Every hour: check for appointments in next 1-2 hours
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Appointments in 1-2 hours (hourly reminder)
      const upcomingAppointments = await Appointment.find({
        status: 'confirmed',
        reminderHourSent: false,
        date: { $gte: new Date(now.toDateString()), $lte: new Date(now.toDateString() + ' 23:59') }
      }).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

      for (const appt of upcomingAppointments) {
        const [h, m] = appt.startTime.split(':').map(Number);
        const apptTime = new Date(appt.date);
        apptTime.setHours(h, m, 0, 0);

        const diffMs = apptTime - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 1 && diffHours <= 2) {
          const mins = Math.round(diffMs / (1000 * 60));
          await addNotification(appt.patient, {
            message: `⏰ تذكير: موعدك مع د. ${appt.doctor?.user?.name} بعد ${mins} دقيقة (${appt.startTime})`,
            type: 'appointment',
            data: { appointmentId: appt._id }
          });
          await Appointment.findByIdAndUpdate(appt._id, { reminderHourSent: true });
        }
      }

      console.log(`✅ [CRON] فحص الإشعارات الساعية - ${new Date().toLocaleTimeString('ar-IQ')}`);
    } catch (err) {
      console.error('خطأ في CRON الساعي:', err.message);
    }
  });

  // Every day at 8:00 AM: send day-before reminders
  cron.schedule('0 8 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
      const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

      const appointments = await Appointment.find({
        status: 'confirmed',
        reminderDaySent: false,
        date: { $gte: tomorrowStart, $lte: tomorrowEnd }
      }).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

      for (const appt of appointments) {
        await addNotification(appt.patient, {
          message: `📅 تذكير: لديك موعد غداً مع د. ${appt.doctor?.user?.name} الساعة ${appt.startTime}`,
          type: 'appointment',
          data: { appointmentId: appt._id }
        });
        await Appointment.findByIdAndUpdate(appt._id, { reminderDaySent: true });
      }

      console.log(`✅ [CRON] إرسال تذكيرات اليوم السابق - ${appointments.length} موعد`);
    } catch (err) {
      console.error('خطأ في CRON اليومي:', err.message);
    }
  });

  console.log('⏰ CRON Jobs بدأت بنجاح');
};

module.exports = { startCronJobs };
