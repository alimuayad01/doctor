/**
 * حفظ بيانات موعد محلياً على جهاز المستخدم (Persistence)
 */
function saveAppointmentLocal(appointment) {
    if (!appointment) return;
    try {
        let appointments = JSON.parse(localStorage.getItem('my_tabibi_appointments') || '[]');
        // منع التكرار
        appointments = appointments.filter(a => a._id !== appointment._id);
        appointments.push(appointment);
        // الاحتفاظ بآخر 20 موعد فقط لتوفير المساحة
        if (appointments.length > 20) appointments.shift();
        localStorage.setItem('my_tabibi_appointments', JSON.stringify(appointments));
        console.log('✅ تم حفظ الموعد محلياً لضمان الوصول السريع');
    } catch (err) {
        console.error('Failed to save locally:', err);
    }
}

/**
 * جلب المواعيد المحفوظة محلياً (للعمل بدون إنترنت)
 */
function getLocalAppointments() {
    try {
        return JSON.parse(localStorage.getItem('my_tabibi_appointments') || '[]');
    } catch {
        return [];
    }
}
