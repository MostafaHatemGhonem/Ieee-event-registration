export interface RegistrationData {
  id?: string;
  fullNameArabic: string;
  fullNameEnglish: string;
  phone: string;
  governorate: string;
  nationalId: string;
  faculty: string;
  academicYear: string;
  email: string;
  age: string;
  gender: string;
  paymentCode?: string; // اختياري
  paymentScreenshot?: File | string;
  status: 'pending' | 'approved' | 'rejected';
  qrCode?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  createdAt?: string;
  rejectionReason?: string;
}

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج'
];

export const FACULTIES = [
  'كلية الهندسة',
  'كلية العلوم',
  'كلية الحاسبات والمعلومات',
  'كلية التجارة',
  'كلية الآداب',
  'كلية الطب',
  'كلية الصيدلة',
  'كلية طب الأسنان',
  'كلية التمريض',
  'كلية الزراعة',
  'كلية الحقوق',
  'كلية التربية',
  'أخرى'
];

export const ACADEMIC_YEARS = [
  'السنة الأولى',
  'السنة الثانية',
  'السنة الثالثة',
  'السنة الرابعة',
  'السنة الخامسة',
  'خريج'
];
