const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Models
const User = require('../server/models/User');
const Doctor = require('../server/models/Doctor');
const Review = require('../server/models/Review');
const Appointment = require('../server/models/Appointment');

dotenv.config({ path: path.join(__dirname, '../.env') });

const doctorsData = [
  {
    name: 'أحمد علي حسن', email: 'dr.ahmed@test.com', specialization: 'استشاري أمراض القلب والأوعية الدموية',
    department: 'أمراض القلب والأوعية', governorate: 'بغداد', clinicName: 'مركز الحياة للقلب',
    fee: 35000, avatar: 'https://cdn-icons-png.flaticon.com/512/387/387561.png',
    lat: 33.3128, lng: 44.3615
  },
  {
    name: 'سارة محمد جاسم', email: 'dr.sara@test.com', specialization: 'أخصائية طب الأطفال وحديثي الولادة',
    department: 'طب الأطفال', governorate: 'البصرة', clinicName: 'عيادة الطفل السعيد',
    fee: 25000, avatar: 'https://cdn-icons-png.flaticon.com/512/10044/10044733.png',
    lat: 30.5081, lng: 47.7835
  },
  {
    name: 'عمر القيسي', email: 'dr.omar@test.com', specialization: 'جراحة العظام والمفاصل والكسور',
    department: 'جراحة العظام', governorate: 'نينوى', clinicName: 'مجمع ابن النفيس الطبي',
    fee: 30000, avatar: 'https://cdn-icons-png.flaticon.com/512/2751/2751508.png',
    lat: 36.3489, lng: 43.1577
  },
  {
    name: 'ليلى إبراهيم', email: 'dr.layla@test.com', specialization: 'أخصائية الأمراض الجلدية والتجميل',
    department: 'الأمراض الجلدية', governorate: 'أربيل', clinicName: 'مركز ديرما بلس',
    fee: 40000, avatar: 'https://cdn-icons-png.flaticon.com/512/6069/6069189.png',
    lat: 36.1911, lng: 44.0091
  },
  {
    name: 'حسين جواد', email: 'dr.hussein@test.com', specialization: 'أخصائي جراحة المسالك البولية والعقم',
    department: 'المسالك البولية', governorate: 'بابل', clinicName: 'مجمع بابل الجراحي',
    fee: 25000, avatar: 'https://cdn-icons-png.flaticon.com/512/387/387561.png',
    lat: 32.484, lng: 44.430
  },
  {
    name: 'فاطمة الزهراء', email: 'dr.fatima@test.com', specialization: 'استشارية النسائية والتوليد والأمراض النسائية',
    department: 'النساء والتوليد', governorate: 'النجف', clinicName: 'مستشفى مريم للولادة',
    fee: 35000, avatar: 'https://cdn-icons-png.flaticon.com/512/6069/6069189.png',
    lat: 32.025, lng: 44.341
  },
  {
    name: 'مصطفى كمال', email: 'dr.mustafa@test.com', specialization: 'أخصائي طب وجراحة الأذن والأنف والحنجرة',
    department: 'الأنف والأذن والحنجرة', governorate: 'بغداد', clinicName: 'عيادة المنصور التخصصية',
    fee: 30000, avatar: 'https://cdn-icons-png.flaticon.com/512/387/387561.png',
    lat: 33.3421, lng: 44.3852
  },
  {
    name: 'نور الهدى', email: 'dr.noor@test.com', specialization: 'أخصائية طب وجراحة العيون والليزر',
    department: 'طب العيون', governorate: 'كربلاء', clinicName: 'مركز الرؤية للعيون',
    fee: 30000, avatar: 'https://cdn-icons-png.flaticon.com/512/6069/6069189.png',
    lat: 32.616, lng: 44.024
  },
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not defined in .env');
    await mongoose.connect(mongoUri);
    console.log('Connected to Atlas for seeding...');

    // Delete existing test doctors to avoid duplicates and ensure fresh seed
    const emails = doctorsData.map(d => d.email);
    const existingUsers = await User.find({ email: { $in: emails } });
    const userIds = existingUsers.map(u => u._id);
    
    await Doctor.deleteMany({ user: { $in: userIds } });
    await Review.deleteMany({ doctor: { $in: userIds } }); // Simple cleanup
    await User.deleteMany({ email: { $in: emails } });
    
    console.log('Cleaned up previous seed data.');
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const d of doctorsData) {
      // Check if exists
      const existing = await User.findOne({ email: d.email });
      if (existing) {
        console.log(`Doctor ${d.name} already exists, skipping.`);
        continue;
      }

      // 1. Create User
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: hashedPassword,
        phone: '07' + Math.floor(100000000 + Math.random() * 900000000),
        role: 'doctor',
        governorate: d.governorate,
        avatar: d.avatar,
        isTermsAccepted: true
      });

      // 2. Create Doctor Profile
      const doctor = await Doctor.create({
        user: user._id,
        specialization: d.specialization,
        department: d.department,
        governorate: d.governorate,
        clinicName: d.clinicName,
        consultationFee: d.fee,
        location: { lat: d.lat, lng: d.lng },
        bio: `دكتور ${d.name} استشاري في ${d.department} متخصص في علاج الحالات المعقدة ولديه خبرة أكثر من 15 سنة في هذا المجال.`,
        isVerified: true,
        averageRating: 4.5 + Math.random() * 0.5,
        totalReviews: Math.floor(Math.random() * 50) + 10,
        schedule: [
          { day: 'السبت', startTime: '09:00', endTime: '16:00', isAvailable: true },
          { day: 'الأحد', startTime: '09:00', endTime: '16:00', isAvailable: true },
          { day: 'الاثنين', startTime: '09:00', endTime: '16:00', isAvailable: true },
          { day: 'الثلاثاء', startTime: '09:00', endTime: '16:00', isAvailable: true },
          { day: 'الأربعاء', startTime: '09:00', endTime: '16:00', isAvailable: true },
        ]
      });

      // 3. Add fake reviews
      await Review.create({
        doctor: doctor._id,
        patient: user._id, // Just using self as dummy patient
        rating: 5,
        comment: 'طبيب ممتاز وخلوق جداً، عيادة نظيفة ومنظمة.',
      });

      console.log(`Successfully seeded: ${d.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
