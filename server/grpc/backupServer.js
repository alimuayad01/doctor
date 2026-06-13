const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const PROTO_PATH = path.join(__dirname, 'protos/backup.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const backupProto = grpc.loadPackageDefinition(packageDefinition).backup;

/**
 * تنفيذ النسخ الاحتياطي للبيانات (Logical Backup)
 */
async function triggerBackup(call, callback) {
  try {
    const prefix = call.request.prefix || 'auto';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${prefix}-${timestamp}.json`;
    const backupDir = process.env.BACKUPS_DIR || path.join(__dirname, '../../backups');
    
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    // استخراج البيانات الهامة
    const users = await User.find().lean();
    const appointments = await Appointment.find().lean();
    
    const backupContent = {
      timestamp: new Date(),
      version: '1.0',
      data: { users, appointments }
    };
    
    fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(backupContent, null, 2));
    
    console.log(`✅ [gRPC] تم إنشاء نسخة احتياطية: ${fileName}`);
    callback(null, { 
      success: true, 
      message: 'تمت عملية النسخ الاحتياطي بنجاح عبر gRPC', 
      fileName 
    });
  } catch (err) {
    console.error('❌ [gRPC] فشل النسخ الاحتياطي:', err);
    callback({ code: grpc.status.INTERNAL, message: 'فشل الخادم الداخلي في إجراء النسخ' });
  }
}

/**
 * جلب إحصائيات سريعة للنظام
 */
async function getStats(call, callback) {
  try {
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    callback(null, { totalUsers, totalAppointments, lastBackup: 'اليوم' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(backupProto.BackupService.service, { triggerBackup, getStats });
  const GRPC_PORT = process.env.GRPC_PORT || '50051';
  
  server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(`❌ [gRPC] فشل تشغيل الخادم: ${err.message}`);
        return;
    }
    console.log(`🚀 خادم gRPC المخصص للتأمين يعمل على المنفذ: ${port}`);
  });
}

module.exports = { startGrpcServer };
