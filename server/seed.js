require('dotenv').config();
const mongoose = require('mongoose');
const { Lab } = require('./models/Lab');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const departments = [
  { name: 'طب الأسنان', icon: '🦷', color: '#E91E63' },
  { name: 'العيون', icon: '👁️', color: '#2196F3' },
  { name: 'القلبية', icon: '❤️', color: '#F44336' },
  { name: 'الجلدية', icon: '✨', color: '#FF9800' },
  { name: 'الأطفال', icon: '👶', color: '#4CAF50' },
  { name: 'النسائية', icon: '🤰', color: '#9C27B0' },
  { name: 'العظام', icon: '🦴', color: '#795548' },
  { name: 'الأنف والأذن', icon: '👂', color: '#607D8B' },
  { name: 'تجميل', icon: '🎭', color: '#FF4081' },
];

const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'بابل', 'الأنبار', 
  'صلاح الدين', 'ديالى', 'كركوك', 'واسط', 'ميسان', 'القادسية', 'ذي قار', 
  'المثنى', 'السليمانية', 'دهوك'
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected for seeding...');

    // Clear existing data (optional, but good for clean seed)
    // await Doctor.deleteMany();
    // await User.deleteMany({ role: 'doctor' });

    // In a real app, you'd create more complex seed data
    // For now, let's just log that we are ready
    console.log('🌱 Databases are ready to receive data.');
    console.log('Departments available:', departments.length);
    console.log('Governorates available:', governorates.length);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
