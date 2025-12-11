import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== Error Messages ====================

// Error messages mapping (English → Arabic)
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'Failed to fetch': 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت',
  'Network request failed': 'فشل الاتصال بالشبكة',
  'Request timeout': 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى',
  
  // Auth errors
  'Invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Unauthorized': 'غير مصرح لك بالدخول',
  'Token expired': 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
  'فشل تسجيل الدخول': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  
  // Registration errors
  'Registration failed': 'فشل التسجيل. يرجى المحاولة مرة أخرى',
  'Email already exists': 'البريد الإلكتروني مستخدم بالفعل',
  'Invalid email format': 'صيغة البريد الإلكتروني غير صحيحة',
  
  // Admin errors
  'Failed to load registrations': 'فشل تحميل قائمة المسجلين',
  'Failed to approve registration': 'فشلت الموافقة على التسجيل',
  'Failed to reject registration': 'فشل رفض التسجيل',
  
  // Check-in errors
  'Failed to check in': 'فشل تسجيل الحضور',
  'Registration not found': 'لم يتم العثور على التسجيل',
  'Already checked in': 'تم تسجيل الحضور مسبقاً',
  
  // Generic errors
  'An error occurred': 'حدث خطأ. يرجى المحاولة مرة أخرى',
  'Server error': 'خطأ في الخادم. يرجى المحاولة لاحقاً',
  'Bad request': 'طلب غير صحيح',
};

/**
 * Get Arabic error message for English error
 */
export function getArabicError(error: string | Error): string {
  const errorText = error instanceof Error ? error.message : error;
  
  // Check for exact match
  if (ERROR_MESSAGES[errorText]) {
    return ERROR_MESSAGES[errorText];
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorText.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default fallback
  return 'حدث خطأ. يرجى المحاولة مرة أخرى';
}

// ==================== Retry Logic ====================

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on auth errors or client errors (4xx)
      if (lastError.message.includes('Unauthorized') || 
          lastError.message.includes('Invalid credentials') ||
          lastError.message.includes('Bad request')) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      
      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// ==================== Demo Credentials ====================

/**
 * Demo/fallback credentials
 */
export const DEMO_CREDENTIALS = {
  email: 'mostafahatemghone@gmail.com',
  password: '12345678',
};

/**
 * Check if credentials are demo credentials
 */
export function isDemoCredentials(email: string, password: string): boolean {
  return email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
}
