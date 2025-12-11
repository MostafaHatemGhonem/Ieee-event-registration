import { RegistrationData } from '@/types/registration';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ieeebns.runasp.net/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('auth_token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Auth endpoints return text/plain sometimes or tokens directly
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        } else {
            const textError = await response.text();
            throw new Error(textError || `HTTP error! status: ${response.status}`);
        }
    }
    
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        // Handle non-JSON responses (like success messages)
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return text as unknown as T;
        }
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ==================== User APIs ====================

export async function submitRegistration(
  data: Omit<RegistrationData, 'id' | 'status' | 'createdAt'>,
  paymentImage?: File,
  qrCodeBlob?: Blob
): Promise<any> {
  const formData = new FormData();
  
  // Map frontend field names to backend expected field names
  const fieldMapping: Record<string, string> = {
    'faculty': 'College',  // Backend expects 'College' not 'faculty'
    'paymentCode': 'PaymentCode',  // Backend expects 'PaymentCode'
    'fullNameArabic': 'FullNameArabic',
    'fullNameEnglish': 'FullNameEnglish',
    'nationalId': 'NationalId',
    'age': 'Age',
    'gender': 'Gender',
    'phone': 'Phone',
    'email': 'Email',
    'governorate': 'Governorate',
    'academicYear': 'AcademicYear'
  };

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Use mapped field name if exists, otherwise use original
      const backendKey = fieldMapping[key] || key;
      formData.append(backendKey, value.toString());
    }
  });
  
  if (paymentImage) {
    formData.append('PaymentImage', paymentImage);
  }

  // Add QR Code image if provided
  if (qrCodeBlob) {
    formData.append('QRCodeImage', qrCodeBlob, 'qrcode.png');
  }

  const response = await fetch(`${API_BASE_URL}/Auth/register`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || 'Registration failed');
    } catch {
        throw new Error(errorText || 'Registration failed');
    }
  }

  // Handle potential text response
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ==================== Auth APIs ====================

// Note: Login logic is primarily in authStore, but this helper can be used if needed
export async function loginUser(email: string, password: string): Promise<any> {
    return apiRequest('/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

// ==================== Admin APIs ====================

export async function getAllRegistrations(): Promise<RegistrationData[]> {
  const data = await apiRequest<any[]>('/Admin/attendees');
  
  // Map backend field names to frontend format
  return data.map(item => ({
    id: item.id?.toString(),
    fullNameArabic: item.fullNameArabic || '',
    fullNameEnglish: item.fullNameEnglish || '',
    nationalId: item.nationalID || item.nationalId || '', // Backend uses "nationalID" (capital ID)
    age: item.age?.toString() || '',
    gender: item.gender || '',
    phone: item.phone || '',
    email: item.email || '',
    governorate: item.governorate || '',
    faculty: item.college || item.faculty || '', // Backend uses "college"
    academicYear: item.academicYear || '',
    paymentCode: item.paymentCode || '',
    paymentScreenshot: item.paymentImagePath ? `https://ieeebns.runasp.net/${item.paymentImagePath.replace(/\\/g, '/')}` : undefined, // Convert path to URL
    status: item.status?.toLowerCase() || 'pending', // Backend sends "Pending" (capital), convert to lowercase
    qrCode: item.qrCodePath ? `https://ieeebns.runasp.net/${item.qrCodePath}` : undefined,
    rejectionReason: item.rejectionReason,
    createdAt: item.createdAt,
    checkedIn: !!item.checkInTime,
    checkedInAt: item.checkInTime
  }));
}

export async function approveRegistration(id: string): Promise<any> {
    // User request: http://ieeebns.runasp.net/api/Admin/attendees/1/approve
  return apiRequest(`/Admin/attendees/${id}/approve`, {
    method: 'POST',
  });
}

export async function rejectRegistration(id: string, reason?: string): Promise<any> {
    // User request: http://ieeebns.runasp.net/api/Admin/attendees/1/cancel
  return apiRequest(`/Admin/attendees/${id}/cancel`, {
    method: 'POST', // or DELETE? Postman tree shows DEL Reject, User text says http://../cancel
    // I will try POST first as it's safer for "cancel" actions often defined as RPC.
    body: reason ? JSON.stringify({ reason }) : undefined
  });
}

// ==================== Check-in APIs ====================

export async function checkInAttendee(id: string, nationalId?: string): Promise<any> {
    // User request: http://ieeebns.runasp.net/api/Checkin
    // Backend accepts both attendeeId and nationalId
  return apiRequest('/Checkin', {
    method: 'POST',
    body: JSON.stringify({ 
      attendeeId: id,
      nationalId: nationalId 
    })
  });
}

// Keeping these for compatibility/fallback or if they match other patterns
export async function getStatistics(): Promise<any> {
  // Not provided in list, keeping simple fallback
  const all = await getAllRegistrations();
  return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length, 
      checkedIn: all.filter(r => (r as any).checkedIn).length
  };
}
