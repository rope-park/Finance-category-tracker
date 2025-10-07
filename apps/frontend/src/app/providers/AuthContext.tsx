/**
 * 인증 컨텍스트 및 상태 관리
 * 
 * React Context와 Reducer 패턴을 사용하여 인증 상태를 전역에서 관리
 * 
 * 주요 기능:
 * - 로그인 및 회원가입 처리
 * - 자동 로그인 지원 (저장된 토큰 사용)
 * - 로그아웃 처리 및 상태 초기화
 * - 사용자 정보 업데이트
 */
import React, { useReducer, useEffect, createContext } from 'react';
import type { AuthState, AuthError, User, LoginFormData, RegisterFormData } from '../../index';
import { authAPI, userAPI } from '../services/api';

// 인증 상태 변경을 위한 액션 타입 정의
type AuthAction = 
  | { type: 'AUTH_LOADING' }                                            // 로딩 상태 시작
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }     // 인증 성공 (사용자 정보 + 토큰)
  | { type: 'AUTH_ERROR'; payload: AuthError }                         // 인증 실패 (에러 메시지)
  | { type: 'AUTH_LOGOUT' }                                           // 로그아웃 처리
  | { type: 'CLEAR_ERROR' }                                           // 에러 메시지 클리어
  | { type: 'UPDATE_USER'; payload: Partial<User> };                  // 사용자 정보 업데이트

// AuthContext를 통해 제공되는 메서드들의 타입 정의
interface AuthContextType {
  state: AuthState;                                              // 현재 인증 상태
  login: (formData: LoginFormData) => Promise<void>;            // 로그인 처리 함수
  register: (formData: RegisterFormData) => Promise<void>;      // 회원가입 처리 함수
  logout: () => Promise<void>;                                 // 로그아웃 처리 함수
  clearError: () => void;                                      // 에러 메시지 클리어 함수
  updateUser: (userData: Partial<User>) => Promise<User | void>; // 사용자 정보 업데이트 함수
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);
AuthContext.displayName = 'AuthContext';  // React DevTools에서 식별하기 쉽도록 이름 설정

export { AuthContext };

// 초기 인증 상태 정의
const initialState: AuthState = {
  user: null,                 // 사용자 정보 없음
  token: null,               // 인증 토큰 없음  
  isLoading: false,          // 로딩 상태 아님
  isAuthenticated: false,    // 인증되지 않은 상태
  error: null               // 에러 없음
};

/**
 * 인증 상태를 관리하는 리듀서 함수
 * @param state 현재 인증 상태
 * @param action 인증 상태 변경을 위한 액션
 * @returns 변경된 인증 상태  
 */
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

/**
 * 인증 상태를 관리하는 Provider 컴포넌트
 * @param param0 children - 하위 컴포넌트들
 * @returns {JSX.Element} AuthContext.Provider로 감싼 컴포넌트
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useReducer로 인증 상태를 관리, 복잡한 상태 변경 로직을 체계적으로 처리
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 페이지 로드 시 자동 로그인 처리 - 저장된 토큰으로 사용자 인증 시도
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 저장된 토큰으로 서버에서 현재 사용자 정보를 가져옴
      authAPI.getCurrentUser()
        .then((response) => {
          if (response.success && response.data?.user) {
            // 서버 응답을 클라이언트 User 타입에 맞게 변환
            const user: User = response.data.user as User;
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          } else {
            throw new Error(response.error || response.message || '자동 로그인 실패');
          }
        })
        .catch((error) => {
          // 자동 로그인 실패 시 저장된 데이터를 정리하여 깨끗한 상태로 만듬
          console.error('자동 로그인 실패:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        });
    }
  }, []);

  // 로그인 처리 함수 - 이메일과 비밀번호로 인증하고 사용자 세션을 설정
  const login = async (formData: LoginFormData) => {
    // 로딩 상태 시작 - UI에서 로딩 스피너를 표시하기 위함
    dispatch({ type: 'AUTH_LOADING' });
    try {
      // 서버에 로그인 요청 전송
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      if (response.success && response.data) {
        // 이전 사용자 데이터 정리 후 새로운 데이터 저장
        localStorage.removeItem('user_data');
        localStorage.setItem('auth_token', response.data.token);                    // 인증 토큰 저장
        localStorage.setItem('user_data', JSON.stringify(response.data.user));      // 사용자 정보 저장
        
        // 사용자 ID별로 별도 저장 (다중 계정 지원)
        const userKey = `user_data_${response.data.user.id}`;
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
        
        // TODO: refreshToken 지원 - 현재 백엔드에서 제공하지 않음
        // if (formData.rememberMe && response.data.refreshToken) {
        //   localStorage.setItem('refresh_token', response.data.refreshToken);
        // }
        
        const user: User = response.data.user as User;
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: response.data.token } });
      } else {
        throw new Error(response.error || response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      // 로그인 실패 시 에러 상태로 전환
      dispatch({
        type: 'AUTH_ERROR',
        payload: {
          code: 'LOGIN_FAILED',
          message: error instanceof Error ? error.message : '로그인에 실패했습니다.'
        }
      });
    }
  };

  // 회원가입 처리 함수 - 새로운 계정을 생성하고 자동으로 로그인 처리
  const register = async (formData: RegisterFormData) => {
    // 로딩 상태 시작
    dispatch({ type: 'AUTH_LOADING' });
    try {
      // 서버에 회원가입 요청 전송
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success && response.data) {
        // 회원가입 성공 시 자돐으로 로그인 처리 (로그인과 동일한 로직)
        localStorage.removeItem('user_data');
        localStorage.setItem('auth_token', response.data.token);                    // 인증 토큰 저장
        localStorage.setItem('user_data', JSON.stringify(response.data.user));      // 사용자 정보 저장
        
        // 신규 사용자 ID로 별도 저장
        const userKey = `user_data_${response.data.user.id}`;
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
        
        const user: User = response.data.user as User;
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: response.data.token } });
      } else {
        throw new Error(response.error || response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      // 회원가입 실패 시 에러 상태로 전환
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
        const user: User = response.data.user as User;
        dispatch({ type: 'UPDATE_USER', payload: user });
        const userKey = `user_data_${user.id}`;
        localStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem(userKey, JSON.stringify(user));
        return user;
      } else {
        throw new Error(response.error || response.message || '프로필 업데이트 실패');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  };

  // Context Provider를 통해 상태와 메서드를 하위 컴포넌트에 제공
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