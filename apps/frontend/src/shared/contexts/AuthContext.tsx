import React, { useReducer, useEffect } from 'react';
import type { 
  LoginRequest
} from '@finance-tracker/shared';
import type { AuthState, AuthError, User, LoginFormData, RegisterFormData } from '../types/auth';
import { authAPI, userAPI } from '../services/api';
import { AuthContext } from './AuthContextObject';

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
  login: (formData: LoginRequest) => Promise<void>;
  register: (formData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<User | void>;
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
}

// Auth Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 페이지 로드 시 저장된 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authAPI.getCurrentUser()
        .then((response) => {
          if (response.success && response.data?.user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data.user, token } });
          } else {
            throw new Error(response.error || response.message || '자동 로그인 실패');
          }
        })
        .catch((error) => {
          console.error('자동 로그인 실패:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        });
    }
  }, []);

  // 로그인 함수
  const login = async (formData: LoginFormData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      if (response.success && response.data) {
        localStorage.removeItem('user_data');
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        const userKey = `user_data_${response.data.user.id}`;
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
  // refreshToken은 ApiResponse<{user, token}>에는 없음. 필요시 백엔드 응답 타입 확장 필요
  // if (formData.rememberMe && response.data.refreshToken) {
  //   localStorage.setItem('refresh_token', response.data.refreshToken);
  // }
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data.user, token: response.data.token } });
      } else {
        throw new Error(response.error || response.message || '로그인에 실패했습니다.');
      }
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
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      if (response.success && response.data) {
        localStorage.removeItem('user_data');
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        const userKey = `user_data_${response.data.user.id}`;
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data.user, token: response.data.token } });
      } else {
        throw new Error(response.error || response.message || '회원가입에 실패했습니다.');
      }
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
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      await authAPI.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      // API 실패해도 클라이언트는 로그아웃 처리
    }
    
    // 현재 사용자의 모든 localStorage 데이터 제거
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('refresh_token');
    
    // 사용자별 저장된 데이터도 제거 (현재 사용자만)
    if (state.user) {
      const userKey = `user_data_${state.user.id}`;
      localStorage.removeItem(userKey);
    }
    
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // 에러 클리어
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 사용자 정보 업데이트
  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return;
    try {
      const response = await userAPI.updateProfile({
        name: userData.name,
        profile_picture: userData.profile_picture,
        phone_number: userData.phone_number,
        age_group: userData.age_group,
        bio: userData.bio
      });
      if (response.success && response.data?.user) {
        dispatch({ type: 'UPDATE_USER', payload: response.data.user });
        const userKey = `user_data_${response.data.user.id}`;
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        throw new Error(response.error || response.message || '프로필 업데이트 실패');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
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
