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

// API Base URL - Using production API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ieeebns.runasp.net/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Send both username and email to match backend expectations
          const payload = { username: email, email, password };

          const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorMessage = 'فشل تسجيل الدخول';
            
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const error = await response.json();
              errorMessage = error.message || errorMessage;
            } else {
              const textError = await response.text();
              errorMessage = textError || errorMessage;
            }
            
            throw new Error(errorMessage);
          }

          const contentType = response.headers.get("content-type");
          let data: any;
          
          if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
          } else {
            // If backend returns just a token as text
            const token = await response.text();
            data = { token, user: { id: email, email, name: email, role: 'admin' } };
          }
          
          const token = data.token || data.accessToken || data.jwtToken || data;
          const user = data.user || { id: email, email, name: email, role: 'admin' };

          set({
            user,
            token,
            isAuthenticated: true,
          });

          // حفظ التوكن في localStorage
          localStorage.setItem('auth_token', token);
        } catch (error) {
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
