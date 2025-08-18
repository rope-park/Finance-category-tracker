import React, { createContext, useReducer, useEffect } from 'react';
import type { AuthState, User, LoginFormData, RegisterFormData, AuthResponse, AuthError } from '../types/auth';

// Auth Actions
type AuthAction = 
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: AuthError }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

// Auth Context 타입
interface AuthContextType {
  state: AuthState;
  login: (formData: LoginFormData) => Promise<void>;
  register: (formData: RegisterFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...initialState
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    
    default:
      return state;
  }
};

// Auth Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 페이지 로드 시 저장된 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  // 모의 API 함수들 (실제 프로덕션에서는 실제 API 호출로 대체)
  const mockLogin = async (formData: LoginFormData): Promise<AuthResponse> => {
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
    
    // 간단한 유효성 검사
    if (formData.email === 'test@example.com' && formData.password === 'password123') {
      const user: User = {
        id: '1',
        email: formData.email,
        name: '홍길동',
        profileCompleted: true, // 기존 사용자는 프로필 완성 상태
        createdAt: new Date().toISOString(),
        preferences: {
          currency: 'KRW',
          language: 'ko',
          darkMode: false,
          notifications: {
            budget: true,
            transaction: true,
            email: false
          }
        }
      };
      
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      };
    } else if (formData.email === 'admin@test.com' && formData.password === 'admin123') {
      const user: User = {
        id: 'admin',
        email: formData.email,
        name: '관리자',
        avatar: '', // 관리자 아바타
        phone: '010-1234-5678',
        ageGroup: '30대',
        bio: '가계부 앱 관리자입니다.',
        profileCompleted: true, // 관리자는 프로필 완성 상태
        createdAt: '2024-01-01T00:00:00.000Z',
        preferences: {
          currency: 'KRW',
          language: 'ko',
          darkMode: false,
          notifications: {
            budget: true,
            transaction: true,
            email: true
          }
        }
      };
      
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      };
    } else if (formData.email === 'incomplete@test.com' && formData.password === 'test123') {
      // 프로필 미완성 테스트 계정
      const user: User = {
        id: 'incomplete',
        email: formData.email,
        name: '미완성사용자',
        profileCompleted: false, // 프로필 미완성 상태
        createdAt: '2024-12-01T00:00:00.000Z',
        preferences: {
          currency: 'KRW',
          language: 'ko',
          darkMode: false,
          notifications: {
            budget: true,
            transaction: true,
            email: false
          }
        }
      };
      
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      };
    } else {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const mockRegister = async (formData: RegisterFormData): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 간단한 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }
    
    if (!formData.agreeToTerms) {
      throw new Error('이용약관에 동의해주세요.');
    }
    
    // 이미 존재하는 이메일 시뮬레이션
    if (formData.email === 'existing@example.com') {
      throw new Error('이미 사용중인 이메일입니다.');
    }
    
    const user: User = {
      id: '2',
      email: formData.email,
      name: formData.name,
      profileCompleted: false, // 신규 가입자는 프로필 미완성 상태
      createdAt: new Date().toISOString(),
      preferences: {
        currency: 'KRW',
        language: 'ko',
        darkMode: false,
        notifications: {
          budget: true,
          transaction: true,
          email: false
        }
      }
    };
    
    return {
      user,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now()
    };
  };

  // 로그인 함수
  const login = async (formData: LoginFormData) => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const response = await mockLogin(formData);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      if (formData.rememberMe) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: { 
          code: 'LOGIN_FAILED',
          message: error instanceof Error ? error.message : '로그인에 실패했습니다.'
        }
      });
    }
  };

  // 회원가입 함수
  const register = async (formData: RegisterFormData) => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const response = await mockRegister(formData);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: { 
          code: 'REGISTER_FAILED',
          message: error instanceof Error ? error.message : '회원가입에 실패했습니다.'
        }
      });
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // 에러 클리어
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 사용자 정보 업데이트
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    
    // 로컬 스토리지 업데이트
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
