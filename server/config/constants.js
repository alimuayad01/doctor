const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية',
  'كركوك', 'ديالى', 'الأنبار', 'بابل', 'كربلاء',
  'النجف', 'ذي قار', 'ميسان', 'المثنى', 'القادسية',
  'صلاح الدين', 'واسط', 'دهوك'
];

const MEDICAL_DEPARTMENTS = [
  { name: 'الطب الباطني', icon: '🫀', color: '#E74C3C' },
  { name: 'الجراحة العامة', icon: '🔪', color: '#8E44AD' },
  { name: 'طب الأطفال', icon: '👶', color: '#3498DB' },
  { name: 'النساء والتوليد', icon: '🤰', color: '#E91E8C' },
  { name: 'جراحة العظام', icon: '🦴', color: '#795548' },
  { name: 'طب العيون', icon: '👁️', color: '#00BCD4' },
  { name: 'الأنف والأذن والحنجرة', icon: '👂', color: '#FF9800' },
  { name: 'طب الأسنان', icon: '🦷', color: '#4CAF50' },
  { name: 'الأمراض الجلدية', icon: '🧴', color: '#FF7043' },
  { name: 'أمراض القلب والأوعية', icon: '❤️', color: '#F44336' },
  { name: 'المختبرات والتحاليل', icon: '🔬', color: '#9C27B0' },
  { name: 'الأشعة والتصوير', icon: '🩻', color: '#607D8B' },
  { name: 'الطب النفسي', icon: '🧠', color: '#673AB7' },
  { name: 'الأمراض العصبية', icon: '⚡', color: '#2196F3' },
  { name: 'الغدد الصماء', icon: '💉', color: '#009688' },
  { name: 'أمراض الكلى', icon: '🫘', color: '#FF5722' },
  { name: 'الجهاز الهضمي', icon: '🫁', color: '#8BC34A' },
  { name: 'الأمراض الصدرية والتنفسية', icon: '🫁', color: '#03A9F4' },
  { name: 'المسالك البولية', icon: '🔵', color: '#00ACC1' },
  { name: 'التخدير والإنعاش', icon: '😴', color: '#546E7A' },
];

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
};

const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  INSTITUTION: 'institution',
  ADMIN: 'admin',
};

module.exports = { GOVERNORATES, MEDICAL_DEPARTMENTS, APPOINTMENT_STATUS, USER_ROLES };
