const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB متصل: ${conn.connection.host}`);
  } catch (err) {
    console.error('⚠️ خطأ في الاتصال بقاعدة البيانات (لم يتم الربط حالياً):', err.message);
    console.log('💡 يرجى التأكد من تشغيل MongoDB محلياً أو وضع رابط Atlas في ملف .env');
  }
};

module.exports = connectDB;
