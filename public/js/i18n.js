/**
 * نظام ترجمة منصة طبيبي (Tabibi i18n System)
 * يدعم اللغات: العربية (ar)، الإنجليزية (en)، الكردية (ku)
 */

const translations = {
    ar: {
        app_name: "طبيبي",
        slogan: "أمان • سهولة • صحة",
        search_placeholder: "ابحث عن اسم الطبيب أو العيادة...",
        find_nearest: "📍 الأطباء الأقرب إليك",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        phone: "رقم الهاتف",
        password: "كلمة المرور",
        verify_phone: "تأكيد رقم الهاتف",
        otp_sent: "تم إرسال رمز التحقق إلى هاتفك",
        confirm: "تأكيد",
        cancel: "إلغاء",
        book_now: "احجز موعداً",
        location: "الموقع الجغرافي",
        get_directions: "التوجه عبر خرائط جوجل",
        specialization: "التخصص",
        department: "القسم",
        governorate: "المحافظة",
        about_doctor: "نبذة عن الطبيب",
        patient_reviews: "آراء المرضى",
        open_now: "مفتوح حالياً",
        closed_now: "مغلق حالياً",
        all_govs: "كل المحافظات",
        all_depts: "كل الأقسام",
        // Governorates
        "بغداد": "بغداد", "البصرة": "البصرة", "نينوى": "نينوى", "أربيل": "أربيل", "السليمانية": "السليمانية",
        "دهوك": "دهوك", "كركوك": "كركوك", "النجف": "النجف", "كربلاء": "كربلاء", "بابل": "بابل",
        "الأنبار": "الأنبار", "ذي قار": "ذي قار", "القادسية": "القادسية", "ميسان": "ميسان", "واسط": "واسط",
        "المثنى": "المثنى", "صلاح الدين": "صلاح الدين", "ديالى": "ديالى",
        // Departments
        "الطب الباطني": "الطب الباطني", "طب الأطفال": "طب الأطفال", "النساء والتوليد": "النساء والتوليد",
        "جراحة العظام": "جراحة العظام", "طب العيون": "طب العيون", "طب الأسنان": "طب الأسنان",
        "الأمراض الجلدية": "الأمراض الجلدية", "أمراض القلب": "أمراض القلب", "المختبرات والتحاليل": "المختبرات والتحاليل",
        // Visit Types
        "كشف": "كشف", "متابعة": "متابعة", "استشارة": "استشارة",
        // Days
        "السبت": "السبت", "الأحد": "الأحد", "الاثنين": "الاثنين", "الثلاثاء": "الثلاثاء", "الأربعاء": "الأربعاء", "الخميس": "الخميس", "الجمعة": "الجمعة"
    },
    en: {
        app_name: "Tabibi",
        slogan: "Safety • Ease • Health",
        search_placeholder: "Search for doctor or clinic...",
        find_nearest: "📍 Nearest Doctors to You",
        login: "Login",
        register: "Register",
        phone: "Phone Number",
        password: "Password",
        verify_phone: "Verify Phone",
        otp_sent: "Verification code sent to your phone",
        confirm: "Confirm",
        cancel: "Cancel",
        book_now: "Book Now",
        location: "Location",
        get_directions: "Directions via Google Maps",
        specialization: "Specialization",
        department: "Department",
        governorate: "Governorate",
        about_doctor: "About Doctor",
        patient_reviews: "Patient Reviews",
        open_now: "Open Now",
        closed_now: "Closed Now",
        all_govs: "All Governorates",
        all_depts: "All Departments",
        // Governorates
        "بغداد": "Baghdad", "البصرة": "Basra", "نينوى": "Nineveh", "أربيل": "Erbil", "السليمانية": "Sulaymaniyah",
        "دهوك": "Duhok", "كركوك": "Kirkuk", "النجف": "Najaf", "كربلاء": "Karbala", "بابل": "Babylon",
        "الأنبار": "Anbar", "ذي قار": "Dhi Qar", "القادسية": "Al-Qadisiyah", "ميسان": "Maysan", "واسط": "Wasit",
        "المثنى": "Muthanna", "صلاح الدين": "Saladin", "ديالى": "Diyala",
        // Departments
        "الطب الباطني": "Internal Medicine", "طب الأطفال": "Pediatrics", "النساء والتوليد": "OBGYN",
        "جراحة العظام": "Orthopedics", "طب العيون": "Ophthalmology", "طب الأسنان": "Dentistry",
        "الأمراض الجلدية": "Dermatology", "أمراض القلب": "Cardiology", "المختبرات والتحاليل": "Labs",
        // Visit Types
        "كشف": "Checkup", "متابعة": "Follow-up", "استشارة": "Consultation",
        // Days
        "السبت": "Saturday", "الأحد": "Sunday", "الاثنين": "Monday", "الثلاثاء": "Tuesday", "الأربعاء": "Wednesday", "الخميس": "Thursday", "الجمعة": "Friday"
    },
    ku: {
        app_name: "پزیشکی من",
        slogan: "دڵنیایی • ئاسانی • تەندروستی",
        search_placeholder: "بگەڕێ بۆ پزیشک یان نۆرینگە...",
        find_nearest: "📍 پزیشکە نزیکەکان لێتەوە",
        login: "چوونە ژوورەوە",
        register: "دروستکردنی هەژمار",
        phone: "ژمارەی تەلەفۆن",
        password: "وشەی نهێنی",
        verify_phone: "دڵنیایی ژمارەی تەلەفۆن",
        otp_sent: "کۆدی دڵنیایی نێردرا",
        confirm: "دڵنیایی",
        cancel: "پاشگەزبوونەوە",
        book_now: "نۆرە بگرە",
        location: "شوێنی جوگرافی",
        get_directions: "ئاڕاستەکردن لە ڕێگەی نەخشەی گوگڵ",
        specialization: "پسپۆڕی",
        department: "بەش",
        governorate: "پارێزگا",
        about_doctor: "دەربارەی پزیشک",
        patient_reviews: "ڕای نەخۆشەکان",
        open_now: "ئێستا کراوەیە",
        closed_now: "ئێستا داخراوە",
        all_govs: "هەموو پارێزگاکان",
        all_depts: "هەموو بەشەکان",
        // Governorates
        "بغداد": "بەغدا", "البصرة": "بەسرە", "نينوى": "نەینەوا", "أربيل": "هەولێر", "السليمانية": "سلێمانی",
        "دهوك": "دھۆک", "كركوك": "کەرکووک", "النجف": "نەجەف", "كربلاء": "کەربەلا", "بابل": "بابل",
        "الأنبار": "ئەنبار", "ذي قار": "زیقار", "القادسية": "قادسیە", "ميسان": "میسان", "واسط": "واست",
        "المثنى": "موسەننا", "صلاح الدين": "سەڵاحەدین", "ديالى": "دیالە",
        // Departments
        "الطب الباطني": "پزیشکی ناوخۆ", "طب الأطفال": "پزیشکی منداڵان", "النساء والتوليد": "ئافرەتان و منداڵبوون",
        "جراحة العظام": "نەشتەرگەری ئێسک", "طب العيون": "پزیشکی چاو", "طب الأسنان": "پزیشکی ددان",
        "الأمراض الجلدية": "پزیشکی پێست", "أمراض القلب": "پزیشکی دڵ", "المختبرات والتحاليل": "تاقیگەکان",
        // Visit Types
        "كشف": "پشکنین", "متابعة": "بەدواداچوون", "استشارة": "ڕاوێژ",
        // Days
        "السبت": "شەممە", "الأحد": "یەکشەممە", "الاثنين": "دووشەممە", "الثلاثاء": "سێشەممە", "الأربعاء": "چوارشەممە", "الخميس": "پێنجشەممە", "الجمعة": "هەینی"
    }
};

let currentLang = localStorage.getItem('tabibi_lang') || 'ar';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('tabibi_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
    applyTranslations();
    window.location.reload();
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[currentLang][key];
            } else {
                el.innerText = translations[currentLang][key];
            }
        }
    });
}

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) ? translations[currentLang][key] : key;
}

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = (currentLang === 'en') ? 'ltr' : 'rtl';
    applyTranslations();
});
