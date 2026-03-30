/**
 * خدمة إرسال الرسائل القصيرة (SMS) - محاكاة (Mock) في الوقت الحالي
 */
class SMSService {
  /**
   * إرسال رمز التحقق (OTP)
   * @param {string} phone 
   * @param {string} code 
   */
  static async sendVerificationOTP(phone, code) {
    console.log(`\n📱 [SMS Gateway] إرسال رسالة إلى: ${phone}`);
    console.log(`💬 المحتوى: رمز التحقق الخاص بك في منصة طبيبي هو: ${code}. يرجى عدم مشاركته مع أحد.`);
    console.log(`⏳ صالح لمدة 10 دقائق.\n`);
    
    // محاكاة تأخير الشبكة لتبدو التجربة حقيقية
    return new Promise(resolve => setTimeout(resolve, 1500));
  }

  /**
   * إرسال تأشيرة حجز موعد
   */
  static async sendAppointmentConfirmation(phone, data) {
    console.log(`📱 [SMS] إشعار موعد مُرسل إلى ${phone}: تم تأكيد موعدك مع ${data.doctor} في الساعة ${data.time}.`);
  }
}

module.exports = SMSService;
