'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface DoctorInfo {
  license_number: string;
  specialization: string;
  hospital_affiliation: string;
  years_of_experience: number;
  education: string;
  verification_documents: string[];
  verification_status?: 'pending' | 'approved' | 'rejected';
}

interface User {
  id: number;
  email: string;
  name: string;
  phone_number: string;
  role: 'patient' | 'doctor' | 'admin';
  doctor_info?: DoctorInfo;
  imageUrl?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
  onboarding_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string, 
    password: string, 
    name: string, 
    phone_number: string,
    doctor_info?: DoctorInfo
  ) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8888';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored auth token and user data on component mount
    const token = Cookies.get('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        Cookies.remove('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Authentication failed');
    }

    const data: AuthResponse = await response.json();

    if (!data.token || !data.user) {
      throw new Error('Invalid response from server');
    }

    // Store token in both localStorage and cookies
    Cookies.set('token', data.token, { 
      expires: 30, // 30 days
      path: '/',
      sameSite: 'Lax'
    });
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

    // If doctor registration is pending verification
    if (data.user.role === 'doctor' && data.user.doctor_info?.verification_status === 'pending') {
      router.push('/verification-pending');
      return;
    }

    // If onboarding is not completed, redirect to onboarding
    if (data.onboarding_completed === false) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }

    return data;
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      console.log('Attempting login with:', { email });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      await handleAuthResponse(response);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    phone_number: string,
    doctor_info?: DoctorInfo
  ) => {
    try {
      if (!email || !password || !name || !phone_number) {
        throw new Error('Please fill in all required fields');
      }

      const role = doctor_info ? 'doctor' : 'patient';
      console.log('Attempting registration with:', { email, name, phone_number, role });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          phone_number,
          role,
          doctor_info
        }),
      });

      await handleAuthResponse(response);
      
      if (role === 'doctor') {
        toast.success('Registration successful! Your account is pending verification.');
      } else {
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const forgotPassword = async (email: string) => {
    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process password reset request');
      }

      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to process request');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
