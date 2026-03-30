const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../server/models/User');
const Appointment = require('../server/models/Appointment');
const Doctor = require('../server/models/Doctor');
const LabOrder = require('../server/models/LabOrder');

async function runBackup() {
    try {
        console.log('🚀 بدء عملية النسخ الاحتياطي لقاعدة بيانات طبيبي...');
        
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI is not defined in .env');

        await mongoose.connect(mongoUri);
        console.log('📡 متصل بقاعدة البيانات...');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

        const data = {
            users: await User.find().lean(),
            doctors: await Doctor.find().lean(),
            appointments: await Appointment.find().lean(),
            labOrders: await LabOrder.find().lean(),
            meta: {
                timestamp: new Date(),
                version: '1.0'
            }
        };

        const fileName = `full-backup-${timestamp}.json`;
        const filePath = path.join(backupDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`✅ تمت عملية النسخ الاحتياطي بنجاح!`);
        console.log(`📂 الملف: ${filePath}`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ فشل النسخ الاحتياطي:', err);
        process.exit(1);
    }
}

runBackup();
