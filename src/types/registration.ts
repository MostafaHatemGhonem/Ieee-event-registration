export interface RegistrationData {
    id: string;
    fullNameArabic: string;
    fullNameEnglish: string;
    phone: string;
    governorate: string;
    nationalId: string; // National ID number
    college: string; // College/Faculty code or name
    academicYear: string; // Academic year (1, 2, 3, 4, 5, or 'خريج')
    email: string;
    age: number | string;
    gender: "Male" | "Female" | string;
    paymentCode: string;
    paymentImagePath?: string; // Path to payment proof image
    paymentScreenshot?: File | string; // For form submission or display
    status: "Pending" | "Approved" | "Rejected"; // Backend uses capitalized status
    qrCodePath?: string; // Path to QR code image
    qrCode?: string; // Full URL to QR code
    isNeedBus: boolean; // Whether attendee needs bus transportation
    checkInTime?: string | null; // ISO datetime or null if not checked in
    checkedIn?: boolean; // Computed from checkInTime
    checkedInAt?: string; // Alias for checkInTime
    createdAt: string; // ISO datetime when registration was created
    rejectionReason?: string;
    // Frontend-only fields
    faculty?: string; // Mapped from college for backwards compatibility
}

export const GOVERNORATES = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "البحر الأحمر",
    "البحيرة",
    "الفيوم",
    "الغربية",
    "الإسماعيلية",
    "المنوفية",
    "المنيا",
    "القليوبية",
    "الوادي الجديد",
    "السويس",
    "أسوان",
    "أسيوط",
    "بني سويف",
    "بورسعيد",
    "دمياط",
    "الشرقية",
    "جنوب سيناء",
    "كفر الشيخ",
    "مطروح",
    "الأقصر",
    "قنا",
    "شمال سيناء",
    "سوهاج",
];

export const FACULTIES = [
    "كلية الهندسة",
    "كلية الطب",
    "كلية الصيدلة",
    "كلية العلوم",
    "كلية التجارة",
    "كلية الآداب",
    "كلية الحقوق",
    "كلية الزراعة",
    "كلية التمريض",
    "كلية الحاسبات والمعلومات",
    "كلية التربية",
    "كلية الطب البيطري",
    "كلية الفلسفة",
    "كلية السياحة والفنادق",
    "كلية الفنون الجميلة",
    "كلية طب الأسنان",
    "كلية الهندسة التكنولوجية",
    "كلية العلوم التطبيقية",
    "كلية علوم الملاحة وتكنولوجيا الفضاء",
    "أخرى",
];

export const ACADEMIC_YEARS = [
    "السنة الأولى",
    "السنة الثانية",
    "السنة الثالثة",
    "السنة الرابعة",
    "السنة الخامسة",
    "خريج",
];
