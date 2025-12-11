import { RegistrationData } from '@/types/registration';

// Mock storage for demo - will be replaced with Supabase
const STORAGE_KEY = 'ieee_registrations';

export const getRegistrations = (): RegistrationData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRegistration = (registration: RegistrationData): RegistrationData => {
  const registrations = getRegistrations();
  const newRegistration = {
    ...registration,
    id: crypto.randomUUID(),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  registrations.push(newRegistration);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  return newRegistration;
};

export const updateRegistration = (id: string, updates: Partial<RegistrationData>): RegistrationData | null => {
  const registrations = getRegistrations();
  const index = registrations.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  registrations[index] = { ...registrations[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  return registrations[index];
};

export const generateQRCode = (id: string): string => {
  // Generate a simple QR code data URL using a public API
  const data = `IEEE-BSU-${id}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
};

export const approveRegistration = (id: string): RegistrationData | null => {
  const qrCode = generateQRCode(id);
  return updateRegistration(id, { status: 'approved', qrCode });
};

export const rejectRegistration = (id: string, reason: string): RegistrationData | null => {
  return updateRegistration(id, { status: 'rejected', rejectionReason: reason });
};

export const checkInAttendee = (id: string): RegistrationData | null => {
  return updateRegistration(id, { checkedIn: true, checkedInAt: new Date().toISOString() });
};

export const findRegistrationByQR = (qrData: string): RegistrationData | null => {
  const registrations = getRegistrations();
  // Extract ID from QR data format: IEEE-BSU-{id}
  const idMatch = qrData.match(/IEEE-BSU-(.+)/);
  if (!idMatch) return null;
  
  return registrations.find(r => r.id === idMatch[1]) || null;
};
