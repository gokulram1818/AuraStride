import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  username?: string;
  profileCompleted: boolean;
  weightUnit?: 'kg' | 'lbs';
  heightUnit?: 'cm' | 'inches';
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  experienceLevel?: string;
  goal?: string;
  bmi?: number;
  targetWeight?: number;
  targetTimelineWeeks?: number;
  activeWorkoutProgram?: any;
  streak: number;
  lastActiveDate?: string;
  startingWeight?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  submitSurvey: (surveyData: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<any>;
  refreshUser: () => Promise<void>;
  theme: 'Dark Mode' | 'AMOLED Black' | 'Light Theme';
  setTheme: (theme: 'Dark Mode' | 'AMOLED Black' | 'Light Theme') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<'Dark Mode' | 'AMOLED Black' | 'Light Theme'>('Dark Mode');

  // Check for stored token and user on mount
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        const storedTheme = await AsyncStorage.getItem('theme');

        if (storedTheme) {
          setThemeState(storedTheme as any);
        }

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify/refresh user data in the background
          fetchUserData(storedToken);
        }
      } catch (e) {
        console.error('Failed to load auth data from storage:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const setTheme = async (newTheme: 'Dark Mode' | 'AMOLED Black' | 'Light Theme') => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to storage:', e);
    }
  };

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const freshUser = await response.json();
        if (freshUser) {
          setUser(freshUser);
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        } else {
          await clearSession();
        }
      } else if (response.status === 401) {
        // Token expired/invalid, clear session
        await clearSession();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const clearSession = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      setToken(data.token);
      await AsyncStorage.setItem('token', data.token);
      
      // Fetch fully populated user profile
      await fetchUserData(data.token);
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }

      setToken(data.token);
      await AsyncStorage.setItem('token', data.token);
      
      const newUser: User = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        profileCompleted: false,
        streak: 0
      };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await clearSession();
    router.replace('/auth/login');
  };

  const submitSurvey = async (surveyData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/survey`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to submit survey');
      }

      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update profile');
      }

      setUser(data);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserData(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        submitSurvey,
        updateProfile,
        refreshUser,
        theme,
        setTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
