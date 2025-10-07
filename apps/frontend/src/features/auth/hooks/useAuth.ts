/**
 * 인증 관련 훅
 * 
 * 주요 기능:
 * - AuthContext에서 인증 상태 및 메서드 접근
 */
import { useContext } from 'react';
import { AuthContext } from '../../../index';

/**
 * AuthContext에 접근하기 위한 커스텀 훅
 * @returns AuthContext의 값
 * @throws AuthProvider 외부에서 호출 시 에러 발생
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
