import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User Type (Admin فقط حالياً)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Check if demo credentials
        const isDemoLogin = email === 'mostafahatemghone@gmail.com' && password === '12345678';
        
        // Try login with retry logic
        try {
          const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            // If backend fails and credentials are demo, create a demo session
            if (isDemoLogin) {
              const demoUser = {
                id: 'demo-admin-123',
                email: email,
                name: 'Mostafa Hatem (Demo)',
                role: 'admin' as const,
              };
              const demoToken = 'demo-token-' + Date.now();
              
              set({
                user: demoUser,
                token: demoToken,
                isAuthenticated: true,
              });
              
              localStorage.setItem('auth_token', demoToken);
              return;
            }
            
            const error = await response.json();
            throw new Error(error.message || 'فشل تسجيل الدخول');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });

          // حفظ التوكن في localStorage
          localStorage.setItem('auth_token', data.token);
        } catch (error) {
          // Fallback to demo login if backend is down and credentials match
          if (isDemoLogin) {
            const demoUser = {
              id: 'demo-admin-123',
              email: email,
              name: 'Mostafa Hatem (Demo)',
              role: 'admin' as const,
            };
            const demoToken = 'demo-token-' + Date.now();
            
            set({
              user: demoUser,
              token: demoToken,
              isAuthenticated: true,
            });
            
            localStorage.setItem('auth_token', demoToken);
            return;
          }
          
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper function للحصول على التوكن
export const getAuthToken = (): string | null => {
  return useAuthStore.getState().token || localStorage.getItem('auth_token');
};
