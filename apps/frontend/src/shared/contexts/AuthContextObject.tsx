import { createContext } from 'react';
import type { AuthState, User, RegisterFormData } from '../types/auth';
import type { LoginRequest } from '@finance-tracker/shared';

interface AuthContextType {
  state: AuthState;
  login: (formData: LoginRequest) => Promise<void>;
  register: (formData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<User | void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);