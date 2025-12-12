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
    isIEEEIAN?: boolean; // Whether user is an IEEE member
    checkInTime?: string | null; // ISO datetime or null if not checked in
    checkedIn?: boolean; // Computed from checkInTime
    checkedInAt?: string; // Alias for checkInTime
    createdAt: string; // ISO datetime when registration was created
    rejectionReason?: string;
    // Frontend-only fields
    faculty?: string; // Mapped from college for backwards compatibility
}

export const GOVERNORATES = [
    "Cairo",
    "Giza",
    "Alexandria",
    "Dakahlia",
    "Red Sea",
    "Beheira",
    "Fayoum",
    "Gharbia",
    "Ismailia",
    "Monufia",
    "Minya",
    "Qalyubia",
    "New Valley",
    "Suez",
    "Aswan",
    "Assiut",
    "Beni Suef",
    "Port Said",
    "Damietta",
    "Sharqia",
    "South Sinai",
    "Kafr El Sheikh",
    "Matrouh",
    "Luxor",
    "Qena",
    "North Sinai",
    "Sohag",
];

export const FACULTIES = [
    "Faculty of Engineering",
    "Faculty of Medicine",
    "Faculty of Pharmacy",
    "Faculty of Science",
    "Faculty of Commerce",
    "Faculty of Arts",
    "Faculty of Law",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Computers and Information",
    "Faculty of Education",
    "Faculty of Veterinary Medicine",
    "Faculty of Philosophy",
    "Faculty of Tourism and Hotels",
    "Faculty of Fine Arts",
    "Faculty of Dentistry",
    "Faculty of Technological Engineering",
    "Faculty of Applied Sciences",
    "Faculty of Navigation Sciences and Space Technology",
    "Other",
];


export const ACADEMIC_YEARS = [
    "First Year",
    "Second Year",
    "Third Year",
    "Fourth Year",
    "Fifth Year",
    "Graduate",
];
